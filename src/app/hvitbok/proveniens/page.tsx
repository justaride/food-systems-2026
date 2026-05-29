import { CoverageOverview } from '@/components/coverage/CoverageOverview'

export const metadata = { title: 'Proveniens-vedlegg — Hvitbok' }

export default function ProveniensPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold text-stone-900">Proveniens-vedlegg</h1>
      <p className="text-sm text-stone-600">
        Faktisk datadekning bak figurene i hvitboken — temporal rekkevidde, geografisk omfang og
        verifiseringsgrad, beregnet direkte fra databasen (ikke kuratert). Et øyeblikksbilde-merke
        betyr at tallet er ett enkelt år, ikke en tidsserie; «NO → nordisk» betyr at kun norske data
        ligger bak en nordisk-presentert figur.
      </p>
      <CoverageOverview />
    </div>
  )
}
