const Blockchain = require("./blockchain");

// Create a new blockchain instance
const tvChain = new Blockchain();

console.log("GENESIS BLOCK:");
console.log(tvChain.chain);

// Create transactions (TV scans)
tvChain.createNewTransaction("TV001", "Factory", "Not Damaged");
tvChain.createNewTransaction("TV001", "Driver", "Not Damaged");

// Mine a block
const lastBlock = tvChain.getLastBlock();
const previousHash = lastBlock.hash;

const currentData = {
  transactions: tvChain.pendingTransactions,
  index: lastBlock.index + 1
};

const nonce = tvChain.proofOfWork(previousHash, currentData);
const blockHash = tvChain.hashBlock(previousHash, currentData, nonce);

tvChain.createNewBlock(nonce, previousHash, blockHash);

// Display blockchain
console.log("\nBLOCKCHAIN AFTER FIRST BLOCK:");
console.log(JSON.stringify(tvChain.chain, null, 2));
