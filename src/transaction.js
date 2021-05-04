import Blockchain from "./blockchain.js";
import Wallet from "./wallet.js";

export default class Transaction {
  constructor(opt) {
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

  calculateContentSize() {
    return JSON.stringify(this.content).length / 1000;
  }

  calculateTXSize() {
    return JSON.stringify(this).length / 1000;
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
