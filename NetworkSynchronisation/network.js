const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const Blockchain = require("./blockchain");

const app = express();
const port = process.argv[2];

const supplyChain = new Blockchain();
const nodeAddress = Math.random().toString(36).substring(2);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ---------------- TRANSACTIONS ---------------- */

// Create transaction locally
app.post("/transaction", (req, res) => {
  const { tvId, holder, condition } = req.body;
  const blockIndex = supplyChain.createNewTransaction(tvId, holder, condition);
  res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

// Broadcast transaction to all nodes
app.post("/transaction/broadcast", async (req, res) => {
  const { tvId, holder, condition } = req.body;

  supplyChain.createNewTransaction(tvId, holder, condition);

  const requests = supplyChain.networkNodes.map(nodeUrl =>
    axios.post(`${nodeUrl}/transaction`, { tvId, holder, condition })
  );

  await Promise.all(requests);
  res.json({ note: "Transaction broadcasted successfully." });
});

/* ---------------- BLOCKS ---------------- */

// Mine (create) a new block
app.get("/mine", async (req, res) => {
  const lastBlock = supplyChain.getLastBlock();
  const previousBlockHash = lastBlock.hash;

  const currentBlockData = {
    transactions: supplyChain.pendingTransactions,
    index: lastBlock.index + 1
  };

  const nonce = supplyChain.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = supplyChain.hashBlock(previousBlockHash, currentBlockData, nonce);

  const newBlock = supplyChain.createNewBlock(nonce, previousBlockHash, blockHash);

  const requests = supplyChain.networkNodes.map(nodeUrl =>
    axios.post(`${nodeUrl}/receive-new-block`, { newBlock })
  );

  await Promise.all(requests);

  res.json({
    note: "New block mined & broadcasted",
    block: newBlock
  });
});

// Receive block from network
app.post("/receive-new-block", (req, res) => {
  const { newBlock } = req.body;
  const lastBlock = supplyChain.getLastBlock();

  if (
    lastBlock.hash === newBlock.previousBlockHash &&
    lastBlock.index + 1 === newBlock.index
  ) {
    supplyChain.chain.push(newBlock);
    supplyChain.pendingTransactions = [];
    res.json({ note: "New block accepted." });
  } else {
    res.json({ note: "New block rejected." });
  }
});

/* ---------------- NETWORK ---------------- */

// Register new node
app.post("/register-node", (req, res) => {
  const { newNodeUrl } = req.body;
  if (!supplyChain.networkNodes.includes(newNodeUrl)) {
    supplyChain.networkNodes.push(newNodeUrl);
  }
  res.json({ note: "Node registered." });
});

// Register multiple nodes
app.post("/register-nodes-bulk", (req, res) => {
  const { allNetworkNodes } = req.body;
  allNetworkNodes.forEach(nodeUrl => {
    if (!supplyChain.networkNodes.includes(nodeUrl)) {
      supplyChain.networkNodes.push(nodeUrl);
    }
  });
  res.json({ note: "Bulk registration successful." });
});

/* ---------------- SYNCHRONISATION ---------------- */

// Consensus (longest chain rule)
app.get("/consensus", async (req, res) => {
  const requests = supplyChain.networkNodes.map(nodeUrl =>
    axios.get(`${nodeUrl}/blockchain`)
  );

  const responses = await Promise.all(requests);

  let maxLength = supplyChain.chain.length;
  let newLongestChain = null;

  responses.forEach(response => {
    const chain = response.data.chain;
    if (chain.length > maxLength && supplyChain.chainIsValid(chain)) {
      maxLength = chain.length;
      newLongestChain = chain;
    }
  });

  if (newLongestChain) {
    supplyChain.chain = newLongestChain;
    res.json({ note: "Chain replaced.", chain: supplyChain.chain });
  } else {
    res.json({ note: "Current chain is authoritative." });
  }
});

// Return blockchain
app.get("/blockchain", (req, res) => {
  res.json(supplyChain);
});

app.listen(port, () => {
  console.log(`Node running on port ${port}`);
});
