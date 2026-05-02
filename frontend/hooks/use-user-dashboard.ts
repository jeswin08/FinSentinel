'use client';

import useSWR from 'swr';
import { getUserDashboardStats } from '@/services/api';
import type { UserDashboardStats } from '@/lib/types';

export function useUserDashboard(userId: string) {
  const { data, error, isLoading, mutate } = useSWR<UserDashboardStats>(
    userId ? `user-dashboard-${userId}` : null,
    () => getUserDashboardStats(userId),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
