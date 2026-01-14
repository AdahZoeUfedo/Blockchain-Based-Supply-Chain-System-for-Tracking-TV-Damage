//Create an async function, run it immediately, connect to MongoDB, and print the database name

const { connectDB } = require('./db');

(async () => {
    const db = await connectDB();
    console.log('Current database:', db.databaseName);
})();
