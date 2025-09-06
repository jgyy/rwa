'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { AssetDetail } from '@/components/AssetDetail';

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AssetDetail assetId={assetId} />
      </main>
    </div>
  );
}