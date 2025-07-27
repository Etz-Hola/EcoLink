import { ethers } from 'ethers';
import RecycleHubABI from './RecycleHubABI.json';

// Replace with your deployed contract address
export const RECYCLE_HUB_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';

export function getRecycleHubContract(signerOrProvider: ethers.Signer | ethers.providers.Provider) {
  return new ethers.Contract(
    RECYCLE_HUB_ADDRESS,
    RecycleHubABI.abi,
    signerOrProvider
  );
} 