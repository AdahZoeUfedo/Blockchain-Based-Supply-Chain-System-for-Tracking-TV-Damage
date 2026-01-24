const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');

const app = express();
const PORT = 3000;

const supplyChain = new Blockchain();

app.use(bodyParser.json());
app.use(express.static('frontend'));

// =======================
// CREATE SCAN TRANSACTION
// =======================
app.post('/scan', async (req, res) => {
    try {
        const {
            tvId,
            location,
            handler,
            condition,
            privateKey,
            publicKey
        } = req.body;

        supplyChain.createScanTransaction(
            tvId,
            location,
            handler,
            condition,
            privateKey,
            publicKey
        );

        await supplyChain.createNewBlock(
            supplyChain.getLastBlock().hash
        );

        res.json({ success: true, message: 'Scan recorded successfully' });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// =======================
// GET BLOCKCHAIN
// =======================
app.get('/blocks', (req, res) => {
    res.json(supplyChain.chain);
});

// =======================
// BLAME DETECTION
// =======================
app.get('/blame/:tvId', (req, res) => {
    const tvId = req.params.tvId;

    const history = supplyChain.chain
        .flatMap(block => block.transactions)
        .filter(tx => tx.tvId === tvId);

    for (let i = 0; i < history.length; i++) {
        if (history[i].condition === 'DAMAGED') {
            if (i === 0) {
                return res.json({ result: 'Damage at Factory' });
            }
            const prev = history[i - 1];
            return res.json({
                result: `TV damaged after approval by ${prev.handler} at ${prev.location}`
            });
        }
    }

    res.json({ result: 'No damage detected' });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});