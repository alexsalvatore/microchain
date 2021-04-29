import Blockchain from "./blockchain.js";
import Wallet from "./wallet.js";

export default class Transaction {
  constructor(opt) {
    this.amount = opt["amount"] ? opt["amount"] : 0;
    this.sender = opt["sender"] ? opt["sender"] : undefined;
    this.receiver = opt["receiver"] ? opt["receiver"] : undefined;
    this.content = opt["content"] ? opt["content"] : undefined;
    this.contentHash = opt["contentHash"]
      ? opt["contentHash"]
      : Blockchain.getInstance()
          .config.BLOCK_HASH_METHOD(this.content)
          .toString();
    this.contentSizeKo = opt["contentSizeKo"]
      ? opt["contentSizeKo"]
      : Math.round(this.content.toString().length / 1000);
    this.ownership = opt["ownership"] ? opt["ownership"] : undefined;
    this.ts = opt.ts ? opt.ts : Date.now();
    this.signature = opt["signature"] ? opt["signature"] : "";
  }

  /**
   * Because block signature need to be without the hash & signature & nonce
   */
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

  sign(wallet) {
    this.signature = wallet.sign(this._toStringToSign());
  }

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

  // Test signature & size
  isValid() {
    if (this.isTooBig()) return false;

    const tosign = this._toStringToSign();
    return Wallet.verifySignature(tosign, this.signature, this.sender);
  }

  isTooBig() {
    if (
      this.contentSizeKo &&
      this.contentSizeKo >
        Blockchain.getInstance().config.TX_CONTENT_MAX_SIZE_KO
    ) {
      console.error(
        `The transaction ${this.height} is too big, it should be less than ${
          Blockchain.getInstance().config.TX_CONTENT_MAX_SIZE_KO
        } Ko`
      );
      return true;
    }

    return false;
  }

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
