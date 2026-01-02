const sha256 = require('sha256');
const crypto = require('crypto');

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];

        // Genesis block
        this.createNewBlock('0');
    }

    // =========================
    // 🔗 BLOCKS (BLOCK LINKING)
    // =========================

    createNewBlock(previousBlockHash) {
        const block = {
            index: this.chain.length + 1,
            timestamp: Date.now(),
            transactions: this.pendingTransactions,
            previousBlockHash,
            hash: this.hashBlock(previousBlockHash, this.pendingTransactions)
        };

        this.pendingTransactions = [];
        this.chain.push(block);
        return block;
    }

    getLastBlock() {
        return this.chain[this.chain.length - 1];
    }

    hashBlock(previousBlockHash, transactions) {
        return sha256(
            previousBlockHash +
            JSON.stringify(transactions)
        );
    }

    // =========================
    // 🔑 KEYS & SIGNATURES
    // =========================

    createKeyPair() {
        return crypto.generateKeyPairSync('ec', {
            namedCurve: 'secp256k1',
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
    }

    //announcing blame detection

    signTransaction(hash, privateKey) {
        const sign = crypto.createSign('SHA256');
        sign.update(hash);
        sign.end();
        return sign.sign(privateKey, 'hex');
    }

    verifyTransaction(transaction) {
        const verify = crypto.createVerify('SHA256');
        verify.update(transaction.hash);
        verify.end();
        return verify.verify(transaction.publicKey, transaction.signature, 'hex');
    }

    // =========================
    // 📦 TRANSACTIONS
    // =========================

    createScanTransaction(tvId, location, handler, condition, privateKey, publicKey) {

        // 🧠 SMART CONTRACT CHECKS
        if (!this.isValidNextScan(tvId, location, handler)) {
            throw new Error(`Smart Contract Violation for ${tvId}`);
        }

        const transaction = {
            tvId,
            location,
            handler,
            condition,
            timestamp: Date.now()
        };

        transaction.hash = this.hashTransaction(transaction);
        transaction.signature = this.signTransaction(transaction.hash, privateKey);
        transaction.publicKey = publicKey;

        this.pendingTransactions.push(transaction);
        return transaction;
    }

    hashTransaction(transaction) {
        return sha256(
            transaction.tvId +
            transaction.location +
            transaction.handler +
            transaction.condition +
            transaction.timestamp
        );
    }

    // =========================
    // 🧠 SMART CONTRACT RULES
    // =========================

    isValidNextScan(tvId, newLocation, newHandler) {
        const locationOrder = ['Factory', 'Truck', 'Warehouse'];

        const history = this.chain
            .flatMap(block => block.transactions)
            .filter(tx => tx.tvId === tvId);

        // Rule 1: Must start at Factory
        if (history.length === 0) {
            return newLocation === 'Factory';
        }

        const lastTx = history[history.length - 1];

        // Rule 2: No scans after damage
        if (lastTx.condition === 'DAMAGED') return false;

        // Rule 3: Cannot scan same location twice
        if (lastTx.location === newLocation) return false;

        // Rule 4: Same handler cannot scan twice
        if (lastTx.handler === newHandler) return false;

        // Rule 1 continued: Correct order
        return locationOrder.indexOf(newLocation) ===
               locationOrder.indexOf(lastTx.location) + 1;
    }
}

module.exports = Blockchain;
