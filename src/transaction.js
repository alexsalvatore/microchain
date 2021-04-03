import cryptojs from "crypto-js";
const { SHA256 } = cryptojs;

export default class Transaction {
  constructor(opt) {
    this.amount = opt["amount"] ? opt["amount"] : 0;
    this.sender = opt["sender"] ? opt["sender"] : undefined;
    this.receiver = opt["receiver"] ? opt["receiver"] : undefined;
    this.content = opt["content"] ? opt["content"] : undefined;
    this.ownership = opt["ownership"] ? opt["ownership"] : undefined;
    this.signature = opt["signature"] ? opt["signature"] : "";
  }

  /**
   * Because block signature need to be without the hash & signature & nonce
   */
  _toStringToSign() {
    return SHA256(
      JSON.stringify({
        amount: this.amount,
        sender: this.sender,
        receiver: this.receiver,
        content: this.content,
        ownership: this.ownership,
      })
    ).toString();
  }

  sign(wallet) {
    this.signature = wallet.sign(this._toStringToSign());
  }
}
