import { of } from "ramda";

export default class UTXOPool {
  static TX_FEE_MINE_MONEY = 0.1;
  static TX_FEE_MINE_OWNERSHIP = 0.1;
  static TX_FEE_MINE_CONTENT = 0.25;

  constructor() {
    this.contentPool = {};
    this.moneyPool = {};
    this.ownershipPool = {};
  }

  addTX(tx, miner) {
    const isValid = this.isTXValid(tx);
    if (!isValid) {
      console.error("TX not valid", tx);
      return false;
    }

    if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_OWNERSHIP) {
      this.addOwnershipTo(tx.sender, tx.ownership, -tx.amount);
      this.addOwnershipTo(
        tx.receiver,
        tx.ownership,
        tx.amount - tx.amount * UTXOPool.TX_FEE_MINE_OWNERSHIP
      );
      this.addOwnershipTo(
        miner,
        tx.ownership,
        tx.amount * UTXOPool.TX_FEE_MINE_OWNERSHIP
      );
    }
  }

  addOwnershipTo(walletId, ownershipId, amount) {
    //console.log("addOwnershipTo", walletId, ownershipId, amount);
    if (!this.ownershipPool[walletId]) this.ownershipPool[walletId] = [];
    const ownerships = this.ownershipPool[walletId];
    const index = ownerships.findIndex((o) => o.id === ownershipId);
    if (index > -1) {
      ownerships[index].amount += amount;
    } else {
      ownerships.push({
        id: ownershipId,
        amount,
      });
    }
    this.ownershipPool[walletId] = ownerships;
  }

  getOwnershipForSenderAnId(sender, id) {
    if (!this.ownershipPool[sender]) return null;
    const ownership = this.ownershipPool[sender].find(
      (l) => l.ownership === id
    );
    return ownership;
  }

  addBlock(block) {
    if (!this.ownershipPool[block.publisher]) {
      this.ownershipPool[block.publisher] = [];
    }

    this.ownershipPool[block.publisher].push({
      id: block.hash,
      amount: 1,
    });

    const txs = block.getTransactions();
    for (let tx of txs) {
      this.addTX(tx, block.publisher);
    }
  }

  isTXValid(tx) {
    if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_OWNERSHIP) {
      const ownership = this.getOwnershipForSenderAnId(tx.sender, tx.ownership);
      return ownership && tx.amount <= this.ownership.amount && tx.amount > 0;
    } else if (UTXOPool.typeofTX(tx) === UTXOPool.TX_TYPE_CONTENT) {
      return true;
    }
    return true;
  }

  static TX_TYPE_NONE = 0;
  static TX_TYPE_MONEY = 1;
  static TX_TYPE_OWNERSHIP = 2;
  static TX_TYPE_CONTENT = 3;

  // Get the Transaction type
  static typeofTX(tx) {
    if (tx.ownership) {
      return UTXOPool.TX_TYPE_OWNERSHIP;
    }
    return UTXOPool.TX_TYPE_NONE;
  }

  log() {
    console.log("========= OWNERSHIPs ==========");
    console.log(this.ownershipPool);
  }
}
