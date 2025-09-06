'use client';

import { Header } from '@/components/Header';
import { MarketplaceList } from '@/components/MarketplaceList';

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Marketplace
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Buy and sell tokenized real world assets
        </p>
        <MarketplaceList />
      </main>
    </div>
  );
}