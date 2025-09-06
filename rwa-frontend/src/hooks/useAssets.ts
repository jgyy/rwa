import { useQuery } from '@tanstack/react-query';
import { assetService } from '@/services/assetService';

export function useAssets() {
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: assetService.getAssets,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    assets,
    isLoading,
    error,
  };
}