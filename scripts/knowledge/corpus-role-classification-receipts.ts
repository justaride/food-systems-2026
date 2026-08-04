import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const ROLE_QUEUE_PATH = 'knowledge/corpus/corpus-role-classification-queue.v1.jsonl'
export const RECEIPT_SCHEMA_PATH = 'knowledge/schema/corpus-role-classification-receipt.schema.v1.json'
export const RECEIPTS_PATH = 'knowledge/corpus/corpus-role-classification-receipts.v1.jsonl'
export const TEMPLATES_PATH = 'knowledge/corpus/corpus-role-classification-receipt-templates.v1.json'
export const POLICY_VERSION = '2026-08-04'
export const QUEUE_DOCUMENT_TYPE = 'corpus_role_classification_receipt'
export const ROLES = [
  'primary_evidence',
  'internal_synthesis',
  'operational_control',
  'unknown',
  'generated_projection',
] as const

export type CorpusRole = (typeof ROLES)[number]
export type DecisionMaker = 'ai' | 'ai_panel' | 'owner'
export type Confidence = 'high' | 'medium' | 'low'

export type QueueRow = Record<string, unknown> & {
  identityKey: string
  provisionalRole: CorpusRole
}

export type DecisionDetail =
  | { agentId: string }
  | {
      unanimous: true
      votes: Array<{ agentId: string; proposedRole: CorpusRole; reasoning: string }>
    }
  | { owner: string }

export type RoleClassificationReceipt = {
  documentType: typeof QUEUE_DOCUMENT_TYPE
  schemaVersion: '1.0.0'
  receiptId: string
  queuePath: typeof ROLE_QUEUE_PATH
  identityKey: string
  previousRole: CorpusRole
  proposedRole: CorpusRole
  queueRowSha256: string
  decidedBy: DecisionMaker
  decidedByDetail: DecisionDetail
  decidedAt: string
  confidence: Confidence
  reasoning: string
  policyVersion: typeof POLICY_VERSION
  contentHash: string
}

export class RoleReceiptValidationError extends Error {
  constructor(public readonly code: string, message: string) {
    super(`${code}: ${message}`)
  }
}

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }

function fail(code: string, message: string): never {
  throw new RoleReceiptValidationError(code, message)
}

function canonicalize(value: unknown): JsonValue {
  if (value === null || typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return value as null | boolean | number | string
  }
  if (Array.isArray(value)) return (value as unknown[]).map((item) => canonicalize(item))
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>
    return Object.fromEntries(Object.keys(source).sort().map((key) => [key, canonicalize(source[key])]))
  }
  fail('VALUE_INVALID', 'unsupported value in canonical JSON')
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function sha256(value: string | Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

export function withoutContentHash<T extends Record<string, unknown>>(value: T): Omit<T, 'contentHash'> {
  const { contentHash: _contentHash, ...rest } = value
  return rest
}

export function contentHash(value: Record<string, unknown>): string {
  return sha256(canonicalJson(withoutContentHash(value)))
}

export function queueRowSha256(row: QueueRow): string {
  return sha256(canonicalJson(row))
}

function readJsonl(root: string, relativePath: string): QueueRow[] {
  const absolute = resolve(root, relativePath)
  if (!existsSync(absolute)) fail('QUEUE_MISSING', `${relativePath} does not exist`)
  return readFileSync(absolute, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        const row = JSON.parse(line) as QueueRow
        if (!row || typeof row !== 'object' || typeof row.identityKey !== 'string') {
          fail('QUEUE_ROW_INVALID', `${relativePath} line ${index + 1} has no identityKey`)
        }
        if (!ROLES.includes(row.provisionalRole)) {
          fail('QUEUE_ROLE_INVALID', `${row.identityKey} has an invalid provisionalRole`)
        }
        return row
      } catch (error) {
        if (error instanceof RoleReceiptValidationError) throw error
        fail('QUEUE_JSON_INVALID', `${relativePath} line ${index + 1} is not valid JSON`)
      }
    })
}

export function readRoleQueue(root: string, queuePath = ROLE_QUEUE_PATH): QueueRow[] {
  const rows = readJsonl(root, queuePath)
  const seen = new Set<string>()
  for (const row of rows) {
    if (seen.has(row.identityKey)) fail('QUEUE_DUPLICATE_IDENTITY', row.identityKey)
    seen.add(row.identityKey)
  }
  return rows
}

function validateSchema(root: string, receipt: RoleClassificationReceipt): void {
  const schema = JSON.parse(readFileSync(resolve(root, RECEIPT_SCHEMA_PATH), 'utf8'))
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  if (!validate(receipt)) fail('SCHEMA_INVALID', JSON.stringify(validate.errors))
}

