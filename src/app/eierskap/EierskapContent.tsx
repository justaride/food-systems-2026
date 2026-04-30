'use client'

import { Card } from '@/components/ui/Card'
import { OwnershipTreeDiagram } from '@/components/charts/OwnershipTreeDiagram'
import type { OwnershipMapData } from '@/lib/queries/ownership'

type Props = {
  data: OwnershipMapData
}

function formatNok(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value === 0) return '0'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)} mrd`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(0)} MNOK`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)} TNOK`
  return `${sign}${Math.round(abs).toLocaleString('nb-NO')}`
}

export function EierskapContent({ data }: Props) {
  const { trees, totalCompanies, totalRelationships } = data
  const totalRevenueNok = trees.reduce((sum, tree) => sum + tree.financialSummary.totalRevenueNok, 0)
  const totalSubsidyNok = trees.reduce((sum, tree) => sum + tree.financialSummary.totalSubsidyNok, 0)
  const totalYearMatchedSubsidyNok = trees.reduce((sum, tree) => sum + tree.financialSummary.yearMatchedSubsidyNok, 0)
  const treesWithFinancials = trees.filter(tree => tree.financialSummary.companiesWithFinancials > 0).length
  const sortedFinancialTrees = [...trees].sort(
    (a, b) => b.financialSummary.totalRevenueNok - a.financialSummary.totalRevenueNok
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Eierskap</h1>
        <p className="text-sm text-stone-500 mt-1">Konsernstrukturer og eierskapsforhold</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Konserntraer</p>
          <p className="text-lg font-bold text-stone-900">{trees.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Selskaper</p>
          <p className="text-lg font-bold text-stone-900">{totalCompanies}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Eierforhold</p>
          <p className="text-lg font-bold text-stone-900">{totalRelationships}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Med regnskap</p>
          <p className="text-lg font-bold text-stone-900">{treesWithFinancials}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Omsetning i trær</p>
          <p className="text-lg font-bold text-stone-900">{formatNok(totalRevenueNok)}</p>
        </div>
        <div className="card">
          <p className="text-xs text-stone-400 uppercase tracking-wider">Tilskudd i trær</p>
          <p className="text-lg font-bold text-stone-900">{formatNok(totalSubsidyNok)}</p>
        </div>
      </div>

      <Card title="Konsernvis økonomi og subsidier">
        <p className="mb-3 text-xs leading-5 text-stone-500">
          Summerer siste registrerte regnskapsrad per selskap i hvert eierskapstre.
          Tilskudd er akkumulert på tvers av registrerte år og må derfor leses som
          eksponering. Årsmatchet tilskudd summerer bare tilskudd i samme år som
          hvert selskaps siste regnskapsrad; lokal snapshot gir {formatNok(totalYearMatchedSubsidyNok)}
          {' '}i årsmatchet tilskudd på tvers av trærne.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="py-2 pr-4 font-medium text-stone-400">Konsern/tre</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Selskaper</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Omsetning</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Driftsresultat</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Margin</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Tilskudd</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Årsmatch</th>
                <th className="py-2 pr-4 text-right font-medium text-stone-400">Årsmatch %</th>
              </tr>
            </thead>
            <tbody>
              {sortedFinancialTrees.map(tree => {
                const summary = tree.financialSummary
                return (
                  <tr key={tree.rootId} className="border-b border-stone-100">
                    <td className="py-2 pr-4 font-medium text-stone-800">{tree.rootName}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-600">
                      {summary.companyCount}
                      <span className="ml-1 text-stone-300">
                        ({summary.companiesWithFinancials} regnskap)
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                      {formatNok(summary.totalRevenueNok)}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                      {formatNok(summary.totalOperatingResultNok)}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                      {summary.weightedOperatingMargin == null
                        ? '—'
                        : `${summary.weightedOperatingMargin.toFixed(1)}%`}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                      {summary.totalSubsidyNok > 0 ? formatNok(summary.totalSubsidyNok) : '—'}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                      {summary.yearMatchedSubsidyNok > 0 ? (
                        <>
                          {formatNok(summary.yearMatchedSubsidyNok)}
                          <span className="ml-1 text-stone-300">
                            ({summary.companiesWithYearMatchedSubsidy})
                          </span>
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                      {summary.yearMatchedSubsidySharePct == null || summary.yearMatchedSubsidyNok === 0
                        ? '—'
                        : `${summary.yearMatchedSubsidySharePct.toFixed(2)}%`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {trees.map(tree => (
          <Card key={tree.rootId} title={tree.rootName}>
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
              <div className="rounded border border-stone-200 bg-stone-50 px-2 py-1.5">
                <p className="text-stone-400">Omsetning</p>
                <p className="font-semibold text-stone-800">{formatNok(tree.financialSummary.totalRevenueNok)}</p>
              </div>
              <div className="rounded border border-stone-200 bg-stone-50 px-2 py-1.5">
                <p className="text-stone-400">Resultat</p>
                <p className="font-semibold text-stone-800">{formatNok(tree.financialSummary.totalOperatingResultNok)}</p>
              </div>
              <div className="rounded border border-stone-200 bg-stone-50 px-2 py-1.5">
                <p className="text-stone-400">Tilskudd</p>
                <p className="font-semibold text-stone-800">
                  {tree.financialSummary.totalSubsidyNok > 0
                    ? formatNok(tree.financialSummary.totalSubsidyNok)
                    : '—'}
                </p>
              </div>
              <div className="rounded border border-stone-200 bg-stone-50 px-2 py-1.5">
                <p className="text-stone-400">Årsmatch</p>
                <p className="font-semibold text-stone-800">
                  {tree.financialSummary.yearMatchedSubsidyNok > 0
                    ? formatNok(tree.financialSummary.yearMatchedSubsidyNok)
                    : '—'}
                </p>
              </div>
              <div className="rounded border border-stone-200 bg-stone-50 px-2 py-1.5">
                <p className="text-stone-400">Dekning</p>
                <p className="font-semibold text-stone-800">
                  {tree.financialSummary.companiesWithFinancials}/{tree.financialSummary.companyCount}
                </p>
              </div>
            </div>
            <OwnershipTreeDiagram tree={tree} />
          </Card>
        ))}
      </div>
    </div>
  )
}
