"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBalancesAtDate = getAllBalancesAtDate;
const ethers_1 = require("ethers");
const ethConfig_1 = require("../config/ethConfig");
const balanceRepository_1 = require("../repositories/balanceRepository");
const consts_1 = require("../utils/consts");
// Binary search for block number closest to targetTimestamp
async function getBlockByTimestamp(targetTimestamp, startBlock, endBlock) {
    let low = startBlock;
    let high = endBlock;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const block = await ethConfig_1.provider.getBlock(mid);
        if (!block)
            throw new Error(`Block ${mid} not found`);
        if (block.timestamp === targetTimestamp)
            return mid;
        if (block.timestamp < targetTimestamp)
            low = mid + 1;
        else
            high = mid - 1;
    }
    return high;
}
// Fetch logs in chunks to avoid rate limit and performance issues
async function discoverTokens(wallet, fromBlock, toBlock, chunkSize = 10000) {
    const tokenAddresses = new Set();
    const normalizedAddress = ethers_1.ethers.getAddress(wallet).toLowerCase();
    const walletPadded = ethers_1.ethers.zeroPadValue(normalizedAddress, 32);
    for (let start = fromBlock; start <= toBlock; start += chunkSize + 1) {
        const end = Math.min(start + chunkSize, toBlock);
        try {
            const logs = await ethConfig_1.provider.getLogs({
                fromBlock: start,
                toBlock: end,
                topics: [consts_1.TRANSFER_TOPIC, [walletPadded], [walletPadded]],
            });
            for (const log of logs) {
                tokenAddresses.add(log.address);
            }
        }
        catch (e) {
            console.warn(`Failed to fetch logs from ${start} to ${end}:`, e);
        }
    }
    return tokenAddresses;
}
function extractAddressFromTopic(topic) {
    if (!topic.startsWith('0x') || topic.length !== 66) {
        throw new Error('Invalid padded address/topic');
    }
    const raw = '0x' + topic.slice(-40);
    if (!ethers_1.ethers.isAddress(raw)) {
        throw new Error('Failed to extract valid Ethereum address');
    }
    return ethers_1.ethers.getAddress(raw);
}
async function getAllBalancesAtDate(wallet, dateStr) {
    const normalizedAddress = ethers_1.ethers.isAddress(wallet)
        ? ethers_1.ethers.getAddress(wallet)
        : extractAddressFromTopic(wallet);
    const cached = await balanceRepository_1.BalanceRepository.find(normalizedAddress, dateStr);
    if (cached) {
        console.log('Returning cached balance from DB');
        return cached;
    }
    const targetDate = new Date(`${dateStr}T00:00:00Z`);
    const targetTimestamp = Math.floor(targetDate.getTime() / 1000);
    const latestBlock = await ethConfig_1.provider.getBlockNumber();
    const blockNumber = await getBlockByTimestamp(targetTimestamp, 0, latestBlock);
    if (blockNumber < 0)
        throw new Error('No block found before the given date');
    const ethBalanceBN = await ethConfig_1.provider.getBalance(normalizedAddress, blockNumber);
    const ethBalance = ethers_1.ethers.formatEther(ethBalanceBN);
    const tokenContracts = await discoverTokens(normalizedAddress, 0, blockNumber);
    const tokens = (await Promise.all(Array.from(tokenContracts).map(async (address) => {
        try {
            const contract = new ethers_1.ethers.Contract(address, consts_1.ERC20_ABI, ethConfig_1.provider);
            const [raw, symbol, decimals] = await Promise.all([
                contract.balanceOf(normalizedAddress, { blockTag: blockNumber }),
                contract.symbol(),
                contract.decimals(),
            ]);
            return {
                address,
                symbol,
                decimals,
                rawBalance: raw.toString(),
                formattedBalance: ethers_1.ethers.formatUnits(raw, decimals),
            };
        }
        catch (e) {
            console.warn(`Failed to query token ${address}:`, e);
            return null;
        }
    }))).filter(Boolean);
    const balanceDoc = await balanceRepository_1.BalanceRepository.saveIfNotExists({
        wallet: normalizedAddress,
        date: dateStr,
        blockNumber,
        ethBalance,
        tokens,
    });
    return balanceDoc;
}
