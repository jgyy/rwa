import { useState, useCallback } from 'react';
import { create, KuboRPCClient } from 'kubo-rpc-client';

interface UseIPFSOptions {
  apiUrl?: string;
  gatewayUrl?: string;
}

interface IPFSUploadResult {
  cid: string;
  url: string;
}

export function useIPFS(options?: UseIPFSOptions) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = options?.apiUrl || process.env.NEXT_PUBLIC_IPFS_API_URL || 'http://localhost:5001';
  const gatewayUrl = options?.gatewayUrl || process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'http://localhost:8080';

  const client: KuboRPCClient = create({ url: apiUrl });

  /**
   * Upload a file to IPFS
   */
  const uploadFile = useCallback(async (
    file: File | Blob | Buffer | string
  ): Promise<IPFSUploadResult | null> => {
    setUploading(true);
    setError(null);

    try {
      let content: Buffer | Uint8Array;
      
      if (file instanceof File || file instanceof Blob) {
        const arrayBuffer = await file.arrayBuffer();
        content = new Uint8Array(arrayBuffer);
      } else if (typeof file === 'string') {
        content = Buffer.from(file);
      } else {
        content = file;
      }

      const result = await client.add({
        content,
        path: file instanceof File ? file.name : 'file',
      }, {
        pin: true,
        wrapWithDirectory: false,
      });

      const cid = result.cid.toString();
      const url = `${gatewayUrl}/ipfs/${cid}`;

      return { cid, url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload to IPFS';
      setError(errorMessage);
      console.error('IPFS upload error:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, [client, gatewayUrl]);

  /**
   * Upload JSON metadata to IPFS
   */
  const uploadJSON = useCallback(async (
    data: any
  ): Promise<IPFSUploadResult | null> => {
    const jsonString = JSON.stringify(data, null, 2);
    return uploadFile(jsonString);
  }, [uploadFile]);

  /**
   * Upload multiple files to IPFS
   */
  const uploadMultiple = useCallback(async (
    files: File[]
  ): Promise<IPFSUploadResult[]> => {
    setUploading(true);
    setError(null);

    try {
      const results: IPFSUploadResult[] = [];

      for (const file of files) {
        const result = await uploadFile(file);
        if (result) {
          results.push(result);
        }
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload files';
      setError(errorMessage);
      console.error('IPFS upload error:', err);
      return [];
    } finally {
      setUploading(false);
    }
  }, [uploadFile]);

  /**
   * Get file from IPFS
   */
  const getFile = useCallback(async (cid: string): Promise<Blob | null> => {
    try {
      const chunks: Uint8Array[] = [];
      
      for await (const chunk of client.cat(cid)) {
        chunks.push(chunk);
      }

      const blob = new Blob(chunks);
      return blob;
    } catch (err) {
      console.error('IPFS get error:', err);
      return null;
    }
  }, [client]);

  /**
   * Get JSON from IPFS
   */
  const getJSON = useCallback(async (cid: string): Promise<any | null> => {
    try {
      const blob = await getFile(cid);
      if (!blob) return null;

      const text = await blob.text();
      return JSON.parse(text);
    } catch (err) {
      console.error('IPFS get JSON error:', err);
      return null;
    }
  }, [getFile]);

  /**
   * Get gateway URL for a CID
   */
  const getGatewayUrl = useCallback((cid: string): string => {
    return `${gatewayUrl}/ipfs/${cid}`;
  }, [gatewayUrl]);

  /**
   * Pin a file on IPFS
   */
  const pinFile = useCallback(async (cid: string): Promise<boolean> => {
    try {
      await client.pin.add(cid);
      return true;
    } catch (err) {
      console.error('IPFS pin error:', err);
      return false;
    }
  }, [client]);

  /**
   * Unpin a file from IPFS
   */
  const unpinFile = useCallback(async (cid: string): Promise<boolean> => {
    try {
      await client.pin.rm(cid);
      return true;
    } catch (err) {
      console.error('IPFS unpin error:', err);
      return false;
    }
  }, [client]);

  return {
    uploadFile,
    uploadJSON,
    uploadMultiple,
    getFile,
    getJSON,
    getGatewayUrl,
    pinFile,
    unpinFile,
    uploading,
    error,
  };
}