export default class Transaction {
  constructor(opt) {
    this.amount = opt["amount"] ? opt["amount"] : 0;
    this.sender = opt["sender"] ? opt["sender"] : undefined;
    this.receiver = opt["receiver"] ? opt["receiver"] : undefined;
    this.content = opt["content"] ? opt["content"] : undefined;
    this.ownership = opt["ownership"] ? opt["ownership"] : undefined;
  }

  toString() {
    return JSON.stringify(this);
  }

  sign(wallet) {
    this.signature = wallet.sign(this.toString());
  }
}
