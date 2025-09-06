'use client';

import { Header } from '@/components/Header';
import { Portfolio } from '@/components/Portfolio';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function PortfolioPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Portfolio
        </h1>
        
        {isConnected ? (
          <Portfolio />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your wallet to view your portfolio
            </p>
            <ConnectButton />
          </div>
        )}
      </main>
    </div>
  );
}