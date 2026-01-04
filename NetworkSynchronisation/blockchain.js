const crypto = require("crypto");

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.networkNodes = [];

    // Genesis block
    this.createNewBlock(100, "0", "0");
  }

  createNewBlock(nonce, previousBlockHash, hash) {
    const newBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  createNewTransaction(tvId, holder, condition) {
    const newTransaction = {
      tvId,
      holder,
      condition,
      timestamp: Date.now()
    };

    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock().index + 1;
  }

  hashBlock(previousBlockHash, currentBlockData, nonce) {
    const dataAsString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);

    return crypto
      .createHash("sha256")
      .update(dataAsString)
      .digest("hex");
  }

  proofOfWork(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    while (hash.substring(0, 4) !== "0000") {
      nonce++;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
  }

  chainIsValid(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      const blockHash = this.hashBlock(
        previousBlock.hash,
        {
          transactions: currentBlock.transactions,
          index: currentBlock.index
        },
        currentBlock.nonce
      );

      if (blockHash.substring(0, 4) !== "0000") return false;
      if (currentBlock.previousBlockHash !== previousBlock.hash) return false;
    }
    return true;
  }
}

module.exports = Blockchain;
