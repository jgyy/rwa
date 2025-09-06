'use client';

import { useAssets } from '@/hooks/useAssets';
import { AssetCard } from './AssetCard';

export function MarketplaceList() {
  const { assets, isLoading, error } = useAssets();

  // Filter only active assets for marketplace
  const marketplaceAssets = assets?.filter(asset => asset.status === 'ACTIVE');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load marketplace</p>
      </div>
    );
  }

  if (!marketplaceAssets || marketplaceAssets.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">No assets available in the marketplace</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {marketplaceAssets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} />
      ))}
    </div>
  );
}