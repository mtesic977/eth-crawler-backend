"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BATCH_SIZE = exports.ERC20_ABI = exports.TRANSFER_TOPIC = void 0;
const ethers_1 = require("ethers");
exports.TRANSFER_TOPIC = ethers_1.ethers.id('Transfer(address,address,uint256)');
exports.ERC20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
];
exports.BATCH_SIZE = 10;
