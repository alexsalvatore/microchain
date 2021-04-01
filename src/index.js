//Found here https://stackoverflow.com/questions/38340500/export-multiple-classes-in-es6-modules
import Transaction from "./transaction.js";
import Chain from "./chain.js";
import Wallet from "./wallet.js";
import Block from "./block.js";

// without default
export { Transaction, Chain, Wallet, Block };
