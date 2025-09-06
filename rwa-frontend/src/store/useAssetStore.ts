import { create } from 'zustand';
import { Asset } from '@/types/asset';

interface AssetStore {
  assets: Asset[];
  selectedAsset: Asset | null;
  filters: {
    assetType?: Asset['assetType'];
    minPrice?: number;
    maxPrice?: number;
    status?: Asset['status'];
  };
  setAssets: (assets: Asset[]) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  setFilters: (filters: AssetStore['filters']) => void;
  clearFilters: () => void;
  getFilteredAssets: () => Asset[];
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  selectedAsset: null,
  filters: {},

  setAssets: (assets) => set({ assets }),

  addAsset: (asset) => set((state) => ({ 
    assets: [...state.assets, asset] 
  })),

  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map((asset) =>
      asset.id === id ? { ...asset, ...updates } : asset
    ),
  })),

  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter((asset) => asset.id !== id),
  })),

  setSelectedAsset: (asset) => set({ selectedAsset: asset }),

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  getFilteredAssets: () => {
    const { assets, filters } = get();
    
    return assets.filter((asset) => {
      if (filters.assetType && asset.assetType !== filters.assetType) {
        return false;
      }
      if (filters.minPrice && asset.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && asset.price > filters.maxPrice) {
        return false;
      }
      if (filters.status && asset.status !== filters.status) {
        return false;
      }
      return true;
    });
  },
}))