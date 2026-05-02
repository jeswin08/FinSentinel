'use client';

import useSWR from 'swr';
import { getSystemMetrics } from '@/services/api';

export function useSystemMetrics(refreshInterval: number = 30000) {
  const { data, error, isLoading, mutate } = useSWR(
    'system-metrics',
    getSystemMetrics,
    { refreshInterval, revalidateOnFocus: false }
  );

  return {
    metrics: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
