import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, hardhat, localhost } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'RWA Tokenization Platform',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [mainnet, sepolia, hardhat, localhost],
  ssr: true,
});