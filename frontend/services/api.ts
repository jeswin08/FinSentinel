import type {
  Transaction,
  DashboardStats,
  RiskDistribution,
  HourlyFraud,
  FlaggedRule,
  SystemMetrics,
  TransactionAnalysis,
  TransactionFormData,
  Alert,
  AlertStats,
  FraudTrend,
  AuthResponse,
  User,
  RiskLevel,
  UserDashboardStats,
} from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Auth token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('finsentinel_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('finsentinel_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('finsentinel_token');
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('finsentinel_user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem('finsentinel_user', JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem('finsentinel_user');
};

// API request wrapper with auth and retry logic
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 2
): Promise<T> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        removeAuthToken();
        removeStoredUser();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.token);
    setStoredUser(response.user);
    return response;
  } catch {
    // Fallback to client-side demo auth if backend unreachable
    await new Promise(resolve => setTimeout(resolve, 500));

    if (email === 'demo@finsentinel.com' && password === 'demo123') {
      const response: AuthResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'USR-001',
          email: 'demo@finsentinel.com',
          name: 'Demo Analyst',
          role: 'analyst',
        },
      };
      setAuthToken(response.token);
      setStoredUser(response.user);
      return response;
    }

    if (email === 'user@finsentinel.com' && password === 'user123') {
      const response: AuthResponse = {
        token: 'mock-jwt-token-user-' + Date.now(),
        user: {
          id: 'USR-1001',
          email: 'user@finsentinel.com',
          name: 'Alex Johnson',
          role: 'user',
        },
      };
      setAuthToken(response.token);
      setStoredUser(response.user);
      return response;
    }

    throw new Error('Invalid credentials');
  }
}

export async function logout(): Promise<void> {
  removeAuthToken();
  removeStoredUser();
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;
  return getStoredUser();
}

// ---------------------------------------------------------------------------
// Dashboard endpoints
// ---------------------------------------------------------------------------

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiRequest<{ data: DashboardStats }>('/dashboard/stats');
  return response.data;
}

export async function getRiskDistribution(): Promise<RiskDistribution> {
  return await apiRequest<RiskDistribution>('/analytics/risk-distribution');
}

// ---------------------------------------------------------------------------
// Transactions endpoints
// ---------------------------------------------------------------------------

export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  return await apiRequest<Transaction[]>(`/transactions?limit=${limit}`);
}

export async function getAllTransactions(
  page: number = 1,
  pageSize: number = 20,
  riskFilter?: RiskLevel,
  search?: string
): Promise<{ transactions: Transaction[]; total: number }> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(riskFilter && { risk_level: riskFilter }),
    ...(search && { search }),
  });
  return await apiRequest<{ transactions: Transaction[]; total: number }>(`/transactions?${params}`);
}

export async function analyzeTransaction(data: TransactionFormData): Promise<TransactionAnalysis> {
  return await apiRequest<TransactionAnalysis>('/analyze', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Analytics endpoints
// ---------------------------------------------------------------------------

export async function getFraudByHour(): Promise<HourlyFraud[]> {
  return await apiRequest<HourlyFraud[]>('/analytics/fraud-by-hour');
}

export async function getTopFlaggedRules(): Promise<FlaggedRule[]> {
  return await apiRequest<FlaggedRule[]>('/analytics/top-rules');
}

export async function getFraudTrend(): Promise<FraudTrend[]> {
  return await apiRequest<FraudTrend[]>('/analytics/fraud-trend');
}

// ---------------------------------------------------------------------------
// Alerts endpoints
// ---------------------------------------------------------------------------

export async function getAlerts(): Promise<Alert[]> {
  return await apiRequest<Alert[]>('/alerts');
}

export async function getAlertStats(): Promise<AlertStats> {
  return await apiRequest<AlertStats>('/alerts/stats');
}

export async function updateAlertStatus(
  alertId: string, 
  status: 'reviewed' | 'escalated' | 'dismissed'
): Promise<void> {
  await apiRequest(`/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ---------------------------------------------------------------------------
// System endpoints
// ---------------------------------------------------------------------------

export async function getSystemMetrics(): Promise<SystemMetrics> {
  return await apiRequest<SystemMetrics>('/system');
}

// ---------------------------------------------------------------------------
// User Dashboard endpoints
// ---------------------------------------------------------------------------

export async function getUserDashboardStats(userId: string): Promise<UserDashboardStats> {
  return await apiRequest<UserDashboardStats>(`/user-dashboard/${userId}`);
}
