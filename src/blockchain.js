import Block from "./block.js";
import UTXOPool from "./utxopool.js";
import { EventEmitter } from "events";
import { unfold, reverse, values, forEach } from "ramda";
import Config from "./config.js";
import { Transaction } from "./index.js";

/**
 * Class Blockchain, singleton managing the whole Blockchain
 * Please Do no use it, use Blockchain.init(config, blocks) or Blockchain.getInstance()
 * @example
 * const chain = Blockchain.init(
  {
    BLOCK_HASH_METHOD: "MD5",
    BLOCK_MAX_DIFFICULTY: 3,
    MONEY_BY_BLOCK: 15,
    MONEY_BY_KO: 1.2,
    TX_CONTENT_MAX_SIZE_KO: 200,
    GENESIS_BLOCK: {
      publisher: '04820be6a65e928d52e92b8bfe7827de7a09d3afa1356ef81f6f8528b44ba84393d32b44e4590fa9ca6b9576a6d7f2f0467af33d8f68f83e1359a8e4981f4ed5f6',
    },
    FOUNDERS: ['04820be6a65e928d52e92b8bfe7827de7a09d3afa1356ef81f6f8528b44ba84393d32b44e4590fa9ca6b9576a6d7f2f0467af33d8f68f83e1359a8e4981f4ed5f6'],
  },
  blocks
);
 */
class Blockchain extends EventEmitter {
  static _instance;

  onBlockAdded = (callback) => {};

  onBlockchainLoaded = (callback) => {};

  /**
   *
   * @param {Config} conf the config of the chain. be careful, all the mined blocks will be invalid if you change the config of the chain.
   * @param {array<Block>} blocks the list of already mined block of the chain
   * @returns {Blockchain} return a Blockchain instance
   */
  static init(conf, blocks = null) {
    if (!Blockchain._instance) {
      Blockchain._instance = new Blockchain(conf);
      Blockchain.getInstance().chain = [];
      Blockchain._instance.ready = false;

      //Create geneis block
      if (!blocks) {
        const genesisBlock = new Block({
          ...conf.GENESIS_BLOCK,
          height: 0,
        });

        genesisBlock.mine();
        Blockchain.getInstance().addBlock(genesisBlock);
      } else {
        const blocksSorted = blocks.sort(Blockchain._sortBlocksByHeight);
        for (let block of blocksSorted) {
          const blockInstance = new Block(block);
          Blockchain.getInstance().addBlock(blockInstance);
        }
      }
      Blockchain.getInstance().ready = true;
    } else if (conf) {
      console.warn(
        "Config wont be use, you already have an instance of the chain running."
      );
    }
    return Blockchain._instance;
  }

  /**
   * @property {function} getInstance return the instance of the Blockcahin
   * @returns {Blockchain} return a Blockchain instance
   */
  static getInstance() {
    if (!Blockchain._instance) {
      console.warn(
        "Hey! there is no Blockchain instance running... are you sure you have call init?"
      );
      return null;
    }
    return Blockchain._instance;
  }

  /**
   * Please Do no use it, use Blockchain.init(config, blocks) or Blockchain.getInstance()
   * @param {Config} conf
   * @returns {Blockchain}
   */
  constructor(conf) {
    super();
    this.chain = [];
    this._conf = new Config(conf);
    this.utxoPool = new UTXOPool();
    return this;
  }

  /**
   * @property {Config} config config of the current Blockchain instance.
   */
  get config() {
    if (!this._conf) {
      this._conf = new Config();
    }
    return this._conf;
  }

  /**
   * @property {string} configHash hash of the config of the current Blockchain instance.
   */
  get configHash() {
    if (!this._conf) {
      this._conf = new Config();
    }
    return this._conf.BLOCK_HASH_METHOD(JSON.stringify(this._conf)).toString();
  }

  /**
   * @property {Block} lastBlock return the last mined block, with the highest height
   */
  get lastBlock() {
    //console.log(this);
    if (this.chain.length === 0) return null;
    return this.chain[this.chain.length - 1];
  }

