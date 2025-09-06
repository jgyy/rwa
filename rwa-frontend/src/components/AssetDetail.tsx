'use client';

import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { useAccount } from 'wagmi';
import { useMarketplace } from '@/hooks/useContract';
import Image from 'next/image';
import { useState } from 'react';

interface AssetDetailProps {
  assetId: string;
}

export function AssetDetail({ assetId }: AssetDetailProps) {
  const { address } = useAccount();
  const { listAsset, buyAsset, isConfirming } = useMarketplace();
  const [listingPrice, setListingPrice] = useState('');
  const [showListModal, setShowListModal] = useState(false);

  const { data: asset, isLoading, error } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => assetService.getAsset(assetId),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">Failed to load asset details</p>
      </div>
    );
  }

  const isOwner = asset.owner.toLowerCase() === address?.toLowerCase();

  const handleList = async () => {
    if (!asset.tokenId) return;
    await listAsset(BigInt(asset.tokenId), listingPrice);
    setShowListModal(false);
  };

  const handleBuy = async () => {
    if (!asset.tokenId) return;
    await buyAsset(BigInt(asset.tokenId), String(asset.price));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg relative overflow-hidden">
            {asset.imageUrl && (
              <Image
                src={asset.imageUrl}
                alt={asset.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {asset.documents?.slice(0, 3).map((doc, index) => (
              <div key={index} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {asset.name}
          </h1>
          
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              {asset.assetType}
            </span>
            <span className="inline-block ml-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              {asset.status}
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {asset.description}
          </p>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${asset.price.toLocaleString()}
                </p>
              </div>
              {asset.location && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {asset.location}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {asset.owner}
              </p>
            </div>

            <div className="flex gap-4">
              {isOwner ? (
                <button
                  onClick={() => setShowListModal(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  List for Sale
                </button>
              ) : (
                <button
                  onClick={handleBuy}
                  disabled={isConfirming || asset.status !== 'ACTIVE'}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isConfirming ? 'Processing...' : 'Buy Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">List Asset for Sale</h3>
            <input
              type="number"
              placeholder="Enter price in ETH"
              value={listingPrice}
              onChange={(e) => setListingPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowListModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleList}
                disabled={isConfirming || !listingPrice}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isConfirming ? 'Listing...' : 'List Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}