function substantive(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length < 20) fail('REASONING_MISSING', `${field} must be substantive`)
}

function validateDecisionDetail(receipt: RoleClassificationReceipt): void {
  if (receipt.decidedBy === 'ai') {
    const detail = receipt.decidedByDetail as { agentId?: unknown }
    if (typeof detail.agentId !== 'string' || detail.agentId.trim().length < 3) fail('DECIDER_INVALID', 'ai requires agentId')
    if (receipt.confidence !== 'high') fail('AI_CONFIDENCE_INVALID', 'ai decisions require high confidence')
    if (receipt.previousRole !== 'primary_evidence' || receipt.proposedRole === 'primary_evidence') {
      fail('ROLE_ASYMMETRY_VIOLATION', 'ai may only move a primary_evidence identity out of primary_evidence')
    }
  }
  if (receipt.decidedBy === 'ai_panel') {
    const detail = receipt.decidedByDetail as { unanimous?: unknown; votes?: unknown }
    if (detail.unanimous !== true || !Array.isArray(detail.votes) || detail.votes.length !== 3) {
      fail('PANEL_NOT_UNANIMOUS', 'ai_panel requires exactly three preserved unanimous votes')
    }
    const votes = detail.votes as Array<{ agentId?: unknown; proposedRole?: unknown; reasoning?: unknown }>
    const ids = new Set(votes.map((vote) => vote.agentId))
    if (ids.size !== 3 || votes.some((vote) => typeof vote.agentId !== 'string')) fail('PANEL_VOTES_INVALID', 'panel agents must be three distinct named votes')
    if (votes.some((vote) => vote.proposedRole !== receipt.proposedRole)) fail('PANEL_DISAGREEMENT', 'panel votes are not unanimous on proposedRole')
    votes.forEach((vote, index) => substantive(vote.reasoning, `decidedByDetail.votes[${index}].reasoning`))
  }
  if (receipt.decidedBy === 'owner') {
    const detail = receipt.decidedByDetail as { owner?: unknown }
    if (typeof detail.owner !== 'string' || detail.owner.trim().length < 2) fail('OWNER_INVALID', 'owner requires a named owner')
  }
}

export function validateRoleReceipt(
  root: string,
  receipt: RoleClassificationReceipt,
  queue = readRoleQueue(root),
  now = new Date(),
): RoleClassificationReceipt {
  validateSchema(root, receipt)
  if (receipt.policyVersion !== POLICY_VERSION) fail('POLICY_VERSION_INVALID', 'receipt policyVersion is not current')
  const row = queue.find((candidate) => candidate.identityKey === receipt.identityKey)
  if (!row) fail('UNKNOWN_IDENTITY', receipt.identityKey)
  if (receipt.previousRole !== row.provisionalRole) fail('PREVIOUS_ROLE_DRIFT', `${receipt.identityKey} queue role changed`)
  if (receipt.queueRowSha256 !== queueRowSha256(row)) fail('QUEUE_ROW_DRIFT', `${receipt.identityKey} queue row hash differs`)
  substantive(receipt.reasoning, 'reasoning')
  if (!Number.isFinite(Date.parse(receipt.decidedAt)) || Date.parse(receipt.decidedAt) > now.getTime()) fail('DECIDED_AT_INVALID', `${receipt.identityKey} decidedAt is invalid or in the future`)
  if (receipt.proposedRole === 'primary_evidence' && receipt.decidedBy === 'ai') fail('ROLE_ASYMMETRY_VIOLATION', 'ai cannot move an identity into primary_evidence')
  validateDecisionDetail(receipt)
  if (receipt.contentHash !== contentHash(receipt)) fail('CONTENT_HASH_INVALID', `${receipt.receiptId} contentHash differs`)
  return receipt
}

export function validateRoleReceiptLog(
  root: string,
  receipts: RoleClassificationReceipt[],
  queue = readRoleQueue(root),
  now = new Date(),
): RoleClassificationReceipt[] {
  const receiptIds = new Set<string>()
  const identityKeys = new Set<string>()
  for (const receipt of receipts) {
    if (receiptIds.has(receipt.receiptId)) fail('DUPLICATE_RECEIPT_ID', receipt.receiptId)
    if (identityKeys.has(receipt.identityKey)) fail('DUPLICATE_IDENTITY_RECEIPT', receipt.identityKey)
    receiptIds.add(receipt.receiptId)
    identityKeys.add(receipt.identityKey)
    validateRoleReceipt(root, receipt, queue, now)
  }
  return receipts
}

export function parseRoleReceiptJsonl(content: string): RoleClassificationReceipt[] {
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0).map((line, index) => {
    try {
      return JSON.parse(line) as RoleClassificationReceipt
    } catch {
      fail('RECEIPT_JSON_INVALID', `receipt line ${index + 1} is invalid JSON`)
    }
  })
}

