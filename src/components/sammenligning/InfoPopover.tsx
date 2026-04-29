'use client'

import { useState } from 'react'

type InfoPopoverProps = { year?: number | string | null; source?: string | null }

export function InfoPopover({ year, source }: InfoPopoverProps) {
  const [open, setOpen] = useState(false)
  if (!year && !source) return null
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label="Vis kilde"
        className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-stone-100 text-stone-500 text-[10px] font-bold hover:bg-stone-200"
        onClick={() => setOpen(o => !o)}
        onBlur={() => setOpen(false)}
      >i</button>
      {open && (
        <span className="absolute right-0 top-5 z-10 w-64 p-2 text-[11px] leading-snug bg-white border border-stone-200 rounded shadow-lg text-stone-600">
          {year && <span className="block font-medium text-stone-700">År: {year}</span>}
          {source && <span className="block mt-1">{source}</span>}
        </span>
      )}
    </span>
  )
}
