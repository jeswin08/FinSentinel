"use client";

import React, { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Transaction } from '@/lib/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onSelectTransaction?: (transaction: Transaction) => void;
  compact?: boolean;
}

export const TransactionTable = React.memo(function TransactionTable({ transactions, onSelectTransaction, compact }: TransactionTableProps) {
  const getRiskBadge = useCallback((level: string) => {
    switch (level) {
      case 'Safe': return 'bg-safe/20 text-safe border-safe/30';
      case 'Suspicious': return 'bg-suspicious/20 text-suspicious border-suspicious/30';
      case 'Fraud': return 'bg-fraud/20 text-fraud border-fraud/30';
      default: return '';
    }
  }, []);

  const formatDate = useCallback((ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }, []);

  const rows = useMemo(() => transactions.map((txn, idx) => (
    <tr
      key={txn.transaction_id ?? `txn-${idx}`}
      onClick={() => onSelectTransaction?.(txn)}
      className={cn(
        'border-b border-border/50 transition-colors',
        onSelectTransaction && 'cursor-pointer hover:bg-secondary/50'
      )}
    >
      <td className="py-3 font-mono text-xs text-card-foreground">{txn.transaction_id}</td>
      {!compact && <td className="py-3 text-sm text-muted-foreground">{txn.user_id}</td>}
      <td className="py-3 text-sm text-card-foreground">{txn.merchant}</td>
      <td className="py-3 text-sm font-medium text-card-foreground">
        ${txn.amount?.toLocaleString()}
      </td>
      <td className="py-3">
        <Badge variant="outline" className={cn('text-xs', getRiskBadge(txn.risk_level))}>
          {txn.risk_level}
        </Badge>
      </td>
      <td className="py-3 text-xs text-muted-foreground">{txn.decision}</td>
      <td className="py-3 text-xs text-muted-foreground">{formatDate(txn.timestamp)}</td>
    </tr>
  )), [transactions, compact, onSelectTransaction, getRiskBadge, formatDate]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border text-left">
            <th className="pb-3 text-xs font-medium text-muted-foreground">ID</th>
            {!compact && <th className="pb-3 text-xs font-medium text-muted-foreground">User</th>}
            <th className="pb-3 text-xs font-medium text-muted-foreground">Merchant</th>
            <th className="pb-3 text-xs font-medium text-muted-foreground">Amount</th>
            <th className="pb-3 text-xs font-medium text-muted-foreground">Risk</th>
            <th className="pb-3 text-xs font-medium text-muted-foreground">Decision</th>
            <th className="pb-3 text-xs font-medium text-muted-foreground">Time</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
});
