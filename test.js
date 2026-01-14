(async () => {
const Blockchain = require('./blockchain');

const supplyChain = new Blockchain();


//  CREATE KEY PAIRS

const factoryKeys = supplyChain.createKeyPair();
const driverKeys = supplyChain.createKeyPair();
const warehouseKeys = supplyChain.createKeyPair();

console.log('\n==============================');
console.log(' VALID SCANS');
console.log('==============================\n');

try {
    //1. Factory scan (VALID)
    supplyChain.createScanTransaction(
        'TV-SAMSUNG-001',
        'Factory',
        'Factory Manager',
        'OK',
        factoryKeys.privateKey,
        factoryKeys.publicKey
    );

    // Mine block
    await supplyChain.createNewBlock(supplyChain.getLastBlock().hash);

    // 2.Truck scan (VALID)
    supplyChain.createScanTransaction(
        'TV-SAMSUNG-001',
        'Truck',
        'Truck Driver',
        'OK',
        driverKeys.privateKey,
        driverKeys.publicKey
    );

    await supplyChain.createNewBlock(supplyChain.getLastBlock().hash);

    // 3. Warehouse scan (DAMAGED) (VALID)
    supplyChain.createScanTransaction(
        'TV-SAMSUNG-001',
        'Warehouse',
        'Warehouse Manager',
        'DAMAGED',
        warehouseKeys.privateKey,
        warehouseKeys.publicKey
    );

    await supplyChain.createNewBlock(supplyChain.getLastBlock().hash);

    console.log('All valid scans passed');

} catch (error) {
    console.error('Unexpected error:', error.message);
}

console.log('\n==============================');
console.log('INVALID SCANS (RULE TESTS)');
console.log('==============================\n');

// Try Rule 1: Skipping Factory
try {
    supplyChain.createScanTransaction(
        'TV-LG-002',
        'Truck',
        'Truck Driver',
        'OK',
        driverKeys.privateKey,
        driverKeys.publicKey
    );
} catch (error) {
    console.log('Rule 1 Violation caught ');
}

// Try Rule 2: Scan after DAMAGED
try {
    supplyChain.createScanTransaction(
        'TV-SAMSUNG-001',
        'Factory',
        'Factory Manager',
        'OK',
        factoryKeys.privateKey,
        factoryKeys.publicKey
    );
} catch (error) {
    console.log('Rule 2 Violation caught ');
}

// Test Rule 3: Same location twice
try {
    supplyChain.createScanTransaction(
        'TV-LG-003',
        'Factory',
        'Factory Manager',
        'OK',
        factoryKeys.privateKey,
        factoryKeys.publicKey
    );

    await supplyChain.createNewBlock(supplyChain.getLastBlock().hash);

    supplyChain.createScanTransaction(
        'TV-LG-003',
        'Factory',
        'Factory Manager',
        'OK',
        factoryKeys.privateKey,
        factoryKeys.publicKey
    );
} catch (error) {
    console.log('Rule 3 Violation caught ');
}

// Test Rule 4: Same handler twice
try {
    supplyChain.createScanTransaction(
        'TV-SONY-004',
        'Factory',
        'Factory Manager',
        'OK',
        factoryKeys.privateKey,
        factoryKeys.publicKey
    );

    await supplyChain.createNewBlock(supplyChain.getLastBlock().hash);

    supplyChain.createScanTransaction(
        'TV-SONY-004',
        'Truck',
        'Factory Manager', // same handler
        'OK',
        factoryKeys.privateKey,
        factoryKeys.publicKey
    );
} catch (error) {
    console.log('Rule 4 Violation caught ');
}

console.log('\n==============================');
console.log('BLOCKCHAIN STATE');
console.log('==============================\n');

console.log(JSON.stringify(supplyChain.chain, null, 2));

console.log('\n==============================');
console.log(' VERIFY DIGITAL SIGNATURES');
console.log('==============================\n');
//announcing blame detection
console.log('\n==============================');
console.log(' BLAME DETECTION');
console.log('==============================\n');

const blame = detectBlame(supplyChain.chain, 'TV-SAMSUNG-001');

if (typeof blame === 'string') {
    console.log(blame);
} else {
    console.log(
        `TV damaged after approval by ${blame.responsibleHandler} ` +
        `at ${blame.location}`
    );
}


// ===============================
// BLAME DETECTION HELPER
// ===============================
function detectBlame(chain, tvId) {
    const history = chain
        .flatMap(block => block.transactions)
        .filter(tx => tx.tvId === tvId);

    for (let i = 0; i < history.length; i++) {
        if (history[i].condition === 'DAMAGED') {
            if (i === 0) {
                return 'Damage detected at first scan (Factory)';
            }
            const responsibleTx = history[i - 1];
            return {
                responsibleHandler: responsibleTx.handler,
                location: responsibleTx.location,
                approvedCondition: responsibleTx.condition,
                timestamp: responsibleTx.timestamp
            };
        }
    }

    return 'No damage detected';
}

supplyChain.chain.forEach((block, blockIndex) => {
    block.transactions.forEach((tx, txIndex) => {
        const valid = supplyChain.verifyTransaction(tx);
        console.log(
            `Block ${blockIndex} | Transaction ${txIndex + 1} signature valid:`,
            valid
        );
    });
});
})();
