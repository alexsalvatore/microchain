import Block from "./block.js";
import UTXOPool from "./utxopool.js";
import { EventEmitter } from "events";
import { unfold, reverse, values } from "ramda";
import Config from "./config.js";

export default class Chain extends EventEmitter {
  static _instance;

  onBlockAdded = (callback) => {};

  onChainLoaded = (callback) => {};

  static init(conf, blocks = null) {
    if (!Chain._instance) {
      Chain._instance = new Chain(conf);
      Chain._instance.ready = false;

      //Create geneis block
      if (!blocks) {
        const genesisBlock = new Block({
          height: 0,
          publisher: "Takeshi",
        });
        genesisBlock.mine();
        Chain.getInstance().chain = [genesisBlock];
        this.emit("blockAdded", genesisBlock);
      } else {
        for (let block of blocks) {
          const blockInstance = new Block(block);
          Chain.getInstance().addBlock(blockInstance);
        }
      }
      Chain.getInstance().ready = true;
      Chain.getInstance().emit("chainReady", Chain.getInstance().chain);
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
    super();
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
    //console.log(this);
    if (this.chain.length === 0) return null;
    return this.chain[this.chain.length - 1];
  }

  get longestChain() {
    if (!this.chain || this.chain.length === 0) return [];
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

  getBlockForHeight(height) {
    const longuestChain = this.longestChain;
    const blockOld = longuestChain.find((block) => block.height === height);

    return blockOld;
  }

  getDifficultyForBlock(blockNew) {
    const longuestChain = this.longestChain;

    // Add the block -1 to get the distance between 2 blocks because the distance
    // of time between this block and the block currently mined is not a constant
    // => It's mean than the difficulty can change during the block mining
    const blockBefore = longuestChain.find(
      (block) => block.height === blockNew.height - 1
    );
    const blockOld = longuestChain.find(
      (block) =>
        block.height ===
        blockNew.height - this.config.BLOCK_HASH_RATE_AVERAGE - 1
    );

    if (!blockBefore || !blockOld) return this.config.BLOCK_MIN_DIFFICULTY;

    const delta =
      (blockBefore.ts - blockOld.ts) / this.config.BLOCK_HASH_RATE_AVERAGE;
    const expectedDelta =
      (24 * 60 * 60 * 1000) / this.config.BLOCK_HASH_RATE_BY_DAY;

    const rateDetla = delta / expectedDelta;
    console.log(delta, expectedDelta, rateDetla);

    const previousBlock = this.getBlockForHeight(blockNew.height - 1);

    // Create a margin for difficulty increase or decrease
    const errorMargin = 0.25;
    let finalDiff = previousBlock.difficulty;
    if (rateDetla < 1 - errorMargin) {
      finalDiff++;
    } else if (rateDetla > 1 + errorMargin) {
      finalDiff--;
    }

    // console.log("Difficulty final", finalDiff);
    if (finalDiff < this.config.BLOCK_MIN_DIFFICULTY)
      finalDiff = this.config.BLOCK_MIN_DIFFICULTY;
    if (finalDiff > this.config.BLOCK_MAX_DIFFICULTY)
      finalDiff = this.config.BLOCK_MAX_DIFFICULTY;

    return finalDiff;
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
    // this.chain = this.longestChain; // We need to memorize all valids blocks!
    if (Chain.getInstance().ready) this.emit("blockAdded", block);
    return true;
  }

  logChain() {
    console.log(this.chain);
  }

  logUTXO() {
    this.utxoPool.log();
  }
}
