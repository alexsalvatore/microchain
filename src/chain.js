import Transaction from "./transaction.js";
import Block from "./block.js";

export default class Chain {
  static _instance;
  static get instance() {
    if (!Chain._instance) {
      Chain._instance = new Chain();
    }
    return Chain._instance;
  }

  constructor() {
    const genesisBlock = new Block({
      publisher: "Takeshi",
      transactions: JSON.stringify([
        new Transaction({
          payer: "Takeshi",
          content:
            "https://pbs.twimg.com/media/Exfacp-WUAUwc1G?format=png&name=900x900",
        }),
      ]),
    });
    genesisBlock.proofOfWork();
    this.chain = [genesisBlock];
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
