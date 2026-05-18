import { execFileSync } from 'node:child_process'
import {
  buildResearchArtifactGuardReport,
  formatResearchArtifactGuardReport,
  type TrackedArtifactFile,
} from '../src/lib/research-artifact-guard'

type CliOptions = {
  base: string
  maxBytes: number
  json: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    base: 'origin/main',
    maxBytes: 50 * 1024 * 1024,
    json: false,
  }

  for (const arg of argv) {
    if (arg === '--json') {
      options.json = true
      continue
    }
    if (arg.startsWith('--base=')) {
      options.base = arg.slice('--base='.length)
      continue
    }
    if (arg.startsWith('--max-mb=')) {
      const value = Number(arg.slice('--max-mb='.length))
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('--max-mb must be a positive number')
      }
      options.maxBytes = Math.floor(value * 1024 * 1024)
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function git(args: string[]) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function listAddedPaths(base: string) {
  const output = git(['diff', '--name-status', `${base}...HEAD`])
  return output
    .split('\n')
    .filter(Boolean)
    .flatMap(line => {
      const parts = line.split('\t')
      const status = parts[0] ?? ''
      if (status === 'A') return [parts[1]].filter(Boolean)
      if (status.startsWith('R') && parts[2]) return [parts[2]]
      return []
    })
}

function listTrackedFiles(): TrackedArtifactFile[] {
  const output = git(['ls-tree', '-r', '-l', 'HEAD'])
  return output
    .split('\n')
    .filter(Boolean)
    .flatMap(line => {
      const match = line.match(/^\d+\s+\S+\s+\S+\s+(\d+|-)\t(.+)$/)
      if (!match || match[1] === '-') return []
      return [{
        sizeBytes: Number(match[1]),
        path: match[2],
      }]
    })
}

function main() {
  const options = parseArgs(process.argv.slice(2))
  const report = buildResearchArtifactGuardReport({
    addedPaths: listAddedPaths(options.base),
    trackedFiles: listTrackedFiles(),
    maxBytes: options.maxBytes,
  })

  if (options.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    process.stdout.write(formatResearchArtifactGuardReport(report))
  }

  if (report.violations.length > 0) {
    process.exitCode = 1
  }
}

main()
