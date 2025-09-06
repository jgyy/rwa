'use client';

interface HeroProps {
  onCreateAsset: () => void;
}

export function Hero({ onCreateAsset }: HeroProps) {
  return (
    <section className="py-20 text-center">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
        Tokenize Real World Assets
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        Transform physical assets into digital tokens on the blockchain. 
        Trade, manage, and invest in real world assets with unprecedented transparency and liquidity.
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={onCreateAsset}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Create Asset Token
        </button>
        <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
          Explore Assets
        </button>
      </div>
    </section>
  );
}