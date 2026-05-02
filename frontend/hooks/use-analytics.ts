'use client';

import useSWR from 'swr';
import {
  getDashboardStats,
  getRiskDistribution,
  getFraudByHour,
  getTopFlaggedRules,
  getFraudTrend,
} from '@/services/api';

export function useDashboardStats(refreshInterval: number = 30000) {
  const { data, error, isLoading, mutate } = useSWR(
    'dashboard-stats',
    getDashboardStats,
    { refreshInterval, revalidateOnFocus: false }
  );

  return {
    stats: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useRiskDistribution(refreshInterval: number = 30000) {
  const { data, error, isLoading } = useSWR(
    'risk-distribution',
    getRiskDistribution,
    { refreshInterval, revalidateOnFocus: false }
  );

  return {
    distribution: data,
    isLoading,
    isError: !!error,
  };
}

export function useFraudByHour(refreshInterval: number = 60000) {
  const { data, error, isLoading } = useSWR(
    'fraud-by-hour',
    getFraudByHour,
    { refreshInterval, revalidateOnFocus: false }
  );

  return {
    hourlyData: data || [],
    isLoading,
    isError: !!error,
  };
}

export function useTopFlaggedRules(refreshInterval: number = 60000) {
  const { data, error, isLoading } = useSWR(
    'top-flagged-rules',
    getTopFlaggedRules,
    { refreshInterval, revalidateOnFocus: false }
  );

  return {
    rules: data || [],
    isLoading,
    isError: !!error,
  };
}

export function useFraudTrend(refreshInterval: number = 60000) {
  const { data, error, isLoading } = useSWR(
    'fraud-trend',
    getFraudTrend,
    { refreshInterval, revalidateOnFocus: false }
  );

  return {
    trends: data || [],
    isLoading,
    isError: !!error,
  };
}
