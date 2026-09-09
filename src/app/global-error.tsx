'use client'

import { useEffect } from 'react'
import { RouteRecovery } from '@/components/layout/RouteRecovery'
import '@/styles/globals.css'

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error('Application rendering failed', error)
  }, [error])

  return (
    <html lang="no">
      <body className="min-h-screen bg-stone-50 px-4 py-6 font-sans text-stone-900 sm:px-6">
        <RouteRecovery
          title="Arbeidsflaten kan ikke vises nå"
          description="Prøv igjen. Hvis problemet fortsetter, gå til oversikten og åpne arbeidsflaten på nytt derfra."
          retry={retry}
        />
      </body>
    </html>
  )
}
