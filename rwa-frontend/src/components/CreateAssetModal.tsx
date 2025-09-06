'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateAsset } from '@/hooks/useCreateAsset';
import { IPFSUploader } from './IPFSUploader';

const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  assetType: z.enum(['REAL_ESTATE', 'COMMODITY', 'ART', 'VEHICLE', 'OTHER']),
  price: z.number().positive('Price must be positive'),
  location: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

type AssetFormData = z.infer<typeof assetSchema>;

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateAssetModal({ isOpen, onClose }: CreateAssetModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { createAsset, isLoading } = useCreateAsset();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
  });

  const onSubmit = async (data: AssetFormData) => {
    try {
      await createAsset({ ...data, documents: uploadedFiles });
      reset();
      setUploadedFiles([]);
      onClose();
    } catch (error) {
      console.error('Failed to create asset:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create New Asset Token
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Name
              </label>
              <input
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="e.g., Downtown Office Building"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                rows={4}
                placeholder="Describe the asset..."
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Asset Type
              </label>
              <select
                {...register('assetType')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              >
                <option value="REAL_ESTATE">Real Estate</option>
                <option value="COMMODITY">Commodity</option>
                <option value="ART">Art</option>
                <option value="VEHICLE">Vehicle</option>
                <option value="OTHER">Other</option>
              </select>
              {errors.assetType && (
                <p className="text-red-500 text-sm mt-1">{errors.assetType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (USD)
              </label>
              <input
                {...register('price', { valueAsNumber: true })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="1000000"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location (Optional)
              </label>
              <input
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Documents
              </label>
              <IPFSUploader onUpload={(cid) => setUploadedFiles([...uploadedFiles, cid])} />
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploaded files: {uploadedFiles.length}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}