import { ethers } from 'ethers';

export const TRANSFER_TOPIC = ethers.id('Transfer(address,address,uint256)');
export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export const BATCH_SIZE = 10;
