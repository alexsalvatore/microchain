import { Blockchain, Wallet, Block } from "../src/index.js";
import fs from "fs";

const blockEveryMinutes = 2;
const hashRateTarget = (24 * 60) / blockEveryMinutes;
console.log("BLOCK_HASH_RATE_BY_DAY", hashRateTarget);

let blocks = null;

// try to read if file
if (fs.existsSync("chain.json")) {
  const rawdata = fs.readFileSync("chain.json");
  if (rawdata) blocks = JSON.parse(rawdata);
}

const walletSato = new Wallet();
const chain = Blockchain.init(
  {
    CONTENT_FUNGIBLE: false,
    BLOCK_HASH_RATE_BY_DAY: hashRateTarget,
    BLOCK_HASH_METHOD: "MD5",
  },
  blocks
);

chain.on("blockAdded", () => {
  let data = JSON.stringify(chain.chain);
  fs.writeFileSync("chain.json", data);
});

let n = 0;
while (n < hashRateTarget * 5) {
  console.log(chain.lastBlock);
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

  if (chain.lastBlock) {
    const minutesBetweenBlocks = (block.ts - chain.lastBlock.ts) / 1000;
    console.log(
      `Height: ${block.height}, Difficulty: ${block.difficulty}, interval:${
        minutesBetweenBlocks / 60
      } minutes`
    );
  }

  block.sign(walletSato);
  block.mine();
  chain.addBlock(block);
  n++;
}
