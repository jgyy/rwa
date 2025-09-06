import axios from 'axios';
import { Asset, CreateAssetInput, UpdateAssetInput } from '@/types/asset';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AssetService {
  private api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  async getAssets(): Promise<Asset[]> {
    const { data } = await this.api.get('/assets');
    return data;
  }

  async getAsset(id: string): Promise<Asset> {
    const { data } = await this.api.get(`/assets/${id}`);
    return data;
  }

  async createAsset(input: CreateAssetInput & { owner: string }): Promise<Asset> {
    const { data } = await this.api.post('/assets', input);
    return data;
  }

  async updateAsset(id: string, input: UpdateAssetInput): Promise<Asset> {
    const { data } = await this.api.put(`/assets/${id}`, input);
    return data;
  }

  async deleteAsset(id: string): Promise<void> {
    await this.api.delete(`/assets/${id}`);
  }

  async getAssetsByOwner(owner: string): Promise<Asset[]> {
    const { data } = await this.api.get(`/assets/owner/${owner}`);
    return data;
  }

  async searchAssets(query: string): Promise<Asset[]> {
    const { data } = await this.api.get('/assets/search', {
      params: { q: query },
    });
    return data;
  }
}

export const assetService = new AssetService();