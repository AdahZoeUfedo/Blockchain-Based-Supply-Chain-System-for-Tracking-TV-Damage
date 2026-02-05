const { MongoClient } = require('mongodb');
const sha256 = require('sha256');

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'supplyChainDB';

let db = null;

// DATABASE CONNECTION
async function connectDB() {
    if (db) return db;

    const client = new MongoClient(url);
    await client.connect();
    console.log(' Connected to MongoDB');

    db = client.db(dbName);
    return db;
}

// INITIALIZATION & INDEXING
async function initializeDB() {
    const database = await connectDB();

    // Index for fast lookup
    await database.collection('blocks').createIndex({ index: 1 }, { unique: true });
    await database.collection('pendingTransactions').createIndex({ tvId: 1 });

    console.log(' Database indexes ready');
}

// BLOCK PERSISTENCE
async function saveBlock(block) {
    const database = await connectDB();
    await database.collection('blocks').insertOne(block);
}

async function getAllBlocks() {
    const database = await connectDB();
    return await database.collection('blocks').find().sort({ index: 1 }).toArray();
}

// PENDING TRANSACTION PERSISTENCE
async function savePendingTransaction(tx) {
    const database = await connectDB();
    await database.collection('pendingTransactions').insertOne(tx);
}

async function getPendingTransactions() {
    const database = await connectDB();
    return await database.collection('pendingTransactions').find().toArray();
}

async function clearPendingTransactions() {
    const database = await connectDB();
    await database.collection('pendingTransactions').deleteMany({});
}

// BLOCKCHAIN RECOVERY
async function loadBlockchain(blockchainInstance) {
    const blocks = await getAllBlocks();

    if (blocks.length === 0) return;

    blockchainInstance.chain = blocks;
    console.log(` Loaded ${blocks.length} blocks from MongoDB`);
}

// BLOCKCHAIN VERIFICATION
function verifyBlockchainIntegrity(chain) {
    for (let i = 1; i < chain.length; i++) {
        const current = chain[i];
        const previous = chain[i - 1];

        const recalculatedHash = sha256(
            previous.hash +
            JSON.stringify(current.transactions)
        );

        if (current.previousBlockHash !== previous.hash) {
            throw new Error(` Blockchain broken at block ${current.index}`);
        }

        if (current.hash !== recalculatedHash) {
            throw new Error(` Block hash mismatch at block ${current.index}`);
        }
    }

    console.log(' Blockchain integrity verified');
}

// FULL SYSTEM BOOTSTRAP
async function bootstrapBlockchain(blockchainInstance) {
    await initializeDB();
    await loadBlockchain(blockchainInstance);
    verifyBlockchainIntegrity(blockchainInstance.chain);

    // Reload pending transactions
    const pending = await getPendingTransactions();
    blockchainInstance.pendingTransactions = pending;

    console.log(' Blockchain fully recovered from database');
}

// EXPORTS
module.exports = {
    connectDB,
    initializeDB,
    saveBlock,
    getAllBlocks,
    savePendingTransaction,
    getPendingTransactions,
    clearPendingTransactions,
    loadBlockchain,
    verifyBlockchainIntegrity,
    bootstrapBlockchain
};
