import type { Metadata } from 'next'
import '../styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { getPhases } from '@/lib/queries/project'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Food Systems 2026 - NCH Transition Group',
  description: 'Dashboard for Food Systems Transition Group under Nordic Circular Hotspot',
  icons: { icon: '/favicon.svg' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const phases = await getPhases()
  const activeIndex = phases.findIndex(p => p.status === 'pagar')
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col lg:flex-row">
            <Sidebar activePhase={activeIndex >= 0 ? activeIndex + 1 : 1} totalPhases={phases.length} />
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl w-full">
                {children}
              </main>
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
