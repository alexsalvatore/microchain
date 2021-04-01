import Transaction from "./transaction.js";
import Block from "./block.js";

export default class Chain {
  static instance_;
  static get instance() {
    if (!Chain.instance_) {
      Chain.instance_ = new Chain();
    }
    return Chain.instance_;
  }

  constructor() {
    this.chain = [
      new Block(
        null,
        new Transaction({
          payer: "Takeshi Jefferson",
          content:
            "https://pbs.twimg.com/media/Exfacp-WUAUwc1G?format=png&name=900x900",
        })
      ),
    ];
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(block) {
    this.chain.push(block);
  }

  logChain() {
    console.log(this.chain);
  }
}
