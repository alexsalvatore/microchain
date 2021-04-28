import { Blockchain, Wallet, Block } from "../src/index.js";
import fs from "fs";
import { img2 } from "./assets/img2.js";

let blocks = null;

// try to read if file
if (fs.existsSync("chainExpirable.json")) {
  const rawdata = fs.readFileSync("chainExpirable.json");
  if (rawdata) blocks = JSON.parse(rawdata);
}

const walletSato = new Wallet(
  "04820be6a65e928d52e92b8bfe7827de7a09d3afa1356ef81f6f8528b44ba84393d32b44e4590fa9ca6b9576a6d7f2f0467af33d8f68f83e1359a8e4981f4ed5f6",
  "b6d7cf41b14a972dc3b294ea9ec0c763886e7cb9699214192f2479791ec845e8"
);
/*console.log("****************************");
console.log("Public key: " + walletSato.publicKey);
console.log("Private key: " + walletSato.privateKey);
console.log("****************************");*/

const chain = Blockchain.init(
  {
    CONTENT_FUNGIBLE: false,
    BLOCK_HASH_METHOD: "MD5",
    BLOCK_MAX_DIFFICULTY: 5,
    MONEY_BY_BLOCK: 15,
    MONEY_BY_KO: 1.2,
  },
  blocks
);

chain.on("chainReady", () => {
  console.log("Blockchainready fired!");
});

chain.on("blockAdded", () => {
  console.log("block added!");
  let data = JSON.stringify(chain.chain);
  fs.writeFileSync("chainExpirable.json", data);
});

const transaction1 = walletSato.createTransaction({
  sender: walletSato.publicKey,
  content: img2,
});
transaction1.sign(walletSato);
transaction1.log();

chain.enoughtMoneyFrom(transaction1, walletSato.publicKey);
chain.logUTXO();

/*
const block = new Block({
  height:
    chain.lastBlock && (chain.lastBlock.height || chain.lastBlock.height === 0)
      ? chain.lastBlock.height + 1
      : 0,
  publisher: walletSato.publicKey,
  transactions: JSON.stringify([transaction1]),
  prevHash: chain.lastBlock && chain.lastBlock.hash ? chain.lastBlock.hash : "",
});

block.sign(walletSato);
console.log(block);
block.mine();
chain.addBlock(block);*/

/*
//Mining loop
let n = 0;
while (n < 10) {
  //console.log(chain.lastBlock);
  const block = new Block({
    height:
      chain.lastBlock &&
      (chain.lastBlock.height || chain.lastBlock.height === 0)
        ? chain.lastBlock.height + 1
        : 0,
    publisher: walletSato.publicKey,
    prevHash:
      chain.lastBlock && chain.lastBlock.hash ? chain.lastBlock.hash : "",
  });

  block.sign(walletSato);
  console.log("Block send to mining", block);
  block.mine();
  chain.addBlock(block);
  n++;
}*/
