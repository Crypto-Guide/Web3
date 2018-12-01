var express = require('express');
var Wallet = require('ethereumjs-wallet');
const ethTx = require('ethereumjs-tx');
const Web3 = require('web3');
const bodyParser = require('body-parser');
const web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('https://noisy-dolphin-30246.getho.io/jsonrpc'));

const contractAddress = "0x39740e655acf31b9ef1f12e9f661f8057dcac2a5";

const abi = [
	{
		"constant": true,
		"inputs": [],
		"name": "etherPool",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "breakPromise",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_blogUrl",
				"type": "string"
			},
			{
				"name": "_expiredAt",
				"type": "uint256"
			}
		],
		"name": "registerPromise",
		"outputs": [],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [],
		"name": "achievePromise",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "address"
			}
		],
		"name": "promiseList",
		"outputs": [
			{
				"name": "user",
				"type": "address"
			},
			{
				"name": "blogUrl",
				"type": "string"
			},
			{
				"name": "depositAmount",
				"type": "uint256"
			},
			{
				"name": "createdAt",
				"type": "uint256"
			},
			{
				"name": "expiredAt",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "blogUrl",
				"type": "string"
			},
			{
				"indexed": false,
				"name": "depositAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "expiredAt",
				"type": "uint256"
			}
		],
		"name": "RegisterPromise",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "toUser",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "sumAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "distributeAmount",
				"type": "uint256"
			}
		],
		"name": "DistributeEther",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "BreakPromise",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [],
		"name": "AchievePromise",
		"type": "event"
	}
]

const contract = new web3.eth.Contract(abi, contractAddress);

var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/wallet/create', function (req, res) {
  const wallet = Wallet.generate();
  const privateKey = wallet.getPrivateKeyString();
  const address = wallet.getChecksumAddressString();
  res.send({privateKey: privateKey, address: address});
});

app.post('/promise/register', function (req, res) {
  // contract.registerPromise.sendTransaction({from: req.params.fromAddress, gas:, req.params.privateKey, req.params.value})
  // transactionSend(req.params.fromAddress, toAddress, req.params.privateKey, req.params.value)
  const data = contract.methods.registerPromise(req.body.blogUrl, req.body.expiredAt)
  var rawTx = setTransaction(req.body.fromAddress, contractAddress, req.body.value, data);
  sendTransaction(rawTx, req.body.privateKey)
})

app.post('/promise/achieve', function (req, res) {

})

app.post('/promise/break', function (req, res) {

})

app.get('/getbalance', function (req, res) {
  var balance = web3.eth.getBalance(req.params.address)
  res.send({balance: balance})
})

app.listen(3000, function () {
  console.log('Web3 app listening on port 3000!');
});

async function setTransaction(fromAddress, toAddress, value, data) {
  const count = await web3.eth.getTransactionCount(fromAddress);
  nonce = count.toString(16);
  const countHex = `0x${nonce}`;
  console.log('YYYYYY', countHex)
  const gasPrice = 20000;
  // web3.eth.getGasPrice((error, result) => {
  //   if (error) {
  //     gasPrice = 0
  //   } else {
  //     gasPrice = result
  //   }
  // })

  const rawTx = {
    nonce: countHex,
    gasPrice: web3.utils.toHex(gasPrice),
    gasLimit: web3.utils.toHex(4700000),
    to: toAddress,
    value: web3.utils.toWei(value.toString(), "ether"),
    data: data
  };
  return rawTx;
}

async function sendTransaction(rawTx, privateKey) {
    var serializedTx = signTx(rawTx, privateKey);
    const Tx = '0x' + serializedTx.toString('hex');
    await web3.eth.sendSignedTransaction(Tx);
}

function signTx(rawTx, privateKey) {
    var priKey = Buffer.from(privateKey, 'hex');
    const tx = new ethTx(rawTx);
    console.log('TTTTTTTT', priKey)
    tx.sign(priKey);
    const serializedTx = tx.serialize();
    return serializedTx
}
