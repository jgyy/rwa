'use client';

import React, { useState } from 'react';
import { useIPFS } from '@/hooks/useIPFS';

interface IPFSUploaderProps {
  onUpload?: (cid: string) => void;
}

export function IPFSUploader({ onUpload }: IPFSUploaderProps) {
  const { uploadFile, uploadJSON, uploading, error } = useIPFS();
  const [uploadResult, setUploadResult] = useState<{ cid: string; url: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadFile(file);
    if (result) {
      setUploadResult(result);
      onUpload?.(result.cid);
    }
  };

  const handleJSONUpload = async () => {
    const metadata = {
      name: 'RWA Token #1',
      description: 'Real World Asset Token',
      image: uploadResult?.url || '',
      attributes: [
        { trait_type: 'Asset Type', value: 'Real Estate' },
        { trait_type: 'Location', value: 'New York' },
        { trait_type: 'Value', value: '$1,000,000' },
      ],
    };

    const result = await uploadJSON(metadata);
    if (result) {
      setUploadResult(result);
      onUpload?.(result.cid);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">IPFS Upload</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Upload File to IPFS
          </label>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
              disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleJSONUpload}
          disabled={uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Upload Sample Metadata
        </button>

        {uploading && (
          <div className="text-blue-500">Uploading to IPFS...</div>
        )}

        {error && (
          <div className="text-red-500">Error: {error}</div>
        )}

        {uploadResult && (
          <div className="p-4 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>CID:</strong> {uploadResult.cid}
            </p>
            <p className="text-sm mt-2">
              <strong>Gateway URL:</strong>{' '}
              <a
                href={uploadResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {uploadResult.url}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}