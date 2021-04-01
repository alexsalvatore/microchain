import cryptojs from "crypto-js";
const { SHA256 } = cryptojs;

export default class Block {
  constructor(prevHash, transaction, ts = Date.now(), signature) {
    this.prevHash = prevHash;
    this.transaction = transaction;
    this.ts = ts;
    this.signature = signature;
    this.hash = this.calculateHash();
  }

  sign(wallet) {
    this.signature = wallet.sign(JSON.stringify(this));
  }

  calculateHash() {
    const hash = SHA256(JSON.stringify(this)).toString();
    return hash;
  }
}
