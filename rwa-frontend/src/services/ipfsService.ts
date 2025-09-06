import { create, IPFSHTTPClient } from 'kubo-rpc-client';

class IPFSService {
  private client: IPFSHTTPClient;

  constructor() {
    const ipfsUrl = process.env.NEXT_PUBLIC_IPFS_URL || 'http://localhost:5001';
    this.client = create({ url: ipfsUrl });
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const added = await this.client.add(file, {
        progress: (prog) => console.log(`Uploading: ${prog}`),
      });
      return added.cid.toString();
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  async uploadJSON(data: object): Promise<string> {
    try {
      const json = JSON.stringify(data);
      const added = await this.client.add(json);
      return added.cid.toString();
    } catch (error) {
      console.error('Error uploading JSON to IPFS:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  async getFile(cid: string): Promise<Uint8Array> {
    try {
      const chunks = [];
      for await (const chunk of this.client.cat(cid)) {
        chunks.push(chunk);
      }
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      return result;
    } catch (error) {
      console.error('Error fetching file from IPFS:', error);
      throw new Error('Failed to fetch file from IPFS');
    }
  }

  async getJSON<T = any>(cid: string): Promise<T> {
    try {
      const data = await this.getFile(cid);
      const text = new TextDecoder().decode(data);
      return JSON.parse(text);
    } catch (error) {
      console.error('Error fetching JSON from IPFS:', error);
      throw new Error('Failed to fetch JSON from IPFS');
    }
  }

  getGatewayUrl(cid: string): string {
    const gateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io';
    return `${gateway}/ipfs/${cid}`;
  }
}

export const ipfsService = new IPFSService();