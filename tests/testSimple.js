import { Blockchain, Wallet, Block } from "../index.js";

const walletSato = new Wallet();

// Get the instance of the chain. Also pass the config of it, with fees and if TX content are fungible or not.
const chain = Blockchain.init({
  GENESIS_BLOCK: { publisher: walletSato.publicKey },
});

// Create and sign a transaction
const transaction1 = walletSato.createTransaction({
  sender: walletSato.publicKey,
  content: "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
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
block1.mine();

// After mining we add the block to the chain
chain.addBlock(block1);

// We log to see if all was added to the chain
chain.logBlockchain();
chain.getBank().log();
