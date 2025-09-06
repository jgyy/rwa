'use client';

import { Asset } from '@/types/asset';
import Image from 'next/image';
import Link from 'next/link';

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <Link href={`/assets/${asset.id}`}>
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 relative">
          {asset.imageUrl && (
            <Image
              src={asset.imageUrl}
              alt={asset.name}
              fill
              className="object-cover"
            />
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
            {asset.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            {asset.description}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Price</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                ${asset.price.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-500">Type</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {asset.assetType}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}