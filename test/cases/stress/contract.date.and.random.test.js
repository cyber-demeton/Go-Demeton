'use strict';

var Wallet = require('demeton');
var sleep = require("system-sleep");
var HttpRequest = require("../../node-request");

var args = process.argv.splice(2);

if (args.length != 3) {
	console.log("please input args 0:env(local,testneb1,testneb2,testneb3) 1:address number(concurrency) 2:sendtimes");
	return;
}

var env = args[0]; // local testneb1 testneb2

const AddressNumber = parseInt(args[1]);
const SendTimes = parseInt(args[2]);

if (AddressNumber <= 0 || SendTimes <= 0) {

	console.log("please input correct AddressNumber and SendTimes");
	return;
}

var Deb = Wallet.Deb;
var deb = new Deb();

var ChainID;
var from;

//local
if (env == 'local') {
	deb.setRequest(new HttpRequest("http://127.0.0.1:8685")); //https://testnet.demeton.io
	ChainID = 100;
	from = new Wallet.Account("a6e5eb290e1438fce79f5cb8774a72621637c2c9654c8b2525ed1d7e4e73653f");
} else if (env == 'testneb1') {
	deb.setRequest(new HttpRequest("http://35.182.48.19:8685"));
	ChainID = 1001;
	from = new Wallet.Account("43181d58178263837a9a6b08f06379a348a5b362bfab3631ac78d2ac771c5df3");
} else if (env == "testneb2") {
	deb.setRequest(new HttpRequest("http://34.205.26.12:8685"));
	ChainID = 1002;
	from = new Wallet.Account("25a3a441a34658e7a595a0eda222fa43ac51bd223017d17b420674fb6d0a4d52");
} else if (env == "testneb3") {
	deb.setRequest(new HttpRequest("http://35.177.214.138:8685"));
	ChainID = 1003;
	from = new Wallet.Account("43181d58178263837a9a6b08f06379a348a5b362bfab3631ac78d2ac771c5df3");
} else {
	console.log("please input correct env local testneb1 testneb2 testneb3");
	return;
}

var FS = require("fs");

var lastnonce = 0;

// new account  to get address
var accountArray = new Array();
for (var i = 0; i < AddressNumber; i++) {
	var account = Wallet.Account.NewAccount();
	//var hash = account.getAddressString();
	accountArray.push(account);
}

deb.api.getAccountState(from.getAddressString()).then(function (resp) {
	console.log("master accountState resp:", JSON.stringify(resp), ", env: ", env);
	lastnonce = parseInt(resp.nonce);
	console.log("lastnonce:", lastnonce);
});

sleep(2000);

cliamTokens();

var ContractHash;
var ContractAddress;

var intervalAccount = setInterval(function () {
	deb.api.getAccountState(from.getAddressString()).then(function (resp) {
		console.log("master accountState resp:" + JSON.stringify(resp));
		var nonce = parseInt(resp.nonce);
		console.log("lastnonce:", lastnonce, "resp_nonce:", nonce);

		if (lastnonce <= nonce) {
			clearInterval(intervalAccount);
			deployContract();
		}
	});
}, 2000);

function cliamTokens() {
	var nonce = lastnonce + 1;
	for (var j = 0; j < AddressNumber; j++) {
		sendTransaction(nonce, accountArray[j]);
		++nonce;
		sleep(30);
	}

	lastnonce = nonce - 1;
}

function deployContract() {

	var nonce = lastnonce;
	console.log("nonce:" + nonce);
	// create contract
	var dateAndRand = FS.readFileSync("../../../nf/nvm/test/contract_date_and_random.js", "utf-8");
	var contract = {
		"source": dateAndRand,
		"sourceType": "js",
		"args": ""
	};

	var transaction = new Wallet.Transaction(ChainID, from, from, "0", ++nonce, "1000000", "20000000000", contract);
	transaction.signTransaction();
	var rawTx = transaction.toProtoString();

	// console.log("contract:" + rawTx);

	deb.api.sendRawTransaction(rawTx).then(function (resp) {
		console.log("send raw contract transaction resp:" + JSON.stringify(resp));
		if (resp.balance === "0") {
			throw new Error("balance is 0");
		}
		ContractHash = resp.txhash;
		ContractAddress = resp.contract_address;

		checkContractDeployed();
	});

	++lastnonce;
}

