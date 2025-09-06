import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { rwaTokenABI } from '@/contracts/abis/RWAToken';
import { marketplaceABI } from '@/contracts/abis/Marketplace';

const RWA_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_RWA_TOKEN_ADDRESS as `0x${string}`;
const MARKETPLACE_ADDRESS = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`;

export function useRWAToken() {
  const { data: totalSupply } = useReadContract({
    address: RWA_TOKEN_ADDRESS,
    abi: rwaTokenABI,
    functionName: 'totalSupply',
  });

  const { writeContract, data: hash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintToken = async (to: string, tokenId: bigint, uri: string) => {
    writeContract({
      address: RWA_TOKEN_ADDRESS,
      abi: rwaTokenABI,
      functionName: 'safeMint',
      args: [to as `0x${string}`, tokenId, uri],
    });
  };

  return {
    totalSupply,
    mintToken,
    isConfirming,
    isSuccess,
  };
}

export function useMarketplace() {
  const { writeContract, data: hash } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const listAsset = async (tokenId: bigint, price: string) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: marketplaceABI,
      functionName: 'listItem',
      args: [RWA_TOKEN_ADDRESS, tokenId, parseEther(price)],
    });
  };

  const buyAsset = async (tokenId: bigint, price: string) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: marketplaceABI,
      functionName: 'buyItem',
      args: [RWA_TOKEN_ADDRESS, tokenId],
      value: parseEther(price),
    });
  };

  return {
    listAsset,
    buyAsset,
    isConfirming,
    isSuccess,
  };
}