import { Transaction, Chain, Wallet, Block } from "./index.js";

const walletSato = new Wallet();
const walletDolores = new Wallet();

const transaction1 = walletSato.createTransaction({
  payer: walletSato.publicKey,
  content: "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
});
const block1 = new Block({
  publisher: walletSato.publicKey,
  prevHash: Chain.instance.lastBlock.hash,
  transactions: JSON.stringify([transaction1]),
});
block1.sign(walletSato);
block1.mine(Chain.instance.lastBlock);
Chain.instance.addBlock(block1);

const transaction2 = walletDolores.createTransaction({
  payer: walletDolores.publicKey,
  content:
    "https://resize-parismatch.lanmedia.fr/img/var/news/storage/images/paris-match/culture/cinema/elle-etait-la-lolita-de-stanley-kubrick-l-actrice-sue-lyon-est-morte-1666818/27181746-1-fre-FR/Elle-etait-la-Lolita-de-Stanley-Kubrick-l-actrice-Sue-Lyon-est-morte.jpg",
});

const block2 = new Block({
  publisher: walletDolores.publicKey,
  prevHash: Chain.instance.lastBlock.hash,
  transactions: JSON.stringify([transaction2]),
});
block2.sign(walletSato);
block2.mine(Chain.instance.lastBlock);
Chain.instance.addBlock(block2);

/*const chain = Chain.instance;
chain.addBlock(
  new Transaction({
    payer: "Satoshi",
    content:
      "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
  })
);*/

Chain.instance.logChain();
