'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  Search,
  Activity,
  BarChart3,
  Bell,
  Monitor,
  Shield,
  Network,
  CreditCard,
  ShieldCheck,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  roles?: ('analyst' | 'admin' | 'viewer' | 'user')[];
}

const navItems: NavItem[] = [
  // Admin / Analyst navigation
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['analyst', 'admin', 'viewer'] },
  { href: '/analyzer', label: 'Transaction Analyzer', icon: Search, roles: ['analyst', 'admin'] },
  { href: '/transactions', label: 'Transactions Monitor', icon: Activity, roles: ['analyst', 'admin', 'viewer'] },
  { href: '/analytics', label: 'Fraud Analytics', icon: BarChart3, roles: ['analyst', 'admin', 'viewer'] },
  { href: '/alerts', label: 'Alerts', icon: Bell, roles: ['analyst', 'admin'] },
  { href: '/network', label: 'Fraud Network', icon: Network, badge: '3D', roles: ['analyst', 'admin'] },
  { href: '/system', label: 'System Monitoring', icon: Monitor, roles: ['analyst', 'admin'] },
  // User navigation
  { href: '/user-dashboard', label: 'My Dashboard', icon: LayoutDashboard, roles: ['user'] },
  { href: '/transactions', label: 'My Transactions', icon: CreditCard, roles: ['user'] },
  { href: '/alerts', label: 'Security Alerts', icon: ShieldCheck, roles: ['user'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const userRole = user?.role || 'analyst';
  const filteredItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));
  const isUserRole = userRole === 'user';

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar/95 backdrop-blur-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shadow-lg',
              isUserRole
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-500/20'
                : 'bg-gradient-to-br from-primary to-primary/70 shadow-primary/20'
            )}
          >
            <Shield className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">FinSentinel</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isUserRole ? 'Personal Banking' : 'Fraud Detection'}
            </p>
          </div>
        </div>

        {/* Role indicator */}
        <div className="px-4 pt-4 pb-2">
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
            isUserRole
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'bg-primary/10 text-primary border border-primary/20'
          )}>
            {isUserRole ? <User className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
            <span>{isUserRole ? 'Customer Account' : 'Fraud Analyst'}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {filteredItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={`${item.href}-${item.label}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-sidebar-primary'
                      : 'text-muted-foreground hover:text-sidebar-foreground'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-sidebar-accent"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      isActive && "text-sidebar-primary"
                    )} />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="relative z-10 ml-auto rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Quick switch link */}
        {isUserRole ? (
          <div className="border-t border-sidebar-border px-3 py-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
            >
              <Shield className="h-4 w-4" />
              <span>Switch to Analyst View</span>
            </Link>
          </div>
        ) : (
          <div className="border-t border-sidebar-border px-3 py-3">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
            >
              <User className="h-4 w-4" />
              <span>Switch to User View</span>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-safe"
            />
            <span>System Operational</span>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/60">v2.4.1</p>
        </div>
      </div>
    </aside>
  );
}
