'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { StatsCard } from '@/components/stats-card';
import { SecurityScore } from '@/components/security-score';
import { SpendingChart } from '@/components/charts/spending-chart';
import { CategoryChart } from '@/components/charts/category-chart';
import { useUserDashboard } from '@/hooks/use-user-dashboard';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Wallet,
  TrendingUp,
  MapPin,
  Smartphone,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function StatSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

function CardSkeleton({ height = 'h-[300px]' }: { height?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6">
      <Skeleton className="h-6 w-40 mb-2" />
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className={`${height} w-full rounded-lg`} />
    </div>
  );
}

export default function UserDashboardPage() {
  const { user } = useAuth();
  const { stats, isLoading } = useUserDashboard(user?.id || 'USR-1001');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Safe': return 'bg-safe/20 text-safe border-safe/30';
      case 'Suspicious': return 'bg-suspicious/20 text-suspicious border-suspicious/30';
      case 'Fraud': return 'bg-fraud/20 text-fraud border-fraud/30';
      default: return '';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'device': return <Smartphone className="h-4 w-4" />;
      case 'amount': return <AlertTriangle className="h-4 w-4" />;
      case 'velocity': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const spendingPercentage = stats ? Math.round((stats.monthly_spent / stats.monthly_limit) * 100) : 0;

  return (
    <DashboardLayout>
      <Header title={`Welcome back, ${user?.name || 'User'}`} subtitle="Your personal financial security overview" />

      <div className="p-6 space-y-6">
        {/* Greeting banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6"
        >
          <div className="relative z-10">
            <h2 className="text-lg font-semibold text-card-foreground">Account Overview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              All your transactions are protected by FinSentinel&apos;s AI fraud detection
            </p>
          </div>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10">
            <ShieldCheck className="h-24 w-24 text-primary" />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <StatsCard
                  title="Total Transactions"
                  value={stats?.total_transactions.toLocaleString() ?? '0'}
                  icon={CreditCard}
                  trend={{ value: 8, isPositive: true }}
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <StatsCard
                  title="Approved"
                  value={stats?.approved_transactions.toLocaleString() ?? '0'}
                  icon={ShieldCheck}
                  variant="safe"
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <StatsCard
                  title="Flagged"
                  value={stats?.flagged_transactions.toLocaleString() ?? '0'}
                  icon={AlertTriangle}
                  variant="suspicious"
                />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <StatsCard
                  title="Blocked"
                  value={stats?.blocked_transactions.toLocaleString() ?? '0'}
                  icon={Ban}
                  variant="fraud"
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Monthly spending + limit */}
            {isLoading ? (
              <CardSkeleton height="h-[60px]" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Monthly Spending</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(stats?.monthly_spent ?? 0)} of {formatCurrency(stats?.monthly_limit ?? 10000)} limit
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <span className={cn(
                      'text-sm font-semibold',
                      spendingPercentage > 80 ? 'text-fraud' : spendingPercentage > 60 ? 'text-suspicious' : 'text-safe'
                    )}>
                      {spendingPercentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(spendingPercentage, 100)}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn(
                      'h-full rounded-full',
                      spendingPercentage > 80 ? 'bg-fraud' : spendingPercentage > 60 ? 'bg-suspicious' : 'bg-safe'
                    )}
                  />
                </div>
              </motion.div>
            )}

            {/* Spending trend chart */}
            {isLoading ? (
              <CardSkeleton />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Spending Trend</h3>
                    <p className="text-sm text-muted-foreground">Monthly spending over time</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-safe">
                    <TrendingUp className="h-3 w-3" />
                    <span>On track</span>
                  </div>
                </div>
                {stats && <SpendingChart data={stats.monthly_spending} />}
              </motion.div>
            )}

            {/* Recent Transactions */}
            {isLoading ? (
              <CardSkeleton height="h-[300px]" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Recent Transactions</h3>
                    <p className="text-sm text-muted-foreground">Your latest activity</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium rounded-full border border-safe/30 bg-safe/10 px-3 py-1 text-safe">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-2 w-2 rounded-full bg-safe"
                    />
                    <span>Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {stats?.recent_transactions.map((txn, index) => (
                    <motion.div
                      key={txn.transaction_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="flex items-center justify-between rounded-lg border border-border/50 bg-card/30 p-4 transition-colors hover:bg-card/60"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-full',
                          txn.risk_level === 'Safe' ? 'bg-safe/15' : txn.risk_level === 'Suspicious' ? 'bg-suspicious/15' : 'bg-fraud/15'
                        )}>
                          <CreditCard className={cn(
                            'h-5 w-5',
                            txn.risk_level === 'Safe' ? 'text-safe' : txn.risk_level === 'Suspicious' ? 'text-suspicious' : 'text-fraud'
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{txn.merchant}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(txn.timestamp)} · {txn.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={getRiskBadge(txn.risk_level)}>
                          {txn.risk_level}
                        </Badge>
                        <span className="text-sm font-semibold text-card-foreground">
                          {formatCurrency(txn.amount)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            {/* Security Score */}
            {isLoading ? (
              <CardSkeleton height="h-[250px]" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Security Score</h3>
                {stats && (
                  <SecurityScore
                    score={stats.security_score}
                    activeDevices={stats.active_devices}
                    lastLocation={stats.last_login_location}
                    accountAgeDays={stats.account_age_days}
                  />
                )}
              </motion.div>
            )}

            {/* Spending by Category */}
            {isLoading ? (
              <CardSkeleton height="h-[200px]" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Spending Breakdown</h3>
                <p className="text-sm text-muted-foreground mb-4">By category</p>
                {stats && <CategoryChart data={stats.spending_by_category} />}
              </motion.div>
            )}

            {/* Security Events */}
            {isLoading ? (
              <CardSkeleton height="h-[200px]" />
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-card-foreground mb-1">Security Events</h3>
                <p className="text-sm text-muted-foreground mb-4">Recent account activity flags</p>
                <div className="space-y-3">
                  {stats?.risk_events.map((event, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.05 }}
                      className="flex items-start gap-3"
                    >
                      <div className={cn(
                        'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        event.resolved ? 'bg-safe/15 text-safe' : 'bg-suspicious/15 text-suspicious'
                      )}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-card-foreground leading-tight">{event.description}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                          {event.resolved ? (
                            <span className="flex items-center gap-1 text-xs text-safe">
                              <CheckCircle2 className="h-3 w-3" /> Resolved
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-suspicious">
                              <XCircle className="h-3 w-3" /> Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
