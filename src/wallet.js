import elliptic from "elliptic";
import Transaction from "./transaction.js";
const ec = new elliptic.ec("secp256k1");

/**
 * Class Wallet
 * Manage public and private kesy of users
 * @example
 *
 * const walletSato = new Wallet();
 *
 * console.log("****************************");
 * console.log("Public key: " + walletSato.publicKey);
 * console.log("Private key: " + walletSato.privateKey);
 * console.log("****************************");
 *
 */
class Wallet {
  /**
   * @property {string} publicKey the public key
   * @property {string} privateKey the private key, plz keep it private!
   */
  publicKey;
  privateKey;

  /**
   * Instantiate the wallet
   * if no properties are provided, the wallet generate a key pairs himself
   * @param {string | undefined} publicKey
   * @param {string | undefined} privateKey
   */
  constructor(publicKey, privateKey) {
    //If no value we generate the values
    if (!publicKey) {
      this.generatePair();
    } else {
      this.publicKey = publicKey;
      this.privateKey = privateKey;
    }
  }

  /**
   * @property {function} generatePair method generating a key pair
   */
  generatePair() {
    const keypair = ec.genKeyPair();
    this.publicKey = keypair.getPublic("hex");
    this.privateKey = keypair.getPrivate("hex");
  }

  /**
   * @property {function} createTransaction method returning a signed transaction
   * @param {*} transactionOpt
   * @returns {Transaction}
   */
  createTransaction(transactionOpt) {
    const transaction = new Transaction(transactionOpt);
    transaction.sign(this);
    return transaction;
  }

  /**
   * @property {function} sign method returning a signed message
   * @param {string} message
   * @returns {string}
   */
  sign(message) {
    try {
      const keypair = ec.keyFromPrivate(this.privateKey, "hex");
      const signature = keypair.sign(message).toDER("hex");
      const result = Wallet.verifySignature(message, signature, this.publicKey);
      if (!result) console.error("Bad signature, your key pairs is not valid");
      return signature;
    } catch (error) {
      return console.error(error);
    }
  }

  /**
   * @property {function} verifySignature method returning if signed message is auhtentic or not
   * @param {string} message
   * @param {string} signature
   * @param {string} publicKey
   * @returns {boolean}
   */
  static verifySignature(message, signature, publicKey) {
    try {
      const keypair = ec.keyFromPublic(publicKey, "hex");
      return ec.verify(message, signature, keypair);
    } catch (error) {
      return false;
    }
  }
}

export default Wallet;
