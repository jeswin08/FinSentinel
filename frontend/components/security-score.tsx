'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityScoreProps {
  score: number;
  activeDevices: number;
  lastLocation: string;
  accountAgeDays: number;
}

export function SecurityScore({ score, activeDevices, lastLocation, accountAgeDays }: SecurityScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score]);

  const getLevel = () => {
    if (score >= 80) return { label: 'Excellent', color: 'text-safe', bg: 'bg-safe', icon: ShieldCheck };
    if (score >= 60) return { label: 'Good', color: 'text-suspicious', bg: 'bg-suspicious', icon: Shield };
    return { label: 'Needs Attention', color: 'text-fraud', bg: 'bg-fraud', icon: ShieldAlert };
  };

  const level = getLevel();
  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular gauge */}
      <div className="relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke="oklch(0.22 0.01 260)"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke={score >= 80 ? 'oklch(0.65 0.2 145)' : score >= 60 ? 'oklch(0.75 0.18 85)' : 'oklch(0.6 0.22 25)'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={displayScore}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn('text-3xl font-bold', level.color)}
          >
            {displayScore}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>

      {/* Level badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={cn(
          'flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium',
          score >= 80
            ? 'bg-safe/15 text-safe border border-safe/30'
            : score >= 60
            ? 'bg-suspicious/15 text-suspicious border border-suspicious/30'
            : 'bg-fraud/15 text-fraud border border-fraud/30'
        )}
      >
        <level.icon className="h-4 w-4" />
        {level.label}
      </motion.div>

      {/* Details */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Active Devices</span>
          <span className="font-medium text-card-foreground">{activeDevices}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Login</span>
          <span className="font-medium text-card-foreground">{lastLocation}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Account Age</span>
          <span className="font-medium text-card-foreground">{Math.floor(accountAgeDays / 30)} months</span>
        </div>
      </div>
    </div>
  );
}