function checkContractDeployed() {

	var retry = 0;

	// contract status and get contract_address 
	var interval = setInterval(function () {
		console.log("getTransactionReceipt hash:" + ContractHash);
		deb.api.getTransactionReceipt(ContractHash).then(function (resp) {

			console.log("tx receipt:" + resp.status);

			if (resp.status && resp.status === 1) {
				clearInterval(interval);
				sendMutilContractTransaction(ContractAddress)
			}
		}).catch(function (err) {
			retry++;
			console.log("error!", JSON.stringify(err.error));
			if (retry > 10) {
				console.log(JSON.stringify(err.error));
				clearInterval(interval);
			}
		});

	}, 2000);
}


function sendTransaction(nonce, address) {
	var transaction = new Wallet.Transaction(ChainID, from, address, deb.debToBasic(1), nonce);
	transaction.signTransaction();
	var rawTx = transaction.toProtoString();
	deb.api.sendRawTransaction(rawTx).then(function (resp) {
		console.log("send raw transaction resp:" + JSON.stringify(resp));
	});
}



// get current height
var BeginHeight;
//
function sendMutilContractTransaction(address) {

	deb.api.getNebState().then(function (resp) {
		BeginHeight = resp.height;
		console.log("get NebState resp:" + JSON.stringify(resp));
	});

	sleep(1000);
	var nonce = lastnonce;
	var t1 = new Date().getTime();
	for (var j = 0; j < AddressNumber; j++) {
		nonce = 0;
		sendContractTransaction(0, nonce, accountArray[j], address);
		//nonce = nonce + SendTimes;
	}

	lastnonce = SendTimes;
	sleep(1000 * SendTimes)
	getTransactionNumberByHeight();
}



function sendContractTransaction(sendtimes, nonce, from_address, contract_address) {
	if (sendtimes < SendTimes) {

		var X = Math.floor(Math.random() * Math.floor(6));

		var call = {
			"function": X % 2 == 0 ? "testDate" : "testRandom",
			"args": ""
		}

		console.log("send contract nonce:", nonce, ", call:", JSON.stringify(call));
		var transaction = new Wallet.Transaction(ChainID, from_address, contract_address, "0", ++nonce, "1000000", "2000000000", call);
		transaction.signTransaction();
		var rawTx = transaction.toProtoString();
		deb.api.sendRawTransaction(rawTx).then(function (resp) {
			console.log("send raw contract transaction resp:" + JSON.stringify(resp));
			sendtimes++;
			if (resp.txhash) {
				sendContractTransaction(sendtimes, nonce, from_address, contract_address);
			}
		});
	}
}

function getTransactionNumberByHeight() {

	var intervalHeight = setInterval(function () {
		deb.api.getAccountState(accountArray[0].getAddressString()).then(function (resp) {
			console.log("master accountState resp:" + JSON.stringify(resp));
			var nonce = parseInt(resp.nonce);
			console.log("lastnonce:", lastnonce, "resp_nonce:", nonce);

			if (lastnonce <= nonce) {
				clearInterval(intervalHeight)
				sleep(2000)
				deb.api.getNebState().then(function (resp) {
					var EndHeight = resp.height
					console.log("BeginHeight:" + BeginHeight + " EndHeight:" + EndHeight);
					var sum = 0;
					var max = 0;
					var height = BeginHeight
					var h = EndHeight - BeginHeight
					for (; height <= EndHeight; height++) {
						deb.api.getBlockByHeight(height, false).then(function (resp) {
							if (resp.transactions) {
								//console.log("master accountState resp:" + JSON.stringify(resp));
								console.log(resp.height, resp.transactions.length)
								sum += resp.transactions.length
								max = resp.transactions.length > max ? resp.transactions.length : max
							} else {
								console.log(resp.height, 0)
							}
							--h;
						});
						sleep(10)
					}

					sleep(1000)
					var intervalH = setInterval(function () {
						if (h < 0) {
							clearInterval(intervalH);
							console.log("====================")
							console.log("env is ", env)
							console.log("concurrency number is ", AddressNumber)
							console.log("total number is ", AddressNumber * SendTimes)
							console.log("height from ", BeginHeight, " to ", EndHeight)
							console.log("max of block is ", max)
							console.log("avg of block is ", sum / (EndHeight - BeginHeight))
							console.log("max of tps is ", max / 5)
							console.log("avg of tps is ", sum / (5 * (EndHeight - BeginHeight)))
							console.log("====================")
						}
					}, 2000);

				});
			}
		})
	}, 1000);
}