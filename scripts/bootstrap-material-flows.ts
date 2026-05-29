// scripts/bootstrap-material-flows.ts
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { parseLoopFlow, type RawLoop } from '../src/lib/flows/parse'
import type { LoopFlows, MaterialFlowsFile } from '../src/lib/flows/types'

const ROOT = process.cwd()
const LOOPS_PATH = join(ROOT, 'public/data/food-systems/circularity-loops.json')
const OUT_PATH = join(ROOT, 'public/data/food-systems/material-flows.json')

function main() {
  const loopsFile = JSON.parse(readFileSync(LOOPS_PATH, 'utf8')) as { existing_loops: RawLoop[] }
  const loops = loopsFile.existing_loops ?? []

  let existing: MaterialFlowsFile = { generated: '', description: '', loops: [] }
  if (existsSync(OUT_PATH)) {
    existing = JSON.parse(readFileSync(OUT_PATH, 'utf8')) as MaterialFlowsFile
  }
  const curatedById = new Map<string, LoopFlows>(existing.loops.map((l) => [l.loopId, l]))

  let added = 0
  const out: LoopFlows[] = []
  for (const loop of loops) {
    if (curatedById.has(loop.id)) {
      out.push(curatedById.get(loop.id)!)
    } else {
      out.push(parseLoopFlow(loop))
      added += 1
    }
  }

  const result: MaterialFlowsFile = {
    generated: existing.generated || '2026-05-29',
    description:
      'Strukturerte materialstrømmer per sirkulær-loop (nøklet på loopId mot circularity-loops.json). Bootstrap-skjeletter er illustrative; kuratering løfter evidens + tall.',
    loops: out,
  }
  writeFileSync(OUT_PATH, JSON.stringify(result, null, 2))
  console.log(`material-flows.json: ${out.length} loops total, ${added} new skeletons added, ${out.length - added} curated preserved`)
}

main()
