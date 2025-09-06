'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
              RWA Platform
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/assets" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Assets
              </Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Marketplace
              </Link>
              <Link href="/portfolio" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Portfolio
              </Link>
            </div>
          </div>
          <ConnectButton />
        </nav>
      </div>
    </header>
  );
}