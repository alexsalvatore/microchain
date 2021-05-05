import cryptojs from "crypto-js";
const { SHA256, MD5 } = cryptojs;

/**
 * Class to init blockchain's Config, all mined block will be invalid if you change the config of the chain
 */
class Config {
  /**
   * Contructor method of the Config object
   *
   * @param {{BLOCK_MAX_SIZE: number | undefined,
   * BLOCK_MIN_DIFFICULTY: number | undefined,
   * BLOCK_HASH_RATE_AVERAGE: number | undefined,
   * BLOCK_MAX_DIFFICULTY: number | undefined,
   * BLOCK_HASH_RATE_BY_DAY: number | undefined,
   * BLOCK_HASH_METHOD: 'SHA265' | 'MD5' | undefined,
   * TX_CONTENT_EXPIRATION_HOURS: number | undefined,
   * TX_CONTENT_MAX_SIZE_KO: number | undefined,
   * TX_MAX_SIZE_KO: number | undefined,
   * BLOCK_MAX_SIZE_KO: number | undefined,
   * FOUNDERS: array<string> | undefined,
   * GENESIS_BLOCK: {*},
   * MONEY_BY_BLOCK: number | undefined,
   * MONEY_BY_KO: number | undefined,
   * TX_FEE_MINE_MONEY: number | undefined,
   * TX_FEE_MINE_OWNERSHIP: number | undefined,
   * TX_FEE_MINE_CONTENT: number | undefined }} conf  - the list of configuation param you want to add.
   *
   * @property { number | undefined} BLOCK_MAX_SIZE max size of the block, default is 2000;
   * @property { number | undefined} BLOCK_MIN_DIFFICULTY minimum difficulty for hashing, default is 3;
   * @property { number | undefined} BLOCK_HASH_RATE_AVERAGE number of blocks to use to determine the average of hash rate and calculate difficulty, default is 1;
   * @property { number | undefined} BLOCK_MAX_DIFFICULTY max difficulty, default is 9;
   * @property { number | undefined} BLOCK_HASH_RATE_BY_DAY numb of block we want to make by day ,default is 24;
   * @property {'SHA265' | 'MD5' | undefined} BLOCK_HASH_METHOD the hash method to use the chain, 'SHA265' or 'MD5', default is 'SHA256';
   * @property { number | undefined } TX_CONTENT_EXPIRATION_HOURS how many hours is store the content in a transaction before being cleaned? default is 24;
   * @property { number | undefined } TX_CONTENT_MAX_SIZE_KO max size in KO for a content, default is 250;
   * @property { number | undefined } TX_MAX_SIZE_KO max size in Ko of a transaction if we take off the content, default is 0.75;
   * @property { number | undefined } BLOCK_MAX_SIZE_KO max size in Ko for teh block, default is 300;
   * @property { array<string> | undefined } FOUNDERS list of the public of blockchain founders, used for future administration of the chain.
   * @property { * } GENESIS_BLOCK the params of the genesis block of the chain, heigth 0
   * @property {  number | undefined } MONEY_BY_BLOCK the money created by block, default is 15.
   * @property {  number | undefined } MONEY_BY_KO the money by Ko to post a content, default is 1.
   * @property {  number | undefined } TX_FEE_MINE_MONEY tax fee for mining a transaction of money, as ratio, default is 0.1.
   * @property {  number | undefined } TX_FEE_MINE_OWNERSHIP tax fee for mining a transaction of ownership, as ratio, default is 0.1.
   * @property {  number | undefined } TX_FEE_MINE_CONTENT tax fee for mining a transaction of content, as ratio, default is 0.25.
   */
  constructor(conf) {
    this.BLOCK_MIN_DIFFICULTY =
      conf && conf.BLOCK_MIN_DIFFICULTY ? conf.BLOCK_MIN_DIFFICULTY : 3;

    this.BLOCK_HASH_RATE_AVERAGE =
      conf && conf.BLOCK_HASH_RATE_AVERAGE && conf.BLOCK_HASH_RATE_AVERAGE > 0
        ? conf.BLOCK_HASH_RATE_AVERAGE
        : 1;

    this.BLOCK_MAX_DIFFICULTY =
      conf && conf.BLOCK_MAX_DIFFICULTY ? conf.BLOCK_MAX_DIFFICULTY : 9;

    this.BLOCK_HASH_RATE_BY_DAY =
      conf && conf.BLOCK_HASH_RATE_BY_DAY ? conf.BLOCK_HASH_RATE_BY_DAY : 24;

    this.BLOCK_HASH_METHOD =
      conf && conf.BLOCK_HASH_METHOD === "MD5" ? MD5 : SHA256;

    this.TX_CONTENT_EXPIRATION_HOURS =
      conf && conf.TX_CONTENT_EXPIRATION_HOURS
        ? conf.TX_CONTENT_EXPIRATION_HOURS
        : 24;

    this.TX_CONTENT_MAX_SIZE_KO =
      conf && conf.TX_CONTENT_MAX_SIZE_KO ? conf.TX_CONTENT_MAX_SIZE_KO : 250;

    this.TX_MAX_SIZE_KO =
      conf && conf.TX_MAX_SIZE_KO ? conf.TX_MAX_SIZE_KO : 0.75;

    this.BLOCK_MAX_SIZE_KO =
      conf && conf.BLOCK_MAX_SIZE_KO ? conf.BLOCK_MAX_SIZE_KO : 300;

    this.FOUNDERS = conf && conf.FOUNDERS ? conf.FOUNDERS : [];

    this.GENESIS_BLOCK = conf && conf.GENESIS_BLOCK ? conf.GENESIS_BLOCK : {};

    //All fees
    this.MONEY_BY_BLOCK =
      conf && conf.MONEY_BY_BLOCK ? conf.MONEY_BY_BLOCK : 15;
    this.MONEY_BY_KO = conf && conf.MONEY_BY_KO ? conf.MONEY_BY_KO : 1;

    this.TX_FEE_MINE_MONEY =
      conf && conf.TX_FEE_MINE_MONEY ? conf.TX_FEE_MINE_MONEY : 0.1;

    this.TX_FEE_MINE_OWNERSHIP =
      conf && conf.TX_FEE_MINE_OWNERSHIP ? conf.TX_FEE_MINE_OWNERSHIP : 0.1;

    this.TX_FEE_MINE_CONTENT =
      conf && conf.TX_FEE_MINE_CONTENT ? conf.TX_FEE_MINE_CONTENT : 0.25;
  }
}

export default Config;