  /**
   * @property {array<Block>} longestBlockchain return the highest chain of blocks
   */
  get longestBlockchain() {
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

  /**
   * Return a block for a given height
   * @param {number} height a given height
   * @returns {Block | undefined}
   */
  getBlockForHeight(height) {
    const longuestBlockchain = this.longestBlockchain;
    const blockOld = longuestBlockchain.find(
      (block) => block.height === height
    );

    return blockOld;
  }

  /**
   * Calculate what should be the difficulty for a given block
   * @param {Block} blockNew
   * @returns {number} the difficulty that should be the block
   */
  getDifficultyForBlock(blockNew) {
    const longuestBlockchain = this.longestBlockchain;

    // Add the block -1 to get the distance between 2 blocks because the distance
    // of time between this block and the block currently mined is not a constant
    // => It's mean than the difficulty can change during the block mining
    const blockBefore = longuestBlockchain.find(
      (block) => block.height === blockNew.height - 1
    );
    const blockOld = longuestBlockchain.find(
      (block) =>
        block.height ===
        blockNew.height - this.config.BLOCK_HASH_RATE_AVERAGE - 1
    );

    // When you cannot compare difficulty because not enought blocks
    if (!blockBefore || !blockOld) {
      return this.config.BLOCK_MIN_DIFFICULTY;
    }
    const delta =
      (blockBefore.ts - blockOld.ts) / this.config.BLOCK_HASH_RATE_AVERAGE;
    const expectedDelta =
      (24 * 60 * 60 * 1000) / this.config.BLOCK_HASH_RATE_BY_DAY;

    const rateDetla = delta / expectedDelta;
    // console.log(delta, expectedDelta, rateDetla);

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

  /**
   * return a block for a given hash
   * @param {string} prevHash the hash to search
   * @returns {Block | undefined}
   */
  getParent(prevHash) {
    const parentBlock = this.chain.find((b) => b.hash === prevHash);
    return parentBlock;
  }

  /**
   * Try to add a block to the chain if the block is valid
   * @param {Block} block the block to add
   * @returns {boolean} return true or false, if it's a valid block or not
   */
  addBlock(block) {
    /*console.log("--------------");
    console.log(
      `Block ${block.height} #${block.hash} need difficulty ${block.difficulty}`
    );
    console.log(block);*/

    if (!block.isValid()) {
      console.error(`Block ${block.height} is not valid`);
      return false;
    }

    // Test if the block is valid in reguard of the last block
    const parentBlock = this.getParent(block.prevHash);

    if (!parentBlock && block.height !== 0) {
      console.error(`Block ${block.height} has no parent!`);
      return false;
    }

    if (
      parentBlock &&
      (parentBlock.height - 1 == block.height || parentBlock.ts >= block.ts)
    ) {
      console.error(
        `addBlock(block) Block ${block.height} is not coherent with the chain`
      );
      return false;
    }

    const txs = block.getTransactions();
    for (let tx of txs) {
      if (!this.utxoPool.isTXValid(new Transaction(tx))) {
        console.error(`💳 Block ${block.height} has an invalid transaction`);
        return false;
      }
    }

    // The block is valid we add it to the chain!
    this.utxoPool.addBlock(block);
    this.chain.push(block);
    console.log(`🥞 Block ${block.height} has been added`);
    // We purge the block when and the chain
    this.purgeChain();
    if (Blockchain.getInstance().ready) this.emit("blockAdded", block);

    return true;
  }

  /**
   * @property {function} purgeChain clear all the expired content of the chain
   */
  purgeChain() {
    this.chain.forEach((block) => {
      block.purgeTX();
    });
  }

  getDiagnostic() {
    for (const block of this.longestBlockchain) {
      if (!block.isValid()) {
        console.error(`💣 Block ${block.height} invalid`);
      }

      const txs = block.getTransactions();
      let allTxValid = true;
      for (let tx of txs) {
        if (!this.utxoPool.isTXValid(new Transaction(tx))) {
          console.error(
            `🧨 Block ${block.height} has an invalid transaction(s)`
          );
          allTxValid = false;
          return false;
        }
      }
      console.log(
        `🍭 Block ${block.height} valid on ${this.longestBlockchain.length} blocks`
      );
    }
  }

  getTransactionCost(tx) {
    if (tx.contentSizeKo) return this.config.MONEY_BY_KO * tx.contentSizeKo;
    return 0;
  }

  enoughtMoneyFrom(tx, publicKey) {
    const cost = this.getTransactionCost(tx);
    const money = this.utxoPool.getMoneyForSender(publicKey);
    console.log(`cost: ${cost} V. money you have: ${money}`);
    return cost <= money;
  }

  logBlockchain() {
    console.log(this.chain);
  }

  logBlockchainSize() {
    console.log(
      `Blockchain size is ${JSON.stringify(this.chain).length / 1000} Ko`
    );
  }

  logUTXO() {
    this.utxoPool.log();
  }

  static _sortBlocksByHeight(b1, b2) {
    if (b1.height < b2.height) {
      return -1;
    }
    if (b1.height < b2.height) {
      return 1;
    }
    return 0;
  }
}

export default Blockchain;
