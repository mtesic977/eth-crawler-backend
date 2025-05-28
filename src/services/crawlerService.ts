import { ethers } from 'ethers';
import { provider } from '../config/ethConfig';
import { TransactionRepository } from '../repositories/transactionRepository';

const BATCH_SIZE = 10;
const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');

interface ParsedTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  timestamp: number;
  tokenAddress?: string;
  isTokenTransfer?: boolean;
}

async function fetchBlocksBatch(
  start: number,
  end: number
): Promise<
  Array<ethers.Block & { transactions: ethers.TransactionResponse[] }>
> {
  const promises = [];
  for (let i = start; i <= end; i++) {
    promises.push(provider.getBlock(i, true));
  }

  const results = await Promise.allSettled(promises);
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map((r) => r.value);
}

async function processBlockTransactions(
  blocks: Array<ethers.Block & { transactions: ethers.TransactionResponse[] }>,
  lowercaseWallet: string,
  newTransactions: ParsedTx[]
) {
  for (const block of blocks) {
    if (!block?.transactions) continue;

    for (const tx of block.transactions) {
      const txFrom = tx.from?.toLowerCase() ?? '';
      const txTo = (tx.to ?? '').toLowerCase();

      if (txFrom === lowercaseWallet || txTo === lowercaseWallet) {
        const exists = await TransactionRepository.findByHash(tx.hash);
        if (exists) continue;

        newTransactions.push({
          hash: tx.hash,
          from: tx.from ?? '',
          to: tx.to ?? '',
          value: ethers.formatEther(tx.value),
          blockNumber: tx.blockNumber ?? block.number,
          timestamp: block.timestamp,
          isTokenTransfer: false,
        });
        console.log(`Found ETH tx ${tx.hash} in block ${block.number}`);
      }
    }
  }
}

async function getLogsWithRetry(
  params: ethers.Filter,
  retries = 5,
  delayMs = 1000
) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await provider.getLogs(params);
    } catch (error: any) {
      if (
        error.message?.includes('Too Many Requests') ||
        error.code === -32005
      ) {
        console.warn(
          `Rate limited by RPC provider. Retry attempt ${
            attempt + 1
          } after ${delayMs}ms...`
        );
        await new Promise((res) => setTimeout(res, delayMs));
        delayMs *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error('Exceeded retries due to rate limits.');
}

async function fetchAndProcessLogs(
  fromBlock: number,
  toBlock: number,
  lowercaseWallet: string,
  newTransactions: ParsedTx[]
) {
  try {
    const fromTopic = ethers.zeroPadBytes(ethers.getBytes(lowercaseWallet), 32);
    const toTopic = ethers.zeroPadBytes(ethers.getBytes(lowercaseWallet), 32);

    const logs = await getLogsWithRetry({
      fromBlock,
      toBlock,
      topics: [TRANSFER_TOPIC, [fromTopic, toTopic]],
    });

    for (const log of logs) {
      try {
        const from = ethers.getAddress(
          ethers.hexlify(ethers.stripZerosLeft(log.topics[1]))
        );
        const to = ethers.getAddress(
          ethers.hexlify(ethers.stripZerosLeft(log.topics[2]))
        );

        if (
          from.toLowerCase() !== lowercaseWallet &&
          to.toLowerCase() !== lowercaseWallet
        )
          continue;

        const exists = await TransactionRepository.findByHash(
          log.transactionHash
        );
        if (exists) continue;

        const amountBN = ethers.toBigInt(log.data);
        const block = await provider.getBlock(log.blockNumber);
        if (!block) continue;

        newTransactions.push({
          hash: log.transactionHash,
          from,
          to,
          value: amountBN.toString(),
          blockNumber: log.blockNumber,
          timestamp: block.timestamp,
          tokenAddress: log.address,
          isTokenTransfer: true,
        });
        console.log(
          `Found Token Transfer tx ${log.transactionHash} in block ${log.blockNumber}`
        );
      } catch (e) {
        console.warn('Error parsing log:', e);
      }
    }
  } catch (e) {
    console.error('Error fetching logs:', e);
  }
}

async function saveTransactions(newTransactions: ParsedTx[]) {
  if (newTransactions.length === 0) return;
  try {
    await TransactionRepository.saveManyIfNotExists(newTransactions);
    newTransactions.length = 0;
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

export const crawlTransactions = async (wallet: string, startBlock: number) => {
  const latestBlock = await provider.getBlockNumber();
  const lowercaseWallet = wallet.toLowerCase();
  const newTransactions: ParsedTx[] = [];

  console.log(
    `Crawling blocks ${startBlock} to ${latestBlock} for wallet ${wallet}`
  );

  for (let i = startBlock; i <= latestBlock; i += BATCH_SIZE) {
    const batchStart = i;
    const batchEnd = Math.min(i + BATCH_SIZE - 1, latestBlock);

    console.log(`Processing batch: blocks ${batchStart} to ${batchEnd}`);

    try {
      const blocks = await fetchBlocksBatch(batchStart, batchEnd);
      await processBlockTransactions(blocks, lowercaseWallet, newTransactions);
      await fetchAndProcessLogs(
        batchStart,
        batchEnd,
        lowercaseWallet,
        newTransactions
      );

      if (newTransactions.length >= 20) {
        await saveTransactions(newTransactions);
      }
    } catch (e) {
      console.error(`Error processing batch ${batchStart} to ${batchEnd}:`, e);
    }
  }

  await saveTransactions(newTransactions);

  console.log(`Crawling completed.`);

  const txs = await TransactionRepository.findByWallet(wallet, {
    sort: { blockNumber: 1 },
  });

  return {
    startBlock,
    latestBlock,
    transactions: txs,
  };
};
