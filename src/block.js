import cryptojs from "crypto-js";
import Chain from "./chain.js";
const { SHA256 } = cryptojs;

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
  }

  sign(wallet) {
    this.signature = wallet.sign(JSON.stringify(this));
  }

  _calculateHash() {
    const hash = SHA256(JSON.stringify(this)).toString();
    return hash;
  }

  getTransactions() {
    if (!this.transactions) return [];
    return JSON.parse(this.transactions);
  }

  get difficulty() {
    return 3;
  }

  mine(lastBlock) {
    if (!lastBlock && this.prevHash)
      return console.error(
        "You should specify the previous block before mining"
      );

    // If we mine, we need to get the good heigth
    this.height = lastBlock ? lastBlock.height + 1 : 0;
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
