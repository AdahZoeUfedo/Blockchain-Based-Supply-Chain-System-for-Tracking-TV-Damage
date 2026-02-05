const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017'; //the address of our MongoDB server.
const dbName = 'supplyChainDB';

let db = null; //means at the beginning, we haven't connected to any database. Once we connect, we will store the database object here and reuse it for future queries. This is more efficient than creating a new connection every time we want to query the database.

async function connectDB() {
    if (db) return db; //if we already have a connection, return the existing database object

    const client = new MongoClient(url);
    await client.connect();//tells js not to go to the next line till the connection is complete

    console.log(' Connected to MongoDB');

    db = client.db(dbName);
    return db; //gives back the database object to whoever called the fn
}

module.exports = { connectDB };

/*What this does (in simple terms)

Connects to MongoDB

Selects supplyChainDB

Reuses the connection (efficient)

Uses async/await because DB connection takes time*/