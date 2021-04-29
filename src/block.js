import Wallet from "./wallet.js";
import Blockchain from "./blockchain.js";
import Transaction from "./transaction.js";

export default class Block {
  constructor(opt) {
    this.height = opt.height ? opt.height : 0;
    this.prevHash = opt.prevHash ? opt.prevHash : "";
    this.publisher = opt.publisher ? opt.publisher : "";
    this.ts = opt.ts ? opt.ts : Date.now();
    this.transactions = opt.transactions ? opt.transactions : "";
    this.nonce = opt.nonce ? opt.nonce : 0;
    this.signature = opt.signature ? opt.signature : "";
    this.hash = this._calculateHash();
    this.difficulty = Blockchain.getInstance().getDifficultyForBlock(this);
  }

  get transactionsNoContent() {
    return this.transactions
      ? JSON.stringify(this._transactionsNoContent(this.transactions))
      : "";
  }

  sign(wallet) {
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

  /**
   * Because block signature need to be without the hash & signature & nonce
   */
  _toStringToSign() {
    return Blockchain.getInstance()
      .config.BLOCK_HASH_METHOD(
        JSON.stringify({
          height: this.height,
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

  getTransactions() {
    if (!this.transactionsNoContent) return [];
    return JSON.parse(this.transactionsNoContent);
  }

  /**
   * Only test the block! Transaction need to be tester by the lib implementor
   */
  isValid() {
    const tosign = this._toStringToSign();
    //test signature
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
    if (this.transactions) {
      for (const tx of JSON.parse(this.transactions)) {
        const txObj = new Transaction(tx);

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
            Math.round(txObj.content.toString().length / 1000) !==
              txObj.contentSizeKo ||
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

  purgeTX() {
    if (!this.hasExpired) {
      return false;
    } else {
      const newTransactions = [];
      if (this.transactions) {
        for (const tx of JSON.parse(this.transactions)) {
          const txObj = new Transaction(tx);
          if (txObj.content)
            console.log(`Found content to purge:${txObj.contentSizeKo} Ko`);
          // txObj.content = undefined;
          newTransactions.push(txObj);
        }
        this.transactions = JSON.stringify(newTransactions);
      }
    }
  }

  get hasExpired() {
    /*console.log(
      `Height ${this.height} expired in ${expireIn / (60 * 60 * 1000)} h`
    );*/
    return this.expireIn < 0;
  }

  get expireIn() {
    const expirationHours = Blockchain.getInstance().config
      .TX_CONTENT_EXPIRATION_HOURS;
    const tsNow = Date.now();
    return expirationHours * 60 * 60 * 1000 - (tsNow - this.ts);
  }

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

  mine() {
    while (!this._testHashDifficulty()) {
      this.nonce++;
      this.hash = this._calculateHash();
    }
    return this;
  }

  _testHashDifficulty() {
    return (
      this.hash.substring(0, this.difficulty) ===
      Array(this.difficulty + 1).join("0")
    );
  }
}
