// Copyright (C) 2017 go-demeton authors
//
// This file is part of the go-demeton library.
//
// the go-demeton library is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// the go-demeton library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with the go-demeton library.  If not, see <http://www.gnu.org/licenses/>.
//

'use strict';

var Blockchain = function () {
    Object.defineProperty(this, "nativeBlockchain", {
        configurable: false,
        enumerable: false,
        get: function(){
            return _native_blockchain;
        }
    });
};

Blockchain.prototype = {
    AccountAddress: 0x57,
    ContractAddress: 0x58,

    blockParse: function (str) {
        var block = JSON.parse(str);
        if (block != null) {
            var fb = Object.freeze(block);
            Object.defineProperty(this, "block", {
                configurable: false,
                enumerable: false,
                get: function(){
                    return fb;
                }
            });
        }
    },
    transactionParse: function (str) {
        var tx = JSON.parse(str);
        if (tx != null) {
            var value = tx.value === undefined || tx.value.length === 0 ? "0" : tx.value;
            tx.value = new BigNumber(value);
            var gasPrice = tx.gasPrice === undefined || tx.gasPrice.length === 0 ? "0" : tx.gasPrice;
            tx.gasPrice = new BigNumber(gasPrice);
            var gasLimit = tx.gasLimit === undefined || tx.gasLimit.length === 0 ? "0" : tx.gasLimit;
            tx.gasLimit = new BigNumber(gasLimit);
            
            var ft = Object.freeze(tx);
            Object.defineProperty(this, "transaction", {
                configurable: false,
                enumerable: false,
                get: function(){
                    return ft;
                }
            });
        }
    },
    transfer: function (address, value) {
        if (!Uint.isUint(value)) {
            if (!(value instanceof BigNumber)) {
                value = new BigNumber(value);
            }
            if (value.isNaN() || value.isNegative() || !value.isFinite()) {
                throw new Error("invalid value");
            }
        }
       
        var ret = this.nativeBlockchain.transfer(address, value.toString(10));
        return ret == 0;
    },

    verifyAddress: function (address) {
        return this.nativeBlockchain.verifyAddress(address);
    },

    getAccountState: function(address) {
        if (address) {
            var result =  this.nativeBlockchain.getAccountState(address);
            if (result) {
                return JSON.parse(result);
            } else {
                throw "getAccountState: invalid address";
            }
        } else {
            throw "getAccountState:  inValid address";
        }
    },
    
    getPreBlockHash: function (offset) {
        offset = parseInt(offset);
        if (!offset) {
            throw "getPreBlockHash: invalid offset"
        }
        
        if (offset <= 0) {
            throw "getPreBlockHash: offset should large than 0"
        }

        if (offset >= this.block.height) {
            throw "getPreBlockHash: block not exist"
        }
        
        return this.nativeBlockchain.getPreBlockHash(offset);
    },

    getPreBlockSeed: function (offset) {
        offset = parseInt(offset);
        if (!offset) {
            throw "getPreBlockSeed: invalid offset"
        }
        
        if (offset <= 0) {
            throw "getPreBlockSeed: offset should large than 0"
        }
        
        if (offset >= this.block.height) {
            throw "getPreBlockSeed: block not exist"
        }

        return this.nativeBlockchain.getPreBlockSeed(offset);
    }
};
module.exports = new Blockchain();
