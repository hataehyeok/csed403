const express = require('express');
const Web3 = require('web3');
const app = express();
const web3 = new Web3('http://127.0.0.1:2210');

const port = 3000;
//const port = 2210;

let accounts = [];

web3.eth.getAccounts()
  .then((acc) => {
    accounts = acc;
  })
  .catch((err) => {
    console.error('Error retrieving accounts:', err);
  });

async function getBalances() {
  const balances = {};

  for (let i = 0; i < accounts.length; i++) {
    const balance = await web3.eth.getBalance(accounts[i]);
    balances[accounts[i]] = web3.utils.fromWei(balance, 'ether');
  }

  return balances;
}

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true })); // Enable body-parser middleware for parsing form data

app.get('/', async (req, res) => {
  const balances = await getBalances();
  res.render('index', { accounts, balances });
});

app.post('/sendETH', async (req, res) => {
  const { transmitter, recipientAddress, amount, password } = req.body;

  try {
    // Unlock the transmitter's account
    await web3.eth.personal.unlockAccount(transmitter, password, 600); // Unlock for 10 minutes (600 seconds)

    // Send the ETH transaction
    const tx = await web3.eth.sendTransaction({
      from: transmitter,
      to: recipientAddress,
      value: web3.utils.toWei(amount, 'ether')
    });

    console.log('Transaction hash:', tx.transactionHash);
    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to send ETH:', error);
    res.status(500).send('Failed to send ETH');
  }
});

app.listen(port, () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});






