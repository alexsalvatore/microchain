import Transaction from "./transaction.js";
import Block from "./block.js";
import UTXOPool from "./utxopool.js";
import { maxBy, reduce, unfold, reverse, values, prop } from "ramda";
import Config from "./config.js";

export default class Chain {
  static _instance;

  static init(conf) {
    if (!Chain._instance) {
      Chain._instance = new Chain(conf);

      //Create geneis block
      const genesisBlock = new Block({
        height: 0,
        publisher: "Takeshi",
      });
      genesisBlock.mine();
      Chain.getInstance().chain = [genesisBlock];
    } else if (conf) {
      console.warn(
        "Config wont be use, you already have an instance of the chain running."
      );
    }
    return Chain._instance;
  }

  static getInstance() {
    if (!Chain._instance) {
      console.warn(
        "Hey! there is no Chain instance running... are you sure you have call init?"
      );
      return null;
    }
    return Chain._instance;
  }

  constructor(conf) {
    this.chain = [];
    this._conf = new Config(conf);
    this.utxoPool = new UTXOPool();
    return this;
  }

  get config() {
    if (!this._conf) {
      return new Config();
    }
    return this._conf;
  }

  get lastBlock() {
    console.log(this);
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

  getDifficultyForHeight(height = 0) {
    return this.config.BLOCK_MIN_DIFFICULTY;
  }

  addBlock(block) {
    if (!block.isValid()) {
      console.error(`Block ${block.height} is not valid`);
      return false;
    }

    const txs = block.getTransactions();
    for (let tx of txs) {
      if (!this.utxoPool.isTXValid(tx)) return false;
    }

    this.utxoPool.addBlock(block);

    this.chain.push(block);
    this.chain = this.longestChain;
    return true;
  }

  logChain() {
    console.log(this.chain);
  }

  logUTXO() {
    this.utxoPool.log();
  }
}
