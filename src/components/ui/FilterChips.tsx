'use client'

import { useState } from 'react'

type FilterItem = {
  label: string
  value: string
}

type FilterChipsProps = {
  items: FilterItem[]
  defaultValue?: string
  onChange?: (value: string) => void
}

export function FilterChips({ items, defaultValue = 'alle', onChange }: FilterChipsProps) {
  const [active, setActive] = useState(defaultValue)

  const handleClick = (value: string) => {
    setActive(value)
    onChange?.(value)
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {items.map(item => (
        <button
          key={item.value}
          onClick={() => handleClick(item.value)}
          className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
            active === item.value
              ? 'bg-stone-800 text-white'
              : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
