const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017';
const dbName = 'supplyChainDB';

let db = null;

async function connectDB() {
    if (db) return db;

    const client = new MongoClient(url);
    await client.connect();

    console.log(' Connected to MongoDB');

    db = client.db(dbName);
    return db;
}

module.exports = { connectDB };

/*What this does (in simple terms)

Connects to MongoDB

Selects supplyChainDB

Reuses the connection (efficient)

Uses async/await because DB connection takes time*/