import { Chain, Wallet, Block } from "../src/index.js";
import fs from "fs";

const blockEveryMinutes = 2;
const hashRateTarget = (24 * 60) / blockEveryMinutes;
console.log("BLOCK_HASH_RATE_BY_DAY", hashRateTarget);

const walletSato = new Wallet();
const chain = Chain.init({
  CONTENT_FUNGIBLE: false,
  BLOCK_HASH_RATE_BY_DAY: hashRateTarget,
  BLOCK_HASH_METHOD: "MD5",
});

chain.on("blockAdded", () => {
  let data = JSON.stringify(chain.chain);
  fs.writeFileSync("chain.json", data);
});

let n = 0;
while (n < hashRateTarget * 5) {
  const block = new Block({
    height: chain.lastBlock.height + 1,
    publisher: walletSato.publicKey,
    prevHash: chain.lastBlock.hash,
  });

  const minutesBetweenBlocks = (block.ts - chain.lastBlock.ts) / 1000;
  console.log(
    `Height: ${block.height}, Difficulty: ${block.difficulty}, interval:${
      minutesBetweenBlocks / 60
    } minutes`
  );

  block.sign(walletSato);
  block.mine();
  chain.addBlock(block);
  n++;
}
