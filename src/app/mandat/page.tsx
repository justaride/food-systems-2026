import type { Metadata } from 'next'
import { MandatContent } from './MandatContent'

export const metadata: Metadata = {
  title: 'Mandat og validering - Food Systems 2026',
  description: 'Food TG scope, opportunity radar, claim-status og valideringssprint.',
}

export default function MandatPage() {
  return <MandatContent />
}
