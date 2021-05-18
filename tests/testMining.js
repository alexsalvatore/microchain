import { Blockchain, Wallet, Block } from "../index.js";

const walletSato = new Wallet();

// Get the instance of the chain. Also pass the config of it, with fees and if TX content are fungible or not.
const chain = Blockchain.init({
  // BLOCK_MIN_DIFFICULTY: 4,
  GENESIS_BLOCK: { publisher: walletSato.publicKey },
});

// Create and sign a transaction
const transaction1 = walletSato.createTransaction({
  sender: walletSato.publicKey,
  content:
    "https://pbs.twimg.com/media/EwxqsyQdXMAAlqIb?format=jpg&name=medium",
});
const block1 = new Block({
  height: chain.lastBlock.height + 1,
  publisher: walletSato.publicKey,
  prevHash: chain.lastBlock.hash,
  transactions: JSON.stringify([transaction1]),
});

//Sign the block with the miner wallet
block1.sign(walletSato);

// Launch the mining process
if (block1.mine(1000)) {
  console.log("⛏️ Block mined after 1k iterations");
} else if (block1.mine(100000)) {
  console.log("⛏️ Block mined after 100k iterations");
} else if (block1.mine(1000000)) {
  console.log("⛏️ Block mined after 1M iterations");
} else {
  block1.mine();
  console.log(`⛏️ Block mined with ${block1.nonce} iterations`);
}

// After mining we add the block to the chain
chain.addBlock(block1);

// We log to see if all was added to the chain
chain.getBank().log();
