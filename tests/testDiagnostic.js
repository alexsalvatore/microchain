import { Blockchain, Wallet, Block } from "../src/index.js";
import fs from "fs";

let blocks = null;
// try to read if file
if (fs.existsSync("chainExpirable.json")) {
  const rawdata = fs.readFileSync("chainExpirable.json");
  if (rawdata) blocks = JSON.parse(rawdata);
}

const walletSato = new Wallet(
  "04820be6a65e928d52e92b8bfe7827de7a09d3afa1356ef81f6f8528b44ba84393d32b44e4590fa9ca6b9576a6d7f2f0467af33d8f68f83e1359a8e4981f4ed5f6",
  "b6d7cf41b14a972dc3b294ea9ec0c763886e7cb9699214192f2479791ec845e8"
);

const chain = Blockchain.init(
  {
    CONTENT_FUNGIBLE: true,
    BLOCK_HASH_METHOD: "MD5",
    BLOCK_MIN_DIFFICULTY: 3,
    BLOCK_MAX_DIFFICULTY: 3,
    TX_CONTENT_EXPIRATION_HOURS: 12,
    MONEY_BY_BLOCK: 15,
    MONEY_BY_KO: 1.2,
    TX_CONTENT_MAX_SIZE_KO: 200,
    GENESIS_BLOCK: {
      publisher: walletSato.publicKey,
    },
    FOUNDERS: [walletSato.publicKey],
  },
  blocks
);
chain.getDiagnostic();
