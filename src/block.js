import cryptojs from "crypto-js";
import Wallet from "./wallet.js";
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
    const tosign = this._toStringToSign();
    this.signature = wallet.sign(tosign);
  }

  /**
   * Because block signature need to be without the hash & signature & nonce
   */
  _toStringToSign() {
    return SHA256(
      JSON.stringify({
        height: this.height,
        prevHash: this.prevHash,
        publisher: this.publisher,
        ts: this.ts,
        transactions: this.transactions,
      })
    ).toString();
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

  /**
   * Only test the block! Transaction need to be tester by the lib implementor
   */
  isValid() {
    const tosign = this._toStringToSign();
    //test signature
    if (!Wallet.verifySignature(tosign, this.signature, this.publisher)) {
      console.error("signature not valid for", this.height);
      return false;
    }
    return true;
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
