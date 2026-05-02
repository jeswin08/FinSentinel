import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SWRConfig } from 'swr'
import { AuthProvider } from '@/hooks/use-auth'
import { NotificationsProvider } from '@/hooks/use-notifications'
import { NotificationsToast } from '@/components/notifications-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinSentinel - AI-Powered Fraud Detection',
  description: 'Real-time fraud monitoring and detection system for banking transactions',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SWRConfig
            value={{
              refreshInterval: 30000,
              dedupingInterval: 60000,
              revalidateOnFocus: false,
            }}
          >
            <AuthProvider>
              <NotificationsProvider>
                {children}
                <NotificationsToast />
              </NotificationsProvider>
            </AuthProvider>
          </SWRConfig>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
