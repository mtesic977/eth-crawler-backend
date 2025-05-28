import { ethers, Log } from 'ethers';
import { provider } from '../config/ethConfig';
import { BalanceRepository } from '../repositories/balanceRepository';
import { ERC20_ABI, TRANSFER_TOPIC } from '../utils/consts';

// Binary search for block number closest to targetTimestamp
async function getBlockByTimestamp(
  targetTimestamp: number,
  startBlock: number,
  endBlock: number
): Promise<number> {
  let low = startBlock;
  let high = endBlock;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);
    if (!block) throw new Error(`Block ${mid} not found`);
    if (block.timestamp === targetTimestamp) return mid;
    if (block.timestamp < targetTimestamp) low = mid + 1;
    else high = mid - 1;
  }
  return high;
}

// Fetch logs in chunks to avoid rate limit and performance issues
async function discoverTokens(
  wallet: string,
  fromBlock: number,
  toBlock: number,
  chunkSize = 10000
): Promise<Set<string>> {
  const tokenAddresses = new Set<string>();
  const normalizedAddress = ethers.getAddress(wallet).toLowerCase();

  const walletPadded = ethers.zeroPadValue(normalizedAddress, 32);

  for (let start = fromBlock; start <= toBlock; start += chunkSize + 1) {
    const end = Math.min(start + chunkSize, toBlock);

    try {
      const logs: Log[] = await provider.getLogs({
        fromBlock: start,
        toBlock: end,
        topics: [TRANSFER_TOPIC, [walletPadded], [walletPadded]],
      });

      for (const log of logs) {
        tokenAddresses.add(log.address);
      }
    } catch (e) {
      console.warn(`Failed to fetch logs from ${start} to ${end}:`, e);
    }
  }

  return tokenAddresses;
}

function extractAddressFromTopic(topic: string): string {
  if (!topic.startsWith('0x') || topic.length !== 66) {
    throw new Error('Invalid padded address/topic');
  }
  const raw = '0x' + topic.slice(-40);
  if (!ethers.isAddress(raw)) {
    throw new Error('Failed to extract valid Ethereum address');
  }
  return ethers.getAddress(raw);
}

export async function getAllBalancesAtDate(wallet: string, dateStr: string) {
  const normalizedAddress = ethers.isAddress(wallet)
    ? ethers.getAddress(wallet)
    : extractAddressFromTopic(wallet);

  const cached = await BalanceRepository.find(normalizedAddress, dateStr);
  if (cached) {
    console.log('Returning cached balance from DB');
    return cached;
  }

  const targetDate = new Date(`${dateStr}T00:00:00Z`);
  const targetTimestamp = Math.floor(targetDate.getTime() / 1000);

  const latestBlock = await provider.getBlockNumber();
  const blockNumber = await getBlockByTimestamp(targetTimestamp, 0, latestBlock);
  if (blockNumber < 0) throw new Error('No block found before the given date');

  const ethBalanceBN = await provider.getBalance(normalizedAddress, blockNumber);
  const ethBalance = ethers.formatEther(ethBalanceBN);

  const tokenContracts = await discoverTokens(normalizedAddress, 0, blockNumber);

  const tokens = (
    await Promise.all(
      Array.from(tokenContracts).map(async (address) => {
        try {
          const contract = new ethers.Contract(address, ERC20_ABI, provider);
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
            formattedBalance: ethers.formatUnits(raw, decimals),
          };
        } catch (e) {
          console.warn(`Failed to query token ${address}:`, e);
          return null;
        }
      })
    )
  ).filter(Boolean);

  const balanceDoc = await BalanceRepository.saveIfNotExists({
    wallet: normalizedAddress,
    date: dateStr,
    blockNumber,
    ethBalance,
    tokens,
  });

  return balanceDoc;
}