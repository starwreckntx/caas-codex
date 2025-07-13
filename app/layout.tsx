import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-provider'
import { AuthWrapper } from '@/components/auth-wrapper'
import { LoadingProvider } from '@/lib/loading-context'
import { ConversationProvider } from '@/components/conversation-provider'
import { ModeRouter } from '@/components/mode-router'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HueAndLogic',
  description: 'Advanced AI Reasoning & Analysis Platform - Recursive Logic and Chain of Thought Research',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LoadingProvider>
            <AuthProvider>
              <AuthWrapper>
                <ConversationProvider>
                  <ModeRouter>
                    {children}
                  </ModeRouter>
                </ConversationProvider>
              </AuthWrapper>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}