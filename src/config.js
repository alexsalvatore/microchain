export default class Config {
  constructor(conf) {
    this.CONTENT_FUNGIBLE =
      conf && conf.CONTENT_FUNGIBLE !== undefined
        ? conf.CONTENT_FUNGIBLE
        : true;

    this.BLOCK_MAX_SIZE =
      conf && conf.BLOCK_MAX_SIZE ? conf.BLOCK_MAX_SIZE : 2000;

    this.BLOCK_MIN_DIFFICULTY =
      conf && conf.BLOCK_MIN_DIFFICULTY ? conf.BLOCK_MIN_DIFFICULTY : 3;

    //All fees
    this.MONEY_BY_BLOCK =
      conf && conf.MONEY_BY_BLOCK ? conf.MONEY_BY_BLOCK : 15;
    this.MONEY_BY_KO = conf && conf.MONEY_BY_KO ? conf.MONEY_BY_KO : 2.5;

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
