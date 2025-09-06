'use client';

import { useAssetStore } from '@/store/useAssetStore';
import { Asset } from '@/types/asset';

export function AssetFilters() {
  const { filters, setFilters, clearFilters } = useAssetStore();

  const handleAssetTypeChange = (type: Asset['assetType'] | '') => {
    setFilters({
      ...filters,
      assetType: type === '' ? undefined : type,
    });
  };

  const handlePriceChange = (min: string, max: string) => {
    setFilters({
      ...filters,
      minPrice: min ? parseFloat(min) : undefined,
      maxPrice: max ? parseFloat(max) : undefined,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Asset Type
          </label>
          <select
            value={filters.assetType || ''}
            onChange={(e) => handleAssetTypeChange(e.target.value as Asset['assetType'] | '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          >
            <option value="">All Types</option>
            <option value="REAL_ESTATE">Real Estate</option>
            <option value="COMMODITY">Commodity</option>
            <option value="ART">Art</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Price Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min price"
              value={filters.minPrice || ''}
              onChange={(e) => handlePriceChange(e.target.value, String(filters.maxPrice || ''))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
            <input
              type="number"
              placeholder="Max price"
              value={filters.maxPrice || ''}
              onChange={(e) => handlePriceChange(String(filters.minPrice || ''), e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as Asset['status'] || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="SOLD">Sold</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}