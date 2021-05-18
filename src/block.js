import Wallet from "./wallet.js";
import Blockchain from "./blockchain.js";
import Transaction from "./transaction.js";
import Bank from "./bank.js";

/**
 * Class Block, create a block object
 * @example
 * const walletSato = new Wallet();
 *
 * const block1 = new Block({
 *  height: chain.lastBlock.height + 1,
 *  publisher: walletSato.publicKey,
 *  prevHash: chain.lastBlock.hash,
 *  transactions: JSON.stringify([transaction1]),
 * });
 *
 * // Sign the block with the miner wallet
 * block1.sign(walletSato);
 *
 * // Launch the mining process
 * block1.mine();
 *
 * // After mining we add the block to the chain
 * chain.addBlock(block1);
 */
class Block {
  /**
   * @property {number | undefined} height height of the block, default is 0
   * @property {string | undefined} configHash hash of the blockchain config, the default is get from the current blockchain insatnce
   * @property {string | undefined} prevHash previousblock hash
   * @property {string | undefined} publisher public key of the publisher
   * @property {number | undefined} ts timestamp, default is Date.now()
   * @property {string | undefined} transactions transaction array in the block, !it's a stringified array!
   * @property {number | undefined} nonce nonce to get the difficulty right
   * @property {string | undefined} signature signature of the block with the private key
   * @property {string} hash hash of the block
   * @property {number} difficulty difficulty in regard of the chain & block height, get it from Blockchain.getInstance().getDifficultyForBlock(this)
   * @param {*} opt
   */
  constructor(opt) {
    this.height = opt.height ? opt.height : 0;
    this.configHash = opt.configHash
      ? opt.configHash
      : Blockchain.getInstance().configHash;
    this.prevHash = opt.prevHash ? opt.prevHash : "";
    this.publisher = opt.publisher ? opt.publisher : "";
    this.ts = opt.ts ? opt.ts : Date.now();
    this.transactions = opt.transactions ? opt.transactions : "";
    this.nonce = opt.nonce ? opt.nonce : 0;
    this.signature = opt.signature ? opt.signature : "";
    this.hash = this._calculateHash();
    this.difficulty = Blockchain.getInstance().getDifficultyForBlock(this);
  }

  /**
   * @property {array<Transaction>} transactionsNoContent transactions in the block without the expirable content
   */
  get transactionsNoContent() {
    return this.transactions
      ? JSON.stringify(this._transactionsNoContent(this.transactions))
      : "";
  }

  addBank(bank) {
    this.bank = bank;
  }

  /**
   * @property {function} sign sign the block with a Wallet object
   * @param {Wallet} wallet
   */
  sign(wallet) {
    this.publisher = wallet.publicKey;
    const tosign = this._toStringToSign();
    this.signature = wallet.sign(tosign);
  }

  _transactionsNoContent(txs) {
    const txsNoContents = [];
    const parsedTxs = JSON.parse(this.transactions);
    for (let tx of parsedTxs) {
      const transaction = new Transaction(tx);
      txsNoContents.push(JSON.parse(transaction.stringifyNoContent()));
    }
    return txsNoContents;
  }

  _toStringToSign() {
    return Blockchain.getInstance()
      .config.BLOCK_HASH_METHOD(
        JSON.stringify({
          height: this.height,
          configHash: this.configHash,
          prevHash: this.prevHash,
          publisher: this.publisher,
          ts: this.ts,
          transactionsNoContent: this.transactionsNoContent,
        })
      )
      .toString();
  }

  _calculateHash() {
    const hash = Blockchain.getInstance()
      .config.BLOCK_HASH_METHOD(
        JSON.stringify({
          height: this.height,
          configHash: this.configHash,
          prevHash: this.prevHash,
          publisher: this.publisher,
          ts: this.ts,
          transactionsNoContent: this.transactionsNoContent,
          signature: this.signature,
          nonce: this.nonce,
        })
      )
      .toString();
    return hash;
  }

  /**
   * @property {function} getTransactions return the Transactions array in the block
   * @returns {array<Transaction>}
   */
  getTransactions() {
    if (!this.transactionsNoContent) return [];
    return JSON.parse(this.transactionsNoContent);
  }

