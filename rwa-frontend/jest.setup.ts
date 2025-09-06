// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
process.env.NEXT_PUBLIC_CHAIN_ID = '31337'
process.env.NEXT_PUBLIC_RPC_URL = 'http://localhost:8545'

// Extend the global Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: jest.Mock
      on: jest.Mock
      removeListener: jest.Mock
      isMetaMask: boolean
    }
  }
}

// Mock window.ethereum for Web3 tests
global.window = global.window || ({} as Window & typeof globalThis)
global.window.ethereum = {
  request: jest.fn(),
  on: jest.fn(),
  removeListener: jest.fn(),
  isMetaMask: true,
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
} as any