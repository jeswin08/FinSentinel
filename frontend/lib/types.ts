export type RiskLevel = 'Safe' | 'Suspicious' | 'Fraud';
export type Decision = 'Approved' | 'OTP Required' | 'Blocked';

export interface Transaction {
  transaction_id: string;
  user_id: string;
  amount: number;
  currency: string;
  merchant: string;
  category?: string;
  location: string;
  device_id: string;
  risk_score: number;
  risk_level: RiskLevel;
  decision: Decision;
  flagged_rules: string[];
  timestamp: string;
  explanation: string;
}

export interface DashboardStats {
  total_transactions: number;
  fraud_detected: number;
  fraud_rate: number;
  total_amount_protected: number;
  risk_distribution: RiskDistribution;
  alerted_risk_distribution: RiskDistribution;
}

export interface RiskDistribution {
  Safe: number;
  Suspicious: number;
  Fraud: number;
}

export interface HourlyFraud {
  hour: number;
  count: number;
}

export interface FlaggedRule {
  rule: string;
  count: number;
}

export interface SystemMetrics {
  uptime: string;
  transactions_processed: number;
  avg_processing_time: number;
  fraud_detection_rate: number;
  api_status: 'operational' | 'degraded' | 'down';
  model_status: 'operational' | 'degraded' | 'down';
  database_status: 'operational' | 'degraded' | 'down';
}

export interface TransactionAnalysis {
  risk_score: number;
  risk_level: RiskLevel;
  decision: Decision;
  flagged_rules: string[];
  explanation: string;
}

export interface TransactionFormData {
  user_id: string;
  amount: number;
  currency: string;
  merchant: string;
  location: string;
  device_id: string;
  usual_location: string;
  usual_device: string;
  user_avg_amount: number;
  hour_of_day: number;
}

export interface Alert {
  id: string;
  transaction_id: string;
  user_id: string;
  amount: number;
  risk_score: number;
  flagged_rules: string[];
  timestamp: string;
  status: 'active' | 'reviewed' | 'escalated' | 'dismissed';
}

export interface AlertStats {
  active_alerts: number;
  blocked_today: number;
  investigations_pending: number;
}

export interface FraudTrend {
  date: string;
  fraud_count: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'analyst' | 'admin' | 'viewer' | 'user';
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserDashboardStats {
  user_id: string;
  user_name: string;
  total_transactions: number;
  approved_transactions: number;
  flagged_transactions: number;
  blocked_transactions: number;
  total_spent: number;
  monthly_spent: number;
  monthly_limit: number;
  security_score: number;
  active_devices: number;
  last_login_location: string;
  account_age_days: number;
  spending_by_category: { category: string; amount: number; count: number }[];
  recent_transactions: Transaction[];
  monthly_spending: { month: string; amount: number }[];
  risk_events: { date: string; type: string; description: string; resolved: boolean }[];
}

export interface NetworkNode {
  id: string;
  type: 'user' | 'merchant' | 'transaction';
  riskLevel: RiskLevel;
  position: [number, number, number];
  connections: string[];
  label: string;
  amount?: number;
  riskScore?: number;
}
