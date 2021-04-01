import elliptic from "elliptic";
import Chain from "./chain.js";
import Transaction from "./transaction.js";
const ec = new elliptic.ec("secp256k1");

export default class Wallet {
  publicKey;
  privateKey;

  constructor(publicKey, privateKey) {
    //If no value we generate the values
    if (!publicKey) {
      this.generatePair();
    } else {
      this.publicKey = publicKey;
      this.privateKey = privateKey;
    }
  }

  generatePair() {
    const keypair = ec.genKeyPair();
    this.publicKey = keypair.getPublic("hex");
    this.privateKey = keypair.getPrivate("hex");
  }

  createTransaction(transactionOpt) {
    const transaction = new Transaction(transactionOpt);
    transaction.sign(this);
    return transaction;
  }

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

  static verifySignature(message, signature, publicKey) {
    try {
      const keypair = ec.keyFromPublic(publicKey, "hex");
      return ec.verify(message, signature, keypair);
    } catch (error) {
      return false;
    }
  }
}
