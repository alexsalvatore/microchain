# Microchain 💴

_Microchain_ is a Javascript lib for creating small blockchain on Node JS & Web client. His goal isn't being a crypto-currency, but being a way to distribute content in a semi-decentralized and give a kind of equity to content creators.

:warning: **This lib is not secure**: it is a project in progress! See contact for more informations.

## Installation

```bash
npm i @asalvatore/microchain
```

## Usage

Create and add a block to the chain instance

```javascript
import { Chain, Wallet, Block } from "../src/index.js";

const walletSato = new Wallet();

// Get the instance of the chain. Also pass the config of it, with fees and if TX content are fungible or not.
const chain = Chain.init({ CONTENT_FUNGIBLE: false });

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
chain.logChain();
chain.logUTXO();
```

## Change log

###### V 1.0.10

- Added difficulty management.

## To Do

- difficulty should be the product of the average distance between 4 or more blocks. It's currently the product of the block currently mined and the height-1 block.
- give the ability to choose between SHA256 and MD5 hashing.
- create a _founder_ propertie in the genesis block, an array of public keys that can send _instruction(s)_ to the chain.
- add genesis block in chain's Config class.
- start documentation.
- create an _instruction_ type of transaction.
- create expirable transaction for content, a transaction that can be purged of the chain once a certain time.

- create an hash list for transactions to avoid double-spending.
- check if timestamp of a transaction or a block is not > to the current timestamp or < to the ts of the previous block (only for blocks)
- re-initiate the UTXOPool with the longuest chain after each block add.
- manage block and transaction announce with webRTC?

## Author

You can contact me on Twitter:
[@salvator_io](https://twitter.com/salvator_io)
