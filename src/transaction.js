import Blockchain from "./blockchain.js";
import Wallet from "./wallet.js";

/**
 * Transaction, help to make transfert of $, ownership and content  hosting in the chain
 * @example
 *
 * const walletSato = new Wallet();
 *
 * // Transaction for content, will expire with the TX_CONTENT_EXPIRATION_HOURS parameter in the config
 * const transaction1 = walletSato.createTransaction({
 *  sender: walletSato.publicKey,
 *  content: "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
 *});
 *
 * const walletDolores = new Wallet();
 * const walletKub = new Wallet();
 *
 * // Transaction for 1.2$
 *  const transaction2 = walletDolores.createTransaction({
 *  sender: block1.publisher,
 *  receiver: walletKub.publicKey,
 *  amount: 1.2,
 * });
 *
 * // Transaction for 50% of an ownership
 * const transaction3 = walletDolores.createTransaction({
 *  sender: block1.publisher,
 *  ownership: block1.hash,
 *  receiver: walletKub.publicKey,
 *  amount: 0.5,
 * });
 *
 */

class Transaction {
  /**
   *
   * @param {{ amount: number | undefined,
   *  sender: string | undefined,
   *  receiver: string | undefined,
   *  channel: string | undefined,
   *  content: string | undefined,
   *  contentHash: string | undefined,
   *  contentSizeKo: number | undefined,
   *  ownership: string | undefined,
   *  ts: number | undefined,
   *  signature: string | undefined
   *  }} opt information of the transaction (see properties)
   *
   */
  constructor(opt) {
    /**
     * @property {number} amount the quantity of a TX, default is 0
     * @property {string} sender public key of a sender
     * @property {string} receiver public key of a receiver
     * @property {string} Channel of distribution of a transaction, useful to distribute encrypted content
     * @property {string} content the expirable data, cost $ and is expirable, see in the Config class options
     * @property {string} contentHash hash of this content
     * @property {number} contentSizeKo use to know the cost of the transaction once the content hash expired
     * @property {string} ownership id of ownership, when you transfert ownership
     * @property {number} ts timestamp, default is Date.now()
     * @property {string}  signature : signature of the transaction, the TX is invalid without this
     */
    this.amount = opt["amount"] ? opt["amount"] : 0;
    this.sender = opt["sender"] ? opt["sender"] : null;
    this.receiver = opt["receiver"] ? opt["receiver"] : null;
    this.channel = opt["channel"] ? opt["channel"] : null;
    this.content = opt["content"] ? opt["content"] : null;
    this.contentHash = opt["contentHash"]
      ? opt["contentHash"]
      : Blockchain.getInstance()
          .config.BLOCK_HASH_METHOD(this.content)
          .toString();
    this.contentSizeKo = opt["contentSizeKo"]
      ? opt["contentSizeKo"]
      : opt["content"]
      ? this.calculateContentSize()
      : null;
    this.ownership = opt["ownership"] ? opt["ownership"] : null;
    this.ts = opt.ts ? opt.ts : Date.now();
    this.signature = opt["signature"] ? opt["signature"] : "";
  }

  /**
   *
   * @property {function} calculateContentSize Calculate the size in Ko of the content param
   * @returns {number}
   */
  calculateContentSize() {
    return JSON.stringify(this.content).length / 1000;
  }

  /**
   *
   * @property {function} calculateTXSize Calculate the size in Ko of the whole transaction
   * @returns {number}
   */
  calculateTXSize() {
    return JSON.stringify(this).length / 1000;
  }

  _toStringToSign() {
    return Blockchain.getInstance()
      .config.BLOCK_HASH_METHOD(
        JSON.stringify({
          amount: this.amount,
          sender: this.sender,
          receiver: this.receiver,
          contentHash: this.content,
          contentSizeKo: this.contentSizeKo,
          ownership: this.ownership,
          ts: this.ts,
        })
      )
      .toString();
  }

  /**
   * @property {string} hash hash of the TX not using the content property
   */
  get hash() {
    const hash = Blockchain.getInstance()
      .config.BLOCK_HASH_METHOD(
        JSON.stringify({
          amount: this.amount,
          sender: this.sender,
          receiver: this.receiver,
          contentHash: this.contentHash,
          contentSizeKo: this.contentSizeKo,
          ownership: this.ownership,
          ts: this.ts,
          signature: this.signature,
        })
      )
      .toString();
    return hash;
  }

  /**
   * @property {fucntion} sign sign the transaction with a wallet
   * @returns {void}
   */
  sign(wallet) {
    this.signature = wallet.sign(this._toStringToSign());
  }

  /**
   * Stringify the object ommiting the content propertie
   * @returns {string}
   */
  stringifyNoContent() {
    return JSON.stringify({
      amount: this.amount,
      sender: this.sender,
      receiver: this.receiver,
      contentHash: this.contentHash,
      contentSizeKo: this.contentSizeKo,
      ownership: this.ownership,
      ts: this.ts,
      signature: this.signature,
    });
  }

  /**
   * @property {function} isValid Return if a TX is valid, testing the size, if amount > to zero and the validity of the signature
   * @returns {boolean}
   */
  isValid() {
    if (this.isTooBig() || (this.amount && this.amount < 0)) return false;

    const tosign = this._toStringToSign();
    return Wallet.verifySignature(tosign, this.signature, this.sender);
  }

  /**
   * @property {function} isTooBig Test if a TX is too big
   * @returns {boolean}
   */
  isTooBig() {
    if (
      this.calculateTXSize() - this.calculateContentSize() >
      Blockchain.getInstance().config.TX_MAX_SIZE_KO
    ) {
      console.error(
        `🏋️ The transaction size ${
          this.signature
        } without content is too big, it should be less than ${
          Blockchain.getInstance().config.TX_MAX_SIZE_KO
        } Ko`
      );
      return true;
    }

    if (
      this.contentSizeKo &&
      this.contentSizeKo >
        Blockchain.getInstance().config.TX_CONTENT_MAX_SIZE_KO
    ) {
      console.error(
        `🏋️ The transaction's content ${
          this.signature
        } is too big, it should be less than ${
          Blockchain.getInstance().config.TX_CONTENT_MAX_SIZE_KO
        } Ko`
      );
      return true;
    }

    return false;
  }

  /**
   * @property {function} Log the TX, without the content
   */
  log() {
    console.log(
      JSON.stringify({
        amount: this.amount,
        sender: this.sender,
        receiver: this.receiver,
        contentHash: this.contentHash,
        contentSizeKo: this.contentSizeKo,
        ownership: this.ownership,
        ts: this.ts,
        signature: this.signature,
      })
    );
  }
}

export default Transaction;
