# Microchain 💴

_Microchain_ is a Javascript lib for creating small blockchain on Node JS & Web client.

## Installation

```bash
npm i @asalvatore/microchain
```

## Usage

Create and add a block to the chain instance

```javascript
const walletSato = new Wallet();

const transaction1 = walletSato.createTransaction({
  sender: walletSato.publicKey,
  content: "https://pbs.twimg.com/media/EwxqyQdXMAAlqIb?format=jpg&name=medium",
});

const block1 = new Block({
  height: Chain.instance.lastBlock.height + 1,
  publisher: walletSato.publicKey,
  prevHash: Chain.instance.lastBlock.hash,
  transactions: JSON.stringify([transaction1]),
});

block1.sign(walletSato);
block1.mine();
Chain.instance.addBlock(block1);
```

## To Do

- create an hash list for transactions to avoid re-spending.
- re-initiate the UTXOPool with the longuest chain after each block add.
- think about the logic of content spending.
- manage block and transaction announce with webRTC?

## Author

You can contact me on Twitter:
[@salvator_io](https://twitter.com/salvator_io)
