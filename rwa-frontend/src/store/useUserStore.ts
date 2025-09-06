import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  address: string;
  ens?: string;
  avatar?: string;
}

interface UserStore {
  user: User | null;
  favorites: string[]; // Asset IDs
  recentlyViewed: string[]; // Asset IDs
  setUser: (user: User | null) => void;
  addFavorite: (assetId: string) => void;
  removeFavorite: (assetId: string) => void;
  isFavorite: (assetId: string) => boolean;
  addRecentlyViewed: (assetId: string) => void;
  clearRecentlyViewed: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      favorites: [],
      recentlyViewed: [],

      setUser: (user) => set({ user }),

      addFavorite: (assetId) => set((state) => ({
        favorites: state.favorites.includes(assetId) 
          ? state.favorites 
          : [...state.favorites, assetId],
      })),

      removeFavorite: (assetId) => set((state) => ({
        favorites: state.favorites.filter((id) => id !== assetId),
      })),

      isFavorite: (assetId) => {
        return get().favorites.includes(assetId);
      },

      addRecentlyViewed: (assetId) => set((state) => {
        const filtered = state.recentlyViewed.filter((id) => id !== assetId);
        return {
          recentlyViewed: [assetId, ...filtered].slice(0, 10), // Keep only last 10
        };
      }),

      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);