import { lstatSync, readFileSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'

import { verifyEstateBackupReceipt } from './lib/estate-backup-receipt'

const EXPECTED_ARGUMENTS = ['receipt', 'asset-key', 'database-uuid', 'max-age-hours'] as const

function parseArguments(argv: string[]): Record<(typeof EXPECTED_ARGUMENTS)[number], string> {
  const values = new Map<string, string>()
  for (const argument of argv) {
    const match = /^--([a-z-]+)=(.+)$/u.exec(argument)
    if (!match || !EXPECTED_ARGUMENTS.includes(match[1] as (typeof EXPECTED_ARGUMENTS)[number])) {
      throw new Error(`Unsupported argument: ${argument}`)
    }
    if (values.has(match[1])) {
      throw new Error(`Duplicate argument: --${match[1]}`)
    }
    values.set(match[1], match[2])
  }

  for (const name of EXPECTED_ARGUMENTS) {
    if (!values.has(name)) {
      throw new Error(`Missing required argument: --${name}`)
    }
  }

  return Object.fromEntries(values) as Record<(typeof EXPECTED_ARGUMENTS)[number], string>
}

function main(): void {
  const args = parseArguments(process.argv.slice(2))
  const receiptPath = resolve(process.cwd(), args.receipt)
  const pathFromRepository = relative(process.cwd(), receiptPath)
  if (pathFromRepository.startsWith('..') || isAbsolute(pathFromRepository)) {
    throw new Error('Receipt path must stay inside the checked-out repository')
  }
  const receiptStat = lstatSync(receiptPath)
  if (!receiptStat.isFile() || receiptStat.isSymbolicLink()) {
    throw new Error('Receipt path must be a regular, non-symlink file')
  }

  const receipt = JSON.parse(readFileSync(receiptPath, 'utf8')) as unknown
  const verified = verifyEstateBackupReceipt(receipt, {
    expectedAssetKey: args['asset-key'],
    expectedDatabaseUuid: args['database-uuid'],
    maxAgeHours: Number(args['max-age-hours']),
    now: new Date(),
  })

  console.log(
    `Estate backup receipt PASS: artifact=${verified.artifactRef} sha256=${verified.artifactSha256} ` +
      `sourceCommit=${verified.sourceCommit} oldestProofAge=${verified.oldestProofAgeHours.toFixed(2)}h`,
  )
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Estate backup receipt FAIL: ${message}`)
  process.exitCode = 1
}
