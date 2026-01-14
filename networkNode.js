const express = require('express');
const bodyParser = require('body-parser');

const Blockchain = require('./blockchain');

const app = express();
const supplyChain = new Blockchain();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = 3001;

app.get('/blockchain', (req, res) => {
    res.send(supplyChain.chain);
});

app.post('/transaction', (req, res) => {
    try {
        const {
            tvId,
            location,
            handler,
            condition,
            privateKey,
            publicKey
        } = req.body;

        const transaction = supplyChain.createScanTransaction(
            tvId,
            location,
            handler,
            condition,
            privateKey,
            publicKey
        );

        res.json({
            message: 'Transaction added successfully',
            transaction
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/mine', async (req, res) => {
    const lastBlock = supplyChain.getLastBlock();
    const newBlock = await supplyChain.createNewBlock(lastBlock.hash);

    res.json({
        message: 'New block mined',
        block: newBlock
    });
});
app.listen(PORT, () => {
    console.log(` Network node running on port ${PORT}`);
});
