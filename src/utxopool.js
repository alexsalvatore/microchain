import { of } from "ramda";
import Bank from "./bank.js";
import Config from "./config.js";
import Transaction from "./transaction.js";

export default class UTXOPool {
  constructor(conf, bank = null) {
    this.config = new Config(conf);
    this.bank = bank ? bank : new Bank();
  }

  addTX(tx, miner) {
    tx = new Transaction(tx);
    const isValid = this.isTXValid(tx);
    if (!isValid) {
      console.error("TX not valid", tx);
      return false;
    }

    //We add the hash to the TX pool to be sure it won't be use again
    this.bank.txPool.push(tx.hash);

    if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_OWNERSHIP) {
      this.addOwnershipTo(tx.sender, tx.ownership, -tx.amount);
      this.addOwnershipTo(
        tx.receiver,
        tx.ownership,
        tx.amount - tx.amount * this.config.TX_FEE_MINE_OWNERSHIP
      );
      this.addOwnershipTo(
        miner,
        tx.ownership,
        tx.amount * this.config.TX_FEE_MINE_OWNERSHIP
      );
    } else if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_CONTENT) {
      // Posting Content
      // if (this.config.CONTENT_FUNGIBLE) {
      // Content = $
      // Content = ownership and share
      console.log("tx.contentSizeKo", tx.contentSizeKo);
      this.addMoneyToSender(
        tx.sender,
        -tx.contentSizeKo * this.config.MONEY_BY_KO
      );
      console.log(
        "addMoneyToSender",
        tx.contentSizeKo * this.config.MONEY_BY_KO
      );
      this.addMoneyToSender(
        miner,
        tx.contentSizeKo *
          this.config.MONEY_BY_KO *
          this.config.TX_FEE_MINE_MONEY
      );
      console.log(
        "addMoneyToReceiver",
        tx.contentSizeKo *
          this.config.MONEY_BY_KO *
          this.config.TX_FEE_MINE_MONEY
      );
      /*} else {
        this.addOwnershipTo(
          tx.sender,
          tx.contentHash,
          1 - 1 * this.config.TX_FEE_MINE_OWNERSHIP
        );
        this.addOwnershipTo(
          miner,
          tx.contentHash,
          this.config.TX_FEE_MINE_OWNERSHIP
        );
      }*/
    }
  }

  addOwnershipTo(walletId, ownershipId, amount) {
    if (!this.bank.ownershipPool[walletId])
      this.bank.ownershipPool[walletId] = [];
    const ownerships = this.bank.ownershipPool[walletId];
    const index = ownerships.findIndex((o) => o.id === ownershipId);
    if (index > -1) {
      ownerships[index].amount += amount;
    } else {
      ownerships.push({
        id: ownershipId,
        amount,
      });
    }
    this.bank.ownershipPool[walletId] = ownerships;
  }

  getOwnershipForSenderAnId(sender, id) {
    if (!this.bank.ownershipPool[sender]) return null;
    const ownership = this.bank.ownershipPool[sender].find((l) => l.id === id);
    return ownership;
  }

  getMoneyForSender(sender) {
    if (!this.bank.moneyPool[sender]) return null;
    return this.bank.moneyPool[sender];
  }

  addMoneyToSender(sender, money) {
    if (!this.bank.moneyPool[sender]) {
      this.bank.moneyPool[sender] = 0;
    }
    this.bank.moneyPool[sender] += money;
  }

  addBlock(block) {
    // Add ownership for block
    if (!this.bank.ownershipPool[block.publisher]) {
      this.bank.ownershipPool[block.publisher] = [];
    }

    this.bank.ownershipPool[block.publisher].push({
      id: block.hash,
      amount: 1,
    });

    // Add money for block
    this.addMoneyToSender(block.publisher, this.config.MONEY_BY_BLOCK);

    const txs = block.getTransactions();
    for (let tx of txs) {
      this.addTX(tx, block.publisher);
    }
  }

  isTXValid(tx) {
    // if (this.bank.txPool.length > 0) console.log(this.bank.txPool);
    if (this.isHashExisting(tx.hash)) {
      console.error(`Hash ${tx.hash} already exist, transaction isn't valid`);
      return false;
    }

    if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_OWNERSHIP) {
      const ownership = this.getOwnershipForSenderAnId(tx.sender, tx.ownership);
      return ownership && tx.amount <= ownership.amount && tx.amount > 0;
    } else if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_CONTENT) {
      //Test if poster got the money for the post
      const senderMoney = this.getMoneyForSender(tx.sender);
      return senderMoney - tx.contentSizeKo * this.config.MONEY_BY_KO >= 0;
    } else if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_MONEY) {
      const senderMoney = this.getMoneyForSender(tx.sender);
      return senderMoney - tx.amount >= 0;
    }
    return true;
  }

  isHashExisting(hash) {
    return this.bank.txPool.find((h) => h === hash) !== undefined;
  }

  static TX_TYPE_NONE = 0;
  static TX_TYPE_MONEY = 1;
  static TX_TYPE_OWNERSHIP = 2;
  static TX_TYPE_CONTENT = 3;

  // Get the Transaction type
  static typeofTX(tx) {
    if (tx.ownership) {
      return UTXOPool.TX_TYPE_OWNERSHIP;
    } else if (tx.contentHash) {
      return UTXOPool.TX_TYPE_CONTENT;
    } else if (tx.amount && tx.sender && tx.receiver) {
      return UTXOPool.TX_TYPE_MONEY;
    }
    return UTXOPool.TX_TYPE_NONE;
  }

  getBank() {
    return this.bank;
  }
}
