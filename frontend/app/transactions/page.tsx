'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Header } from '@/components/header';
import { TransactionTable } from '@/components/transaction-table';
import { TransactionDetailPanel } from '@/components/transaction-detail-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllTransactions } from '@/hooks/use-transactions';
import type { Transaction, RiskLevel } from '@/lib/types';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const riskFilters: (RiskLevel | undefined)[] = [undefined, 'Safe', 'Suspicious', 'Fraud'];

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | undefined>(undefined);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const pageSize = 20;

  const { transactions, total, isLoading } = useAllTransactions(page, pageSize, riskFilter, search);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getRiskFilterBadge = (level: RiskLevel | undefined) => {
    if (!level) return 'border-border bg-secondary/50 text-foreground';
    switch (level) {
      case 'Safe': return 'border-safe/30 bg-safe/10 text-safe';
      case 'Suspicious': return 'border-suspicious/30 bg-suspicious/10 text-suspicious';
      case 'Fraud': return 'border-fraud/30 bg-fraud/10 text-fraud';
    }
  };

  return (
    <DashboardLayout>
      <Header title="Transactions Monitor" subtitle="Search and investigate transactions" />

      <div className="p-6 space-y-6">
        {/* Filters row */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, user, or merchant…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-10 bg-input/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {riskFilters.map((level) => (
              <button
                key={level ?? 'all'}
                onClick={() => { setRiskFilter(level); setPage(1); }}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-medium transition-all hover:scale-105',
                  getRiskFilterBadge(level),
                  riskFilter === level && 'ring-1 ring-primary'
                )}
              >
                {level ?? 'All'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Transaction table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-lg"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">All Transactions</h3>
              <p className="text-sm text-muted-foreground">
                {total.toLocaleString()} total transactions
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <TransactionTable
              transactions={transactions}
              onSelectTransaction={(t) => setSelectedTransaction(t)}
            />
          )}

          {/* Pagination */}
          {total > pageSize && (
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail panel */}
      {selectedTransaction && (
        <TransactionDetailPanel
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </DashboardLayout>
  );
}
