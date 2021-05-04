# Microchain 💴

_Microchain_ is a blockchain Lib specially designed to run in browser & Node JS environnement, used to propel forum, allowing file posting in transactions and making theses files expirable to manage the size of the blockchain. The next coming feature will be the administration of the blockchain (content moderation, money making, forcing difficulty, etc.) with a list of public keys known as Founders, hosted in the genesis block.

There is no dependence to any other blockchain infrastructure. You create your very own blockchain with few lines of javascript.

Of course, the project is work in progress, and there are still things to improve: :warning: **to be clear**
you should not use Microchain as crypto-currency and if you sold some of your blockchain’s tokens, your users need to consider this bought as a donation and probably not as a long term stock market investment. _Microchain_ is not about money but content and communication.

## Installation

```bash
npm i @asalvatore/microchain
```

## Basics

Create and add a block to the chain instance

```javascript
import { Blockchain, Wallet, Block } from "../src/index.js";

// initialize a wallet
// with no option, it generate it self a public and private key
const walletSato = new Wallet();

// Get the instance of the chain. Also pass the config of it, with fees and if TX content are fungible or not.
const chain = Blockchain.init({
  // Pass the genesis block param has options
  // It's the config of your blockchain!
  // If you change it, the ancients mined block wont be accepted
  GENESIS_BLOCK: {
    publisher: walletSato.publicKey,
  },
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

// Sign the block with the miner wallet
block1.sign(walletSato);

// Launch the mining process
block1.mine();

// After mining we add the block to the chain
chain.addBlock(block1);

// We log to see if all was added to the chain
chain.logChain();
chain.logUTXO();
```

To listen events on the chain you can use _blockAdded_.

```javascript
chain.on("blockAdded", () => {
  let data = JSON.stringify(chain.chain);
  fs.writeFileSync("chain.json", data);
});
```

## Create expirable content

Expirable content is a content hosted in a transaction. Blocks need to host it till the expiration date. In the following exeample you add _TX_CONTENT_EXPIRATION_HOURS_ , which is the expiration limit for content to the config (24h by default), and add your data to the transaction _content_ propretie. Example in _tests/testExpirable.js_.

- **MONEY_BY_BLOCK** is the amount of money you get by a mined block.
- **MONEY_BY_KO** is the amount of money you need by Ko to post content in transactions (note than there's also properties to manage the miningfees).
- **TX_CONTENT_MAX_SIZE_KO** the max size of a transaction content in Ko, default is 250 Ko.
- **BLOCK_MAX_SIZE_KO** the max size of a block in Ko, default is 300 Ko.

```javascript
import { Blockchain, Wallet, Block } from "../src/index.js";
import fs from "fs";
import { img2 } from "./assets/img2.js";

let blocks = null;

// try to read if file
if (fs.existsSync("chainExpirable.json")) {
  const rawdata = fs.readFileSync("chainExpirable.json");
  if (rawdata) blocks = JSON.parse(rawdata);
}

// Init the wallet using existing public & private keys
const walletSato = new Wallet(
  "04820be6a65e928d52e92b8bfe7827de7a09d3afa1356ef81f6f8528b44ba84393d32b44e4590fa9ca6b9576a6d7f2f0467af33d8f68f83e1359a8e4981f4ed5f6",
  "b6d7cf41b14a972dc3b294ea9ec0c763886e7cb9699214192f2479791ec845e8"
);

const chain = Blockchain.init(
  // It's the config of your blockchain!
  // If you change it, the ancients mined block wont be accepted
  {
    // The hash method use to hash block and transactions
    BLOCK_HASH_METHOD: "MD5",
    // The maximum difficulty to hash a block (number of 0 at the start of the block)
    BLOCK_MAX_DIFFICULTY: 5,
    // When the content of block expire to liberate size in the chain?
    TX_CONTENT_EXPIRATION_HOURS: 12,
    // Money you earn by block
    MONEY_BY_BLOCK: 15,
    // Money you need to use by KO of content KO
    MONEY_BY_KO: 1.2,
    GENESIS_BLOCK: {
      // Public key of the publisher of the genesis
      publisher: walletSato.publicKey,
    },
  },
  blocks
);

const transaction1 = walletSato.createTransaction({
  sender: walletSato.publicKey,
  content: img2,
});
transaction1.sign(walletSato);

//Return if there is enought money for this transaction for this transaction
chain.enoughtMoneyFrom(transaction1, walletSato.publicKey);
chain.logUTXO();

const block = new Block({
  height:
    chain.lastBlock && (chain.lastBlock.height || chain.lastBlock.height === 0)
      ? chain.lastBlock.height + 1
      : 0,
  publisher: walletSato.publicKey,
  transactions: JSON.stringify([transaction1]),
  prevHash: chain.lastBlock && chain.lastBlock.hash ? chain.lastBlock.hash : "",
});

// Don't forget to sign the block with your wallet!
block.sign(walletSato);
// Launch the mining, it couls take a while!
block.mine();
// also don't forget to add the block to the chain!
chain.addBlock(block);
```

## Change log

###### V 1.1.2 (fix)

- Take off the non-fungible content in config. Not bahaving properly.
- use the _addBlock_ method for the genesis block

###### V 1.1.0

- Added expirable content in transaction.
- added a channel property in transaction propertie, for crypted conversation when content is crypted.
- added the config's Hash to all block mined.
- added the _GENESIS_BLOCK_ to config. It's the properties you want in the geneseis block

###### V 1.0.11

- Added an number of average of the last _n_ blocks to calculate the difficulty, but the result isn't very convincing. You can use it with the _BLOCK_HASH_RATE_AVERAGE_ property of the _Config_ class. It's 1 by default.
- Added the "blockAdded" event emitters on the chain instance.
- The chain constructor can know take an existing list of block as second parameter.
- Difficulty is now a comparison between block _height-1_ and block _height-BLOCK_HASH_RATE_AVERAGE-1_. It's to keep the diffiiculty constant during mining.
- Renamed the class Chain to Blockchain, because _chain.chain_ is not pretty.
- Checking block validity before adding them to the chain, especialy difficulty, timestamp and height coherence.

###### V 1.0.10

- Property _BLOCK_HASH_METHOD_ added to the _Config_ class, you can pass "SHA256" or "MD5"
- Added difficulty management. use this script to test an Hash rate of 2 minutes.

```
npm run testDifficulty
```

## To Do

- create an hash list for transactions to avoid double-spending.
- Send _instruction(s)_ form the _founders_ of the chain to administrate it.
- re-initiate the UTXOPool with the longuest chain after each block add.
- manage block and transaction announce with webRTC?

## Author

You can contact me on Twitter:
[@salvator_io](https://twitter.com/salvator_io)
