/**
 * Class Bank
 * Helper for all the UTXO Data
 */
class Bank {
  /**
   * @property {array<string>} txPool the list of transaction hash, mostly to avoid double spending.
   * @property {{key: string, value:number}} moneyPool dictionnary of publickeys, with the amount of money of each.
   * @property {{key: string, value: Array<{key: string, value:number}>}} ownershipPool dictionnary of publickeys, with the array of owned ratio of token.
   */
  constructor(bank) {
    this.txPool = bank?.txPool ? bank.txPool : [];
    this.moneyPool = bank?.moneyPool ? bank.moneyPool : {};
    this.ownershipPool = bank?.ownershipPool ? bank.ownershipPool : {};
  }

  /**
   * @property {function} getMoneyForSender get the amount of money for a public key.
   * @param {string} sender the user public key.
   * @returns {number} the amoutn of money own by user public key.
   */
  getMoneyForSender(sender) {
    if (!this.moneyPool[sender]) return 0;
    return this.moneyPool[sender];
  }

  /**
   * @property {function} getOwnershipForSenderAnId get the ratio of ownership, for a block token for a public key.
   * @param {string} sender the user public key.
   * @param {string} id to test for ownership.
   * @returns {number}  the ratio of ownership, for a block token for this public key.
   */
  getOwnershipForSenderAnId(sender, id) {
    if (!this.ownershipPool[sender]) return 0;
    const ownership = this.ownershipPool[sender].find((l) => l.id === id);
    return ownership;
  }

  /**
   * @property {function} getOwnershipsForSender get all the ratio of ownerships, for a public key.
   * @param {string} sender the user public key.
   * @returns {Array}  the list of ownership, for this public key.
   */
  getOwnershipsForSender(sender) {
    if (!this.ownershipPool[sender]) return 0;
    const ownerships = this.ownershipPool[sender];
    return ownerships;
  }

  /**
   * @property {function} getAllOwnshipsForToken get all the ratio of ownerships, for a public key.
   * @param {string} id the hash value of the block.
   * @returns {Array}  the list of ownerships, with public key on amount.
   */
  getAllOwnershipsForToken(id) {
    const ownerships = {};

    for (let [publicKey, value] of Object.entries(ownerships)) {
      value.forEach((own) => {
        const ownership = own.find((l) => l.id === id);
        if (ownership) ownerships[{ publicKey, amount: ownership.amount }];
      });
    }

    return ownerships;
  }

  /**
   * @property {function} stringify Stringify the bank for data transfert.
   * @returns {string} Stringified object.
   */
  stringify() {
    return JSON.stringify(this);
  }

  /**
   * @property {function} clone Clone the bank.
   * @returns {Bank} return a new bank object.
   */
  clone() {
    return { ...this };
  }

  /**
   * @property {} log Console log the bank instance.
   */
  log() {
    console.log("========= OWNERSHIPs ==========");
    console.log(this.ownershipPool);
    console.log("========= $ ==========");
    console.log(this.moneyPool);
  }
}

export default Bank;
