'use client';

import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { AssetList } from '@/components/AssetList';
import { CreateAssetModal } from '@/components/CreateAssetModal';
import { useState } from 'react';

export default function Home() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Hero onCreateAsset={() => setIsCreateModalOpen(true)} />
        <AssetList />
      </main>
      <CreateAssetModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}