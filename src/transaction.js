import cryptojs from "crypto-js";
import Chain from "./chain.js";

export default class Transaction {
  constructor(opt) {
    this.amount = opt["amount"] ? opt["amount"] : 0;
    this.sender = opt["sender"] ? opt["sender"] : undefined;
    this.receiver = opt["receiver"] ? opt["receiver"] : undefined;
    this.content = opt["content"] ? opt["content"] : undefined;
    this.contentHash = Chain.getInstance()
      .config.BLOCK_HASH_METHOD(this.content)
      .toString();
    this.ownership = opt["ownership"] ? opt["ownership"] : undefined;
    this.ts = opt.ts ? opt.ts : Date.now();
    this.signature = opt["signature"] ? opt["signature"] : "";
  }

  /**
   * Because block signature need to be without the hash & signature & nonce
   */
  _toStringToSign() {
    return Chain.getInstance()
      .config.BLOCK_HASH_METHOD(
        JSON.stringify({
          amount: this.amount,
          sender: this.sender,
          receiver: this.receiver,
          content: this.content,
          ownership: this.ownership,
          ts: this.ts,
        })
      )
      .toString();
  }

  get hash() {
    const hash = Chain.getInstance()
      .config.BLOCK_HASH_METHOD(JSON.stringify(this))
      .toString();
    return hash;
  }

  sign(wallet) {
    this.signature = wallet.sign(this._toStringToSign());
  }
}
