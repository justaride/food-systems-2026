import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('visible UI diacritics', () => {
  const files = [
    'src/app/bibliotek/BibliotekContent.tsx',
    'src/app/media/page.tsx',
    'src/app/forskningsrunder/ForskningsrunderContent.tsx',
    'src/app/personer/PersonerContent.tsx',
    'src/app/politikk/PolitikkContent.tsx',
    'src/app/sammenligning/SammenligningContent.tsx',
    'src/app/sirkularitet/SirkularitetContent.tsx',
    'src/app/metodikk/prompts/PromptsContent.tsx',
    'src/app/masteroppgaver/MasteroppgaverContent.tsx',
    'src/app/forsyningskjede/ForsyningskjedeContent.tsx',
    'src/app/verdikjede/VerdikjedeContent.tsx',
    'src/app/okonomi/OkonomiContent.tsx',
    'src/app/aktorer/AktorerContent.tsx',
    'src/components/charts/R9KpiCatalog.tsx',
    'src/components/charts/RLadderMatrix.tsx',
    'src/components/charts/RLadderMaturityOverview.tsx',
    'src/components/charts/NutrientFlowsView.tsx',
    'src/lib/data/applications.ts',
    'src/lib/data/media-landscape.ts',
    'src/lib/data/meetings.ts',
    'src/lib/data/ten-step-start.ts',
    'src/lib/data/verdikjede.ts',
    'src/lib/data/circularity-questions.ts',
    'src/lib/data/r-ladder.ts',
    'src/components/ui/StatusBadge.tsx',
  ]

  const strippedVisiblePatterns = [
    /\bSok i\b/,
    /\bSok etter\b/,
    /\bSok KPI\b/,
    />\s*Sok\s*</,
    /\bKjernespaersmaal\b/,
    /\bpa tvers\b/,
    /\bfordelt pa\b/,
    /\bHvorfor na\b/,
    /\bna ogsaa\b/,
    /\bgar igjen\b/,
    /\bStoerst\b/,
    /\bAar uten\b/,
    /\bprimaerkilder\b/,
    /\bprimaerkoding\b/,
    /\bprimaerdata\b/,
    /\bprimaerkilden\b/,
    /\bprimaersjekk\b/,
    /\bprimaerstatistikk\b/,
    /\bprimaerproduksjon\b/,
    /\boppnaa\b/,
    /\bmaales\b/,
    /\bmaling\b/,
    /\bformaal\b/,
    /\bfor a\b/,
    /\bforstaaelse\b/,
    /\bAktoerer\b/,
    /\baktoerer\b/,
    /\bnokkelpeople\b/,
    /\bleverandoer/,
    /\btilfoert\b/,
    /\bogsaa\b/,
    /\bKjor\b/,
    /\bKjoer\b/,
    /\bmaa\b/,
    /\bfoer\b/,
    /\bkildesoek\b/,
    /\bfor aa\b/,
    /\bStrom\b/,
    /\bstrommer\b/,
    /\butloesende\b/,
    /\boverforer\b/,
    /\bLineaert\b/,
    /\bravare\b/,
    /\bravarer\b/,
    /\bgjodsel\b/,
    /\bSirkulaer\b/,
    /\binnkjop\b/,
    /\bbeslutningsstotte\b/,
    /\bstotte\b/,
    /\bbor\b/,
    /\bspormal\b/,
    /\bAktorcaser\b/,
    /\bNaeringsflyt\b/,
    /\bsa fa\b/,
    /\b10-arig\b/,
    /\bapnet\b/,
    /\bmotet\b/,
    /\bsirkulaeranalysen\b/,
    /\bsirkulaer\b/,
    /\bR-niva\b/,
    /\bPrimaerproduksjon\b/,
    /\bprimaerleddet\b/,
    /\bhoeyest\b/,
    /\bnoekkelselskaper\b/,
    /label: 'Pagaende'/,
    /label: 'Pagar'/,
    /label: 'Fullfort'/,
    /label: 'Hoy'/,
    /label: 'Soknad'/,
  ]

  for (const file of files) {
    it(`${file} has no known stripped visible Norwegian tokens`, () => {
      const text = readFileSync(file, 'utf8')
        .split('\n')
        .filter((line) => {
          const trimmed = line.trim()
          return !(
            trimmed.startsWith('id:') ||
            trimmed.startsWith('tags:') ||
            trimmed.startsWith('tagFilters:') ||
            trimmed.startsWith('themeTags:') ||
            trimmed.startsWith('|') ||
            /^'[^']+': \{$/.test(trimmed)
          )
        })
        .map(line => line.replace(/^\s*['\w-]+:\s*/, ''))
        .join('\n')
      for (const pattern of strippedVisiblePatterns) {
        assert.ok(!pattern.test(text), `${file} still contains ${pattern}`)
      }
    })
  }
})
