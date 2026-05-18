#!/usr/bin/env tsx
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { circularLeverages } from '../src/lib/data/circular-leverage'
import { circularityQuestions } from '../src/lib/data/circularity-questions'

type LoopJson = {
  existing_loops: { id: string }[]
  gaps: { id: string }[]
  actor_cases: {
    success: { name: string }[]
    failure: { name: string }[]
  }
  additional_success: { name: string }[]
  additional_failure: { name: string }[]
}

const root = resolve(__dirname, '..')
const loopsPath = resolve(root, 'public/data/food-systems/circularity-loops.json')
const loops: LoopJson = JSON.parse(readFileSync(loopsPath, 'utf-8'))

const validLoopIds = new Set(loops.existing_loops.map((l) => l.id))
const validGapIds = new Set(loops.gaps.map((g) => g.id))
const validQuestionIds = new Set(circularityQuestions.map((q) => q.id))
const validActorNames = new Set([
  ...loops.actor_cases.success.map((a) => a.name),
  ...loops.actor_cases.failure.map((a) => a.name),
  ...loops.additional_success.map((a) => a.name),
  ...loops.additional_failure.map((a) => a.name),
])

const errors: string[] = []
const seenRanks = new Set<number>()
const seenIds = new Set<string>()

for (const lev of circularLeverages) {
  if (seenRanks.has(lev.rank)) {
    errors.push(`Duplikat rank: ${lev.rank} på id=${lev.id}`)
  }
  seenRanks.add(lev.rank)

  if (seenIds.has(lev.id)) {
    errors.push(`Duplikat id: ${lev.id}`)
  }
  seenIds.add(lev.id)

  if (lev.rank < 1 || lev.rank > 10) {
    errors.push(`Rank ${lev.rank} på ${lev.id} er ute av 1..10`)
  }

  for (const loopId of lev.relatedLoopIds ?? []) {
    if (!validLoopIds.has(loopId)) {
      errors.push(`${lev.id}: relatedLoopId "${loopId}" finnes ikke i circularity-loops.json existing_loops`)
    }
  }

  for (const gapId of lev.relatedGapIds ?? []) {
    if (!validGapIds.has(gapId)) {
      errors.push(`${lev.id}: relatedGapId "${gapId}" finnes ikke i circularity-loops.json gaps`)
    }
  }

  for (const qId of lev.relatedQuestionIds ?? []) {
    if (!validQuestionIds.has(qId)) {
      errors.push(`${lev.id}: relatedQuestionId "${qId}" finnes ikke i circularityQuestions`)
    }
  }

  for (const actorName of lev.relatedActorCases ?? []) {
    if (!validActorNames.has(actorName)) {
      errors.push(`${lev.id}: relatedActorCase "${actorName}" finnes ikke i actor_cases`)
    }
  }
}

if (errors.length > 0) {
  console.error('audit:circular-leverage feilet:')
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}

console.log(`audit:circular-leverage OK · ${circularLeverages.length} entries validert`)
