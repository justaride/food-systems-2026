import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  createField08ArchiveRightsValidationContext,
  validateField08ArchiveRightsReceiptLog,
  type Field08ArchiveRightsReceipt,
} from '../../src/lib/field08-archive-rights-receipt'

export const FIELD08_ARCHIVE_RIGHTS_SCHEMA_PATH =
  'knowledge/schema/field08-archive-rights-receipt.schema.v1.json'
export const FIELD08_EXTERNAL_CAPTURE_MANIFEST_PATH =
  'research/evidence-pack/field08-gate2c-2026-07-28/external-captures.v1.json'
export const FIELD08_EVIDENCE_GENERATION_MANIFEST_PATH =
  'knowledge/pilots/field08/gate2c/field08-evidence-generation-manifest.v1.json'

export type Field08ArchiveRightsCliOptions = {
  receiptsPath: string
  captureManifestPath: string
  generationManifestPath: string
  previousLogPath: string | null
}

function argumentValue(args: readonly string[], name: string): string | null {
  const inline = args.find(argument => argument.startsWith(`${name}=`))
  if (inline) return inline.slice(name.length + 1)
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] ?? null : null
}

export function parseField08ArchiveRightsCliArgs(
  args: readonly string[],
): Field08ArchiveRightsCliOptions {
  const receiptsPath = argumentValue(args, '--receipts')
  if (!receiptsPath) {
    throw new Error(
      'Usage: tsx scripts/knowledge/validate-field08-archive-rights-receipts.ts '
      + '--receipts <append-only.jsonl> [--previous-log <prior.jsonl>] '
      + '[--capture-manifest <manifest.json>] [--generation-manifest <manifest.json>]',
    )
  }
  return {
    receiptsPath,
    captureManifestPath: argumentValue(args, '--capture-manifest')
      ?? FIELD08_EXTERNAL_CAPTURE_MANIFEST_PATH,
    generationManifestPath: argumentValue(args, '--generation-manifest')
      ?? FIELD08_EVIDENCE_GENERATION_MANIFEST_PATH,
    previousLogPath: argumentValue(args, '--previous-log'),
  }
}

export function parseField08ArchiveRightsJsonl(
  source: string,
  label = 'archive/rights receipt log',
): unknown[] {
  const entries: unknown[] = []
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    if (!line.trim()) continue
    try {
      entries.push(JSON.parse(line))
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`${label} line ${index + 1} is not valid JSON: ${detail}`)
    }
  }
  if (entries.length === 0) throw new Error(`${label} contains no receipts`)
  return entries
}

function parseJson(source: string, label: string): unknown {
  try {
    return JSON.parse(source)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(`${label} is not valid JSON: ${detail}`)
  }
}

function sourceCommitFromGenerationManifest(value: unknown): string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Field 08 evidence generation manifest must be an object')
  }
  const sourceCommit = (value as Record<string, unknown>).sourceCommit
  if (typeof sourceCommit !== 'string' || !/^[a-f0-9]{40}$/.test(sourceCommit)) {
    throw new Error('Field 08 evidence generation manifest has no exact 40-character sourceCommit')
  }
  return sourceCommit
}

export function runField08ArchiveRightsReceiptValidation(
  root = process.cwd(),
  args = process.argv.slice(2),
): Field08ArchiveRightsReceipt[] {
  const options = parseField08ArchiveRightsCliArgs(args)
  const captureManifestBytes = readFileSync(resolve(root, options.captureManifestPath))
  const captureManifest = parseJson(
    captureManifestBytes.toString('utf8'),
    options.captureManifestPath,
  )
  const generationManifest = parseJson(
    readFileSync(resolve(root, options.generationManifestPath), 'utf8'),
    options.generationManifestPath,
  )
  const context = createField08ArchiveRightsValidationContext({
    captureManifest,
    captureManifestBytes,
    expectedSourceCommit: sourceCommitFromGenerationManifest(generationManifest),
  })
  const values = parseField08ArchiveRightsJsonl(
    readFileSync(resolve(root, options.receiptsPath), 'utf8'),
    options.receiptsPath,
  )
  const previousValues = options.previousLogPath
    ? parseField08ArchiveRightsJsonl(
      readFileSync(resolve(root, options.previousLogPath), 'utf8'),
      options.previousLogPath,
    )
    : undefined
  const receipts = validateField08ArchiveRightsReceiptLog(values, context, { previousValues })
  process.stdout.write(
    `Validated ${receipts.length} append-only Field 08 archive/rights receipt(s); `
      + 'archive access remains private and no evidence-readiness promotion was granted.\n',
  )
  return receipts
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runField08ArchiveRightsReceiptValidation()
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    process.stderr.write(`${detail}\n`)
    process.exitCode = 1
  }
}
