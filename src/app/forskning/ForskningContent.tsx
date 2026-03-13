'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'

type ResearchPromptRow = {
  id: string
  category: string
  title: string
  prompt: string
  model: string
  expectedOutput: string
  language: string
}

const categoryLabels: Record<string, { label: string; description: string }> = {
  'boker-akademisk': {
    label: 'Boker og akademisk',
    description: 'Boker, avhandlinger og akademisk litteratur om matsystemer',
  },
  'forskningsartikler': {
    label: 'Forskningsartikler',
    description: 'Fagfellevurderte artikler og working papers',
  },
  'naeringspublikasjoner': {
    label: 'Naeringspublikasjoner',
    description: 'Arsrapporter, bransjeanalyser og naeringsoversikter',
  },
  'offentlige-rapporter': {
    label: 'Offentlige rapporter',
    description: 'NOUer, stortingsmeldinger og tilsynsrapporter',
  },
  'regulatorisk': {
    label: 'Regulatorisk',
    description: 'Lover, forskrifter og regulatorisk kartlegging',
  },
  'nordisk-komparativ': {
    label: 'Nordisk komparativ',
    description: 'Sammenligning av nordiske matsystemer og politikk',
  },
  'matsikkerhet': {
    label: 'Matsikkerhet',
    description: 'Selvforsyning, beredskap og matsikkerhet',
  },
  'matsvinn-sirkulaer': {
    label: 'Matsvinn og sirkulaer',
    description: 'Matsvinn, sirkulaer okonomi og bioressurser',
  },
  'logistikk-verdikjede': {
    label: 'Logistikk og verdikjede',
    description: 'Distribusjon, forsyningskjeder og saarbarhet',
  },
  'interessenter': {
    label: 'Interessenter',
    description: 'Aktoerer, organisasjoner og nokkelpeople',
  },
  'finansiering': {
    label: 'Finansiering',
    description: 'Virkemidler, forskningsfond og tilskudd',
  },
  'mediedebatt': {
    label: 'Mediedebatt',
    description: 'Mediedekning, politiske posisjoner og opinion',
  },
}

const MODEL_COLORS: Record<string, string> = {
  'chatgpt-deep-research': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'gemini-deep-research': 'bg-blue-50 text-blue-700 border-blue-200',
  'perplexity': 'bg-violet-50 text-violet-700 border-violet-200',
  'claude': 'bg-amber-50 text-amber-700 border-amber-200',
}

const MODEL_LABELS: Record<string, string> = {
  'chatgpt-deep-research': 'ChatGPT Deep Research',
  'gemini-deep-research': 'Gemini Deep Research',
  'perplexity': 'Perplexity',
  'claude': 'Claude',
}

export function ForskningContent({ researchPrompts }: { researchPrompts: ResearchPromptRow[] }) {
  const [categoryFilter, setCategoryFilter] = useState('alle')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const categoryFilters = [
    { label: 'Alle', value: 'alle' },
    ...Object.entries(categoryLabels).map(([value, { label }]) => {
      const count = researchPrompts.filter(p => p.category === value).length
      return { label: `${label} (${count})`, value }
    }),
  ]

  const filtered = researchPrompts.filter(p =>
    categoryFilter === 'alle' || p.category === categoryFilter
  )

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyPrompt = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Forskning</h1>
        <p className="text-sm text-stone-400 mt-1">
          Deep research-prompter for systematisk kunnskapsinnhenting ({researchPrompts.length} prompts)
        </p>
      </div>

      <FilterChips items={categoryFilters} defaultValue="alle" onChange={setCategoryFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Ingen prompts i denne kategorien" />
      ) : (
        <div className="space-y-3">
          {filtered.map(prompt => {
            const isExpanded = expandedIds.has(prompt.id)
            const isCopied = copiedId === prompt.id
            const cat = categoryLabels[prompt.category]

            return (
              <Card key={prompt.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-center gap-3"
                  onClick={() => toggleExpand(prompt.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-800 truncate">
                      {prompt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-stone-50 text-stone-500 border-stone-200">
                      {cat?.label ?? prompt.category}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${MODEL_COLORS[prompt.model] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}>
                      {MODEL_LABELS[prompt.model] ?? prompt.model}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      prompt.language === 'no'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-sky-50 text-sky-600'
                    }`}>
                      {prompt.language === 'no' ? 'NO' : 'EN'}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3">
                      <pre className="font-mono bg-stone-50 p-4 rounded-lg text-xs text-stone-700 whitespace-pre-wrap leading-relaxed">
                        {prompt.prompt}
                      </pre>
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-4">
                      <div className="text-xs text-stone-400">
                        <span className="font-medium text-stone-500">Forventet output:</span>{' '}
                        {prompt.expectedOutput}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyPrompt(prompt.id, prompt.prompt)
                        }}
                        className={`shrink-0 text-xs px-3 py-1.5 rounded-md transition-colors ${
                          isCopied
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {isCopied ? 'Kopiert!' : 'Kopier prompt'}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