  /**
   * @property {function} isValid Test if block is valid Only test the block! Not the Transactions,
   * which need to check UTXO if user have enought money for operations
   * @returns {boolean}
   */
  isValid() {
    // test config hash
    if (this.configHash !== Blockchain.getInstance().configHash) {
      console.error("Config hash is not valid for", this.height);
    }

    // test signature
    const tosign = this._toStringToSign();
    if (
      this.height !== 0 &&
      !Wallet.verifySignature(tosign, this.signature, this.publisher)
    ) {
      console.error("signature not valid for", this.height);
      return false;
    }

    if (!this._testHashDifficulty()) {
      console.error("Difficulty not valid for", this.height);
      return false;
    }

    if (this.isTooBig()) return false;

    //Test the signature and expired content of all tx in the block
    const txSignatures = [];

    if (this.transactions) {
      for (const tx of JSON.parse(this.transactions)) {
        const txObj = new Transaction(tx);
        const existingSingature = txSignatures.find(
          (signature) => signature === txObj.signature
        );
        if (existingSingature) {
          console.error(
            "💳 Same Transaction exist several times!",
            this.height
          );
          return false;
        }

        txSignatures.push(txObj.signature);
        if (!txObj.isValid()) {
          console.error("Transaction not valid for", this.height);
          return false;
        }

        //Has transaction expired?
        if (
          txObj &&
          txObj.contentSizeKo &&
          !this.hasExpired &&
          (!txObj.content ||
            txObj.calculateContentSize() !== txObj.contentSizeKo ||
            txObj.contentHash !==
              Blockchain.getInstance()
                .config.BLOCK_HASH_METHOD(txObj.content)
                .toString())
        ) {
          console.error(
            "Transaction is not expired and incoherent content for it!",
            this.height
          );
          return false;
        }
      }
    }
    return true;
  }

  /**
   * @property {function} purgeTX purge all expired transactions in the block
   * @returns {void}
   */
  purgeTX() {
    if (!this.hasExpired) {
      return false;
    } else {
      const newTransactions = [];
      if (this.transactions) {
        for (const tx of JSON.parse(this.transactions)) {
          const txObj = new Transaction(tx);
          if (txObj.content && txObj.contentSizeKo) {
            console.log(`Found content to purge:${txObj.contentSizeKo} Ko`);
            txObj.content = undefined;
          }
          newTransactions.push(txObj);
        }
        this.transactions = JSON.stringify(newTransactions);
      }
    }
  }

  /**
   * @property {boolean} hasExpired regarding the timestamp of the block, does the transactions content
   * in it has expired?
   */
  get hasExpired() {
    /*console.log(
      `Height ${this.height} expired in ${expireIn / (60 * 60 * 1000)} h`
    );*/
    return this.expireIn < 0;
  }

  /**
   * @property {number} expireIn In how much time expire transaction content?
   */
  get expireIn() {
    const expirationHours = Blockchain.getInstance().config
      .TX_CONTENT_EXPIRATION_HOURS;
    const tsNow = Date.now();
    return expirationHours * 60 * 60 * 1000 - (tsNow - this.ts);
  }

  /**
   *  @property {function} isTooBig  is the block tooo big in regard to the BLOCK_MAX_SIZE_KO in the Config?
   * @returns {boolean}
   */
  isTooBig() {
    if (
      JSON.stringify(this).length / 1000 >
      Blockchain.getInstance().config.BLOCK_MAX_SIZE_KO
    ) {
      console.error(
        `The block ${this.height} is too big, it should be less than ${
          Blockchain.getInstance().config.BLOCK_MAX_SIZE_KO
        } Ko`
      );
      return true;
    }

    return false;
  }

  /**
   * @property {function} mine launch the mining of the block, return null if iterationMax reached without solving the Block, return the Block if the crypto puzzle was resolved
   * @param {number} iterationMax optional param, adding a maximum iteration to the mining loop, to avoid freeze web UI.
   *
   * @returns {Block | null}
   */
  mine(iterationMax = 0) {
    console.log(iterationMax);
    let iteration = 0;
    while (
      !this._testHashDifficulty() &&
      (!iterationMax || iteration <= iterationMax)
    ) {
      this.nonce++;
      iteration++;
      /*console.log(iteration, iterationMax);
      console.log(iteration <= iterationMax);*/
      this.hash = this._calculateHash();
    }
    return this._testHashDifficulty() ? this : null;
  }

  _testHashDifficulty() {
    return (
      this.hash.substring(0, this.difficulty) ===
      Array(this.difficulty + 1).join("0")
    );
  }
}

export default Block;
