const Blockchain = require('./blockchain');
const chain = new Blockchain();

const factoryKeys = chain.createKeyPair();
const driverKeys = chain.createKeyPair();
const warehouseKeys = chain.createKeyPair();

console.log(factoryKeys);
console.log(driverKeys);
console.log(warehouseKeys);