// ============================
// SCAN TV TRANSACTION
// ============================

document.getElementById('scanBtn').addEventListener('click', async () => {
    const tvId = document.getElementById('tvId').value;
    const location = document.getElementById('location').value;
    const handler = document.getElementById('handler').value;
    const condition = document.getElementById('condition').value;
    const privateKey = document.getElementById('privateKey').value;
    const publicKey = document.getElementById('publicKey').value;

    const messageEl = document.getElementById('scanMessage');
    messageEl.textContent = '';

    try {
        const response = await fetch('/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tvId,
                location,
                handler,
                condition,
                privateKey,
                publicKey
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        messageEl.style.color = 'green';
        messageEl.textContent = result.message;

    } catch (error) {
        messageEl.style.color = 'red';
        messageEl.textContent = error.message;
    }
});


// ============================
// LOAD BLOCKCHAIN
// ============================

document.getElementById('loadChainBtn').addEventListener('click', async () => {
    const container = document.getElementById('blockchain');
    container.innerHTML = '';

    const response = await fetch('/blocks');
    const chain = await response.json();

    chain.forEach(block => {
        const blockDiv = document.createElement('div');
        blockDiv.className = 'block';

        blockDiv.innerHTML = `
            <strong>Block #${block.index}</strong><br>
            Timestamp: ${new Date(block.timestamp).toLocaleString()}<br>
            Previous Hash: ${block.previousBlockHash?.slice(0, 20) || 'N/A'}...<br>
            Hash: ${block.hash.slice(0, 20)}...<br>
            Transactions: ${block.transactions.length}
        `;

        container.appendChild(blockDiv);
    });
});


// ============================
// BLAME DETECTION
// ============================

document.getElementById('detectBlameBtn').addEventListener('click', async () => {
    const tvId = document.getElementById('blameTvId').value;
    const resultEl = document.getElementById('blameResult');

    resultEl.textContent = '';

    try {
        const response = await fetch(`/blame/${tvId}`);
        const data = await response.json();

        resultEl.style.color = '#22a397';
        resultEl.textContent = data.result;

    } catch (error) {
        resultEl.style.color = 'red';
        resultEl.textContent = 'Error detecting blame';
    }
});

