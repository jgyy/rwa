import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';
import { CreateAssetInput } from '@/types/asset';
import { useAccount } from 'wagmi';
import { toast } from '@/lib/toast';

export function useCreateAsset() {
  const queryClient = useQueryClient();
  const { address } = useAccount();

  const mutation = useMutation({
    mutationFn: async (data: CreateAssetInput) => {
      if (!address) {
        throw new Error('Please connect your wallet');
      }
      return assetService.createAsset({ ...data, owner: address });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success('Asset created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create asset');
    },
  });

  return {
    createAsset: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}