'use client';

import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { AssetCard } from './AssetCard';

export function Portfolio() {
  const { address } = useAccount();

  const { data: assets, isLoading, error } = useQuery({
    queryKey: ['portfolio', address],
    queryFn: () => assetService.getAssetsByOwner(address!),
    enabled: !!address,
  });

  const totalValue = assets?.reduce((sum, asset) => sum + asset.price, 0) || 0;

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load portfolio</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8 text-white">
        <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100">Total Assets</p>
            <p className="text-3xl font-bold">{assets?.length || 0}</p>
          </div>
          <div>
            <p className="text-blue-100">Total Value</p>
            <p className="text-3xl font-bold">${totalValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-blue-100">Wallet Address</p>
            <p className="font-mono text-sm truncate">{address}</p>
          </div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Your Assets
      </h3>

      {!assets || assets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="text-gray-600 dark:text-gray-400">
            You don't own any assets yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}