import { Transaction, Chain, Wallet, Block } from "../src/index.js";

const walletSato = new Wallet();
const walletDolores = new Wallet();
const walletKub = new Wallet();

const chain = Chain.init({ CONTENT_FUNGIBLE: false });
// console.log(chain);
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
block1.sign(walletSato);
block1.mine();
chain.addBlock(block1);

const transaction2 = walletDolores.createTransaction({
  sender: walletDolores.publicKey,
  content:
    "https://resize-parismatch.lanmedia.fr/img/var/news/storage/images/paris-match/culture/cinema/elle-etait-la-lolita-de-stanley-kubrick-l-actrice-sue-lyon-est-morte-1666818/27181746-1-fre-FR/Elle-etait-la-Lolita-de-Stanley-Kubrick-l-actrice-Sue-Lyon-est-morte.jpg",
});

const block2 = new Block({
  height: chain.lastBlock.height + 1,
  publisher: walletDolores.publicKey,
  prevHash: chain.lastBlock.hash,
  transactions: JSON.stringify([transaction2]),
});
block2.sign(walletDolores);
block2.mine();
chain.addBlock(block2);

const transaction3 = walletDolores.createTransaction({
  sender: block1.publisher,
  ownership: block1.hash,
  receiver: walletKub.publicKey,
  amount: 0.5,
});

const block3 = new Block({
  height: chain.lastBlock.height + 1,
  publisher: walletSato.publicKey,
  prevHash: chain.lastBlock.hash,
  transactions: JSON.stringify([transaction3]),
});
block3.sign(walletSato);
block3.mine();
chain.addBlock(block3);
chain.logChain();
chain.logUTXO();
