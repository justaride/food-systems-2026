import type { Metadata } from 'next'
import '../styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Food Systems 2026 - NCH Transition Group',
  description: 'Dashboard for Food Systems Transition Group under Nordic Circular Hotspot',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body>
        <div className="min-h-screen flex flex-col lg:flex-row">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
