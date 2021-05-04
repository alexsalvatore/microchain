import cryptojs from "crypto-js";
const { SHA256, MD5 } = cryptojs;

export default class Config {
  constructor(conf) {
    /*this.CONTENT_FUNGIBLE =
      conf && conf.CONTENT_FUNGIBLE !== undefined
        ? conf.CONTENT_FUNGIBLE
        : true;*/

    this.BLOCK_MAX_SIZE =
      conf && conf.BLOCK_MAX_SIZE ? conf.BLOCK_MAX_SIZE : 2000;

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

    this.TX_MAX_KO_SIZE_BEFORE_CHARGE =
      conf && conf.TX_MAX_KO_SIZE_BEFORE_CHARGE
        ? conf.TX_MAX_KO_SIZE_BEFORE_CHARGE
        : 1;
  }
}
