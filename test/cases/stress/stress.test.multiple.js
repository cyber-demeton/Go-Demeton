'use strict';

var Wallet = require('../../../cmd/console/deb.js/lib/wallet.js');
var HttpRequest = require("../../node-request");
var sleep = require("system-sleep");

var env; // local testneb1 testneb2
var AddressNumber;
var SendTimes;

var args = process.argv.splice(2);

if (args.length != 3) {
    // give default config
    env = "local";
    AddressNumber = 4;
    SendTimes = 5000;
} else {
    env = args[0]; // local testneb1 testneb2

    AddressNumber = parseInt(args[1]);
    SendTimes = parseInt(args[2]);
}

if (AddressNumber <= 0 || SendTimes <= 0) {

    console.log("please input correct AddressNumber and SendTimes");
    return;
}

var Deb = Wallet.Deb;
var deb = new Deb();

var ChainID;
var from;
var accountArray;
var to = Wallet.Account.NewAccount();
var lastnonce = 0;

// statics for tps check start time.
var startTime;

var nodes = new Array();

//local
if (env == 'local') {
    deb.setRequest(new HttpRequest("http://127.0.0.1:8685")); //https://testnet.demeton.io
    ChainID = 100;
    from = new Wallet.Account("a6e5eb290e1438fce79f5cb8774a72621637c2c9654c8b2525ed1d7e4e73653f");
    nodes.push("http://127.0.0.1:8685");
} else if (env == 'testneb1') {
    deb.setRequest(new HttpRequest("http://35.182.48.19:8685"));
    ChainID = 1001;
    from = new Wallet.Account("43181d58178263837a9a6b08f06379a348a5b362bfab3631ac78d2ac771c5df3");
    nodes.push("http://35.182.48.19:8685");
    nodes.push("http://13.57.245.249:8685");
    nodes.push("http://54.219.151.126:8685");
    nodes.push("http://18.218.165.90:8685");
    nodes.push("http://18.219.28.97:8685");
    nodes.push("http://13.58.44.3:8685");
    nodes.push("http://35.177.214.138:8685");
    nodes.push("http://35.176.94.224:8685");
} else if (env == "testneb2") {
    deb.setRequest(new HttpRequest("http://34.205.26.12:8685"));
    ChainID = 1002;
    from = new Wallet.Account("43181d58178263837a9a6b08f06379a348a5b362bfab3631ac78d2ac771c5df3");
    nodes.push("http://34.205.26.12:8685");
} else {
    console.log("please input correct env local testneb1 testneb2")
    return;
}

deb.api.getAccountState(from.getAddressString()).then(function (resp) {
    console.log("master accountState resp:" + JSON.stringify(resp));
    lastnonce = parseInt(resp.nonce);
    console.log("lastnonce:", lastnonce);

    claimTokens(lastnonce);
});

function claimTokens(nonce) {
    accountArray = new Array();
    for (var i = 0; i < AddressNumber; i++) {
        var account = Wallet.Account.NewAccount();
        accountArray.push(account);
        sendTransaction(0, 1, from, account, "1000000000000000", ++nonce);
    }

    checkClaimTokens();
}

function sendTransaction(index, totalTimes, from, to, value, nonce) {
    if (index < totalTimes) {
        var transaction = new Wallet.Transaction(ChainID, from, to, value, nonce);
        transaction.signTransaction();
        var rawTx = transaction.toProtoString();
        deb.api.sendRawTransaction(rawTx).then(function (resp) {
            console.log("send raw transaction resp:" + JSON.stringify(resp));
            if (resp.txhash) {
                sendTransaction(++index, totalTimes, from, to, value, ++nonce);
            }
        });
    }
}

function checkClaimTokens() {
    var interval = setInterval(function () {
        deb.api.getAccountState(from.getAddressString()).then(function (resp) {
            console.log("master accountState resp:" + JSON.stringify(resp));
            if (resp.nonce >= lastnonce + AddressNumber) {
                clearInterval(interval);

                sendTransactionsForTps();
            }
        });

    }, 2000);
}

function sendTransactionsForTps() {

    console.log("start tps transaction sending...");

    startTime = new Date().getTime();

    for (var i = 0; i < AddressNumber; i++) {

        var node = nodes[i % nodes.length];
        deb.setRequest(new HttpRequest(node));

        sendTransaction(0, SendTimes, accountArray[i], accountArray[i], "1", 1);
        sleep(10);
    }

    checkTps();
}

function checkTps() {
    var finish = 0
    var interval = setInterval(function () {
        for (var i = 0; i < AddressNumber; i++) {
            deb.api.getAccountState(accountArray[i].getAddressString()).then(function (resp) {
                console.log("to address state:" + JSON.stringify(resp));
                if (resp.nonce >= SendTimes) {
                    finish++;
                    if (finish == AddressNumber) {
                        clearInterval(interval);

                        var endTime = new Date().getTime();
                        console.log("====================");
                        console.log("env is ", env);
                        console.log("concurrency number is ", AddressNumber);
                        console.log("total number is ", AddressNumber * SendTimes);
                        console.log("tps is: ", (AddressNumber * SendTimes) / ((endTime - startTime) / 1000));
                        console.log("====================")
                    }
                }
            });
        }

    }, 1000);
}