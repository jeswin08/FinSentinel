'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Loader2, Eye, EyeOff, AlertCircle, User, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      if (email === 'user@finsentinel.com') {
        router.push('/user-dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const fillCredentials = (type: 'analyst' | 'user') => {
    if (type === 'analyst') {
      setEmail('demo@finsentinel.com');
      setPassword('demo123');
    } else {
      setEmail('user@finsentinel.com');
      setPassword('user123');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/5 via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25"
            >
              <Shield className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold">FinSentinel</CardTitle>
              <CardDescription className="text-muted-foreground">
                AI-Powered Fraud Detection System
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-2 rounded-lg border border-fraud/50 bg-fraud/10 p-3 text-sm text-fraud"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Quick login buttons */}
              <div className="space-y-3 pt-2">
                <p className="text-center text-xs font-medium text-muted-foreground">Quick Login</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fillCredentials('analyst')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 text-xs transition-all hover:scale-[1.02]',
                      email === 'demo@finsentinel.com'
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      email === 'demo@finsentinel.com' ? 'bg-primary/20' : 'bg-muted/50'
                    )}>
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Analyst</p>
                      <p className="text-[10px] opacity-70">Fraud monitoring</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('user')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border p-4 text-xs transition-all hover:scale-[1.02]',
                      email === 'user@finsentinel.com'
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-400'
                        : 'border-border/50 bg-muted/20 text-muted-foreground hover:border-blue-500/30 hover:bg-blue-500/5'
                    )}
                  >
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      email === 'user@finsentinel.com' ? 'bg-blue-500/20' : 'bg-muted/50'
                    )}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Customer</p>
                      <p className="text-[10px] opacity-70">Personal banking</p>
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
