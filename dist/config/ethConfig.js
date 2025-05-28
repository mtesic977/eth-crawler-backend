"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.provider = void 0;
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.provider = new ethers_1.ethers.JsonRpcProvider(process.env.INFURA_URL);
