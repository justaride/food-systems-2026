'use client'

import { useEffect } from 'react'
import { RouteRecovery } from '@/components/layout/RouteRecovery'

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error('Route rendering failed', error)
  }, [error])

  return (
    <RouteRecovery
      title="Denne siden kan ikke vises nå"
      description="Prøv å laste siden på nytt. Hvis problemet fortsetter, gå til oversikten og velg en annen arbeidsflate."
      retry={retry}
    />
  )
}
