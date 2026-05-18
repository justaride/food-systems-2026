import { readFileSync } from 'node:fs'
import {
  buildCitationApplicationPreflight,
  formatCitationApplicationPreflightReport,
  parseCitationApplicationPacketCsv,
} from './lib/citation-application-packet'

const DEFAULT_PACKET = 'research/citation-application-packet-2026-05-18.csv'

type CliOptions = {
  packet: string
  approvedActionIds: Set<string>
  json: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    packet: DEFAULT_PACKET,
    approvedActionIds: new Set(),
    json: false,
  }

  for (const arg of argv) {
    if (arg === '--json') {
      options.json = true
      continue
    }
    if (arg.startsWith('--packet=')) {
      options.packet = arg.slice('--packet='.length)
      continue
    }
    if (arg.startsWith('--approve-action=')) {
      for (const value of arg.slice('--approve-action='.length).split(',')) {
        const actionId = value.trim()
        if (actionId) options.approvedActionIds.add(actionId)
      }
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const rows = parseCitationApplicationPacketCsv(readFileSync(options.packet, 'utf8'))
  const preflight = buildCitationApplicationPreflight(rows, {
    approvedActionIds: options.approvedActionIds,
  })

  if (options.json) {
    console.log(JSON.stringify(preflight, null, 2))
  } else {
    process.stdout.write(formatCitationApplicationPreflightReport(preflight))
  }

  if (preflight.validationIssues.length > 0 || preflight.hasUnsafeApproval) {
    process.exitCode = 1
  }
}

main()
