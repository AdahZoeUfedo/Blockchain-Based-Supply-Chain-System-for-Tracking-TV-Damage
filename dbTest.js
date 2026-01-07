const { connectDB } = require('./db');

(async () => {
    const db = await connectDB();
    console.log('Current database:', db.databaseName);
})();