export function readRoleReceipts(root: string, receiptsPath = RECEIPTS_PATH): RoleClassificationReceipt[] {
  const absolute = resolve(root, receiptsPath)
  return existsSync(absolute) ? parseRoleReceiptJsonl(readFileSync(absolute, 'utf8')) : []
}

export function makeRoleReceipt(input: Omit<RoleClassificationReceipt, 'contentHash'>): RoleClassificationReceipt {
  return { ...input, contentHash: contentHash(input) } as RoleClassificationReceipt
}

export function writeRoleReceiptTemplates(root: string, queue = readRoleQueue(root)): string {
  const payload = {
    documentType: 'corpus_role_classification_receipt_templates',
    schemaVersion: '1.0.0',
    policyVersion: POLICY_VERSION,
    queuePath: ROLE_QUEUE_PATH,
    generatedFor: 'S2-B mechanism only; no decisions or receipts are written',
    rows: queue.map((row) => ({
      identityKey: row.identityKey,
      previousRole: row.provisionalRole,
      queueRowSha256: queueRowSha256(row),
      receiptFieldsRequired: ['proposedRole', 'decidedBy', 'decidedByDetail', 'decidedAt', 'confidence', 'reasoning'],
    })),
  }
  const output = { ...payload, contentHash: contentHash(payload) }
  const relativePath = TEMPLATES_PATH
  mkdirSync(resolve(root, dirname(relativePath)), { recursive: true })
  writeFileSync(resolve(root, relativePath), `${JSON.stringify(output, null, 2)}\n`)
  return relativePath
}

export function checkRoleStatus(root: string, receiptsPath = RECEIPTS_PATH): Record<string, unknown> {
  const queue = readRoleQueue(root)
  const receipts = readRoleReceipts(root, receiptsPath)
  validateRoleReceiptLog(root, receipts, queue)
  const receiptIds = new Set(receipts.map((receipt) => receipt.identityKey))
  const byRole = Object.fromEntries(ROLES.map((role) => [role, queue.filter((row) => row.provisionalRole === role).length]))
  return {
    queuePath: ROLE_QUEUE_PATH,
    receiptsPath,
    policyVersion: POLICY_VERSION,
    queueRows: queue.length,
    receiptCount: receipts.length,
    unresolvedRows: queue.length - receiptIds.size,
    queueRoleCounts: byRole,
    bulkReceiptWriteAllowed: false,
    reason: 'Bulk receipts remain gated by measured calibration and the owner decision/mutation boundary.',
  }
}

function usage(): string {
  return [
    'Usage: tsx scripts/knowledge/corpus-role-classification-receipts.ts <command> [--receipts <path>]',
    'Commands:',
    '  --write-templates   Write hash-bound templates for every queue row; writes no decisions.',
    '  --validate-receipts Validate the append-only receipt JSONL fail-closed.',
    '  --check-status      Read and print queue/receipt status; writes nothing.',
  ].join('\n')
}

function parseArgs(args: string[]): { command: string; receiptsPath: string } {
  let command = ''
  let receiptsPath = RECEIPTS_PATH
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--receipts') {
      const next = args[index + 1]
      if (!next) fail('CLI_INVALID', '--receipts requires a path')
      receiptsPath = next
      index += 1
    } else if (['--write-templates', '--validate-receipts', '--check-status'].includes(arg)) {
      if (command) fail('CLI_INVALID', 'exactly one command is required')
      command = arg
    } else {
      fail('CLI_INVALID', `unknown argument ${arg}`)
    }
  }
  if (!command) fail('CLI_INVALID', usage())
  return { command, receiptsPath }
}

export function runRoleReceiptCli(root: string, args: string[]): void {
  const { command, receiptsPath } = parseArgs(args)
  if (command === '--write-templates') {
    process.stdout.write(`${JSON.stringify({ command, written: [writeRoleReceiptTemplates(root)] }, null, 2)}\n`)
    return
  }
  if (command === '--validate-receipts') {
    const receipts = readRoleReceipts(root, receiptsPath)
    validateRoleReceiptLog(root, receipts)
    process.stdout.write(`${JSON.stringify({ command, receiptsPath, receiptCount: receipts.length }, null, 2)}\n`)
    return
  }
  process.stdout.write(`${JSON.stringify({ command, ...checkRoleStatus(root, receiptsPath) }, null, 2)}\n`)
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : ''
if (invokedPath === import.meta.url) {
  try {
    runRoleReceiptCli(process.cwd(), process.argv.slice(2))
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exitCode = 1
  }
}
