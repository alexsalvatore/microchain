import Transaction from "./transaction.js";
import Block from "./block.js";
import UTXOPool from "./utxopool.js";
import { maxBy, reduce, unfold, reverse, values, prop } from "ramda";

export default class Chain {
  static _instance;
  static get instance() {
    if (!Chain._instance) {
      console.log("create instance!");
      Chain._instance = new Chain();
    }
    return Chain._instance;
  }

  constructor() {
    this.utxoPool = new UTXOPool();
    const genesisBlock = new Block({
      publisher: "Takeshi",
      transactions: JSON.stringify([
        new Transaction({
          sender: "Takeshi",
          content:
            "https://pbs.twimg.com/media/Exfacp-WUAUwc1G?format=png&name=900x900",
        }),
      ]),
    });
    genesisBlock.mine();
    this.chain = [genesisBlock];
    return this;
  }

  get lastBlock() {
    if (this.chain.length === 0) return null;
    return this.chain[this.chain.length - 1];
  }

  get longestChain() {
    if (!this.chain) return [];
    const blocksDict = values(this.chain);
    this.chain.forEach((block) => (blocksDict[block.hash] = block));
    const getParent = (x) => {
      if (x === undefined) {
        return false;
      }
      return [x, blocksDict[x.prevHash]];
    };

    return reverse(unfold(getParent, this.lastBlock));
  }

  addBlock(block) {
    //Test validity
    this.utxoPool.addBlock(block);
    this.chain.push(block);
    this.chain = this.longestChain;
  }

  logChain() {
    console.log(this.chain);
  }

  logUTXO() {
    console.log(this.utxoPool.log());
  }
}
