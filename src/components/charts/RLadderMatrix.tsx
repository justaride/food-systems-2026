'use client'

import { useMemo, useState } from 'react'
import {
  rLadder,
  valueChainSlots,
  type RLevel,
  type ValueChainSlot,
  type RLadderStep,
} from '@/lib/data/r-ladder'

type MatrixItem = {
  id: string
  name: string
  country: string
  kind: 'loop' | 'gap' | 'success' | 'failure'
  rLevel?: string
  valueChainSteps: string[]
  detail?: string
}

type Props = {
  items: MatrixItem[]
}

type Cell = {
  rLevel: RLevel
  slot: ValueChainSlot
  items: MatrixItem[]
}

const KIND_BADGE: Record<MatrixItem['kind'], string> = {
  loop: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  gap: 'bg-rose-50 text-rose-700 border-rose-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failure: 'bg-stone-100 text-stone-700 border-stone-200',
}

const KIND_LABEL: Record<MatrixItem['kind'], string> = {
  loop: 'loop',
  gap: 'gap',
  success: 'suksess',
  failure: 'fiasko',
}

function intensityClass(count: number, category: RLadderStep['category']): string {
  if (count === 0) return 'bg-stone-50 text-stone-300'
  const palette = {
    'core-circular': ['bg-emerald-50', 'bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300'],
    'extended-life': ['bg-blue-50', 'bg-blue-100', 'bg-blue-200', 'bg-blue-300'],
    'useful-application': ['bg-amber-50', 'bg-amber-100', 'bg-amber-200', 'bg-amber-300'],
    linear: ['bg-stone-100', 'bg-stone-200', 'bg-stone-300', 'bg-stone-400'],
  }[category]
  if (count === 1) return `${palette[0]} text-stone-700`
  if (count === 2) return `${palette[1]} text-stone-800`
  if (count <= 4) return `${palette[2]} text-stone-900`
  return `${palette[3]} text-stone-900`
}

export function RLadderMatrix({ items }: Props) {
  const [selected, setSelected] = useState<{ rLevel: RLevel; slot: ValueChainSlot } | null>(null)

  const cells = useMemo<Cell[]>(() => {
    const out: Cell[] = []
    for (const step of rLadder) {
      for (const slot of valueChainSlots) {
        const matches = items.filter(
          (it) => it.rLevel === step.id && it.valueChainSteps.includes(slot.id),
        )
        out.push({ rLevel: step.id, slot: slot.id, items: matches })
      }
    }
    return out
  }, [items])

  const selectedCell = selected
    ? cells.find((c) => c.rLevel === selected.rLevel && c.slot === selected.slot) ?? null
    : null

  const classified = items.filter((i) => i.rLevel).length
  const unclassified = items.length - classified

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">R-stige x verdikjede</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {classified} initiativer klassifisert, {unclassified} uklassifisert. Hoyere R = mindre sirkulaer.
          </p>
        </div>
        <div className="flex gap-2 text-[10px] text-stone-500 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-emerald-300 bg-emerald-200" />
            Kjernesirkulaer (R0-R3)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-blue-300 bg-blue-200" />
            Forlenget levetid (R4-R5)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-amber-300 bg-amber-200" />
            Nytteanvendelse (R6-R8)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded border border-stone-400 bg-stone-300" />
            Lineaert (R9)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-1">
          <thead>
            <tr>
              <th className="text-left text-stone-500 font-medium pr-2 py-1 w-36">
                R-niva
              </th>
              {valueChainSlots.map((slot) => (
                <th
                  key={slot.id}
                  className="text-[10px] text-stone-500 font-medium text-center py-1 min-w-[70px]"
                >
                  {slot.labelNo}
                </th>
              ))}
              <th className="text-[10px] text-stone-500 font-medium text-center py-1 w-12">
                Sum
              </th>
            </tr>
          </thead>
          <tbody>
            {rLadder.map((step) => {
              const rowItems = cells.filter((c) => c.rLevel === step.id)
              const rowTotal = rowItems.reduce((sum, c) => sum + c.items.length, 0)
              return (
                <tr key={step.id}>
                  <td className="pr-2 py-1 align-middle">
                    <div className="flex items-start gap-1.5">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${step.color} border ${step.border}`}
                      >
                        {step.id}
                      </span>
                      <span className="text-[11px] text-stone-600 leading-tight">
                        {step.nameNo}
                      </span>
                    </div>
                  </td>
                  {valueChainSlots.map((slot) => {
                    const cell = rowItems.find((c) => c.slot === slot.id)
                    const count = cell?.items.length ?? 0
                    const isSelected =
                      selected?.rLevel === step.id && selected?.slot === slot.id
                    return (
                      <td key={slot.id} className="p-0">
                        <button
                          type="button"
                          onClick={() =>
                            count > 0
                              ? setSelected(isSelected ? null : { rLevel: step.id, slot: slot.id })
                              : undefined
                          }
                          disabled={count === 0}
                          className={`w-full h-10 rounded text-[11px] font-medium border transition-all
                            ${intensityClass(count, step.category)}
                            ${isSelected ? 'ring-2 ring-stone-900 border-stone-900' : 'border-stone-200'}
                            ${count > 0 ? 'cursor-pointer hover:ring-1 hover:ring-stone-400' : 'cursor-default'}
                          `}
                          aria-label={`${step.id} × ${slot.labelNo}: ${count} initiativer`}
                        >
                          {count || ''}
                        </button>
                      </td>
                    )
                  })}
                  <td className="text-center text-[11px] font-medium text-stone-500 py-1">
                    {rowTotal || ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedCell && selectedCell.items.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-800">
                {selectedCell.rLevel} {rLadder.find((s) => s.id === selectedCell.rLevel)?.nameNo}
                <span className="text-stone-400 mx-2">·</span>
                {valueChainSlots.find((s) => s.id === selectedCell.slot)?.labelNo}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                {selectedCell.items.length} initiativer
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              Lukk
            </button>
          </div>
          <div className="space-y-2">
            {selectedCell.items.map((item) => (
              <div
                key={`${item.kind}-${item.id}`}
                className="flex items-start gap-2 bg-white rounded border border-stone-200 px-3 py-2"
              >
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${KIND_BADGE[item.kind]}`}
                >
                  {KIND_LABEL[item.kind]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800">{item.name}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {item.country}
                    {item.detail ? ` · ${item.detail}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="text-xs text-stone-500">
        <summary className="cursor-pointer font-medium hover:text-stone-800">
          R-stige-definisjoner (Potting et al. 2017)
        </summary>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {rLadder.map((step) => (
            <div key={step.id} className="flex items-start gap-2 bg-white rounded border border-stone-100 p-2">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${step.color} border ${step.border} shrink-0`}
              >
                {step.id}
              </span>
              <div>
                <p className="text-xs font-medium text-stone-800">
                  {step.nameNo} <span className="text-stone-400">({step.name})</span>
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
