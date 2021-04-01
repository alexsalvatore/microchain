import { Transaction, Chain, Wallet, Block } from "./index.js";

const walletSato = new Wallet();
const transaction1 = walletSato.createTransaction(
  new Transaction({
    payer: "Satoshi",
    content:
      "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
  })
);
const block1 = new Block({
  publisher: walletSato.publicKey,
  prevHash: Chain.instance.lastBlock.hash,
  transactions: JSON.stringify([transaction1]),
});
block1.sign(walletSato);
block1.proofOfWork();
Chain.instance.addBlock(block1);

/*const chain = Chain.instance;
chain.addBlock(
  new Transaction({
    payer: "Satoshi",
    content:
      "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
  })
);*/

Chain.instance.logChain();
