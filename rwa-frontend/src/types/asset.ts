export interface Asset {
  id: string;
  tokenId?: string;
  name: string;
  description: string;
  assetType: 'REAL_ESTATE' | 'COMMODITY' | 'ART' | 'VEHICLE' | 'OTHER';
  price: number;
  owner: string;
  location?: string;
  imageUrl?: string;
  documents?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'INACTIVE';
}

export interface CreateAssetInput {
  name: string;
  description: string;
  assetType: Asset['assetType'];
  price: number;
  location?: string;
  documents?: string[];
  metadata?: Record<string, any>;
}

export interface UpdateAssetInput {
  name?: string;
  description?: string;
  price?: number;
  location?: string;
  status?: Asset['status'];
  metadata?: Record<string, any>;
}