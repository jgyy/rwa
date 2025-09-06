'use client';

import { Header } from '@/components/Header';
import { AssetList } from '@/components/AssetList';
import { AssetFilters } from '@/components/AssetFilters';

export default function AssetsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          All Assets
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AssetFilters />
          </aside>
          <div className="lg:col-span-3">
            <AssetList />
          </div>
        </div>
      </main>
    </div>
  );
}