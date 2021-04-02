import Transaction from "./transaction.js";
import Block from "./block.js";
import UTXOPool from "./utxopool.js";
import { maxBy, reduce, unfold, reverse, values, prop } from "ramda";

export default class Chain {
  static _instance;
  static get instance() {
    if (!Chain._instance) {
      Chain._instance = new Chain();
    }
    return Chain._instance;
  }

  constructor() {
    this.utxoPool = new UTXOPool();
    const genesisBlock = new Block({
      height: 0,
      publisher: "Takeshi",
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
    if (!block.isValid()) {
      return false;
    }

    /*
    const txs = block.getTransactions();
    for (let tx of txs) {
      if (!this.utxoPool.isTXValid(tx)) return false;
    }*/

    this.utxoPool.addBlock(block);
    this.chain.push(block);
    this.chain = this.longestChain;
    console.log("add block");
    return true;
  }

  logChain() {
    console.log(this.chain);
  }

  logUTXO() {
    this.utxoPool.log();
  }
}
