import { CoverageOverview } from '@/components/coverage/CoverageOverview'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

export const metadata = { title: 'Proveniens-vedlegg — Hvitbok' }

export default function ProveniensPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Breadcrumbs items={[{ label: 'Hvitbok', href: '/hvitbok' }, { label: 'Proveniens' }]} />
      <h1 className="text-2xl font-bold text-stone-900">Proveniens-vedlegg</h1>
      <p className="text-sm text-stone-600">
        Faktisk datadekning bak figurene i hvitboken — beregnet direkte fra databasen (ikke kuratert).
        Se «Hva betyr merkene?» i oversikten under for forklaring av tids-, geografi- og verifiseringsmerkene.
      </p>
      <CoverageOverview />
    </div>
  )
}
