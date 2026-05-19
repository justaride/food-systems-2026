import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { validateDownloadBacklogCsv } from '../src/lib/download-backlog-validation'

const backlogDir = join(process.cwd(), 'research', 'evidence-pack')
const files = readdirSync(backlogDir)
  .filter(file => file.startsWith('download-backlog') && file.endsWith('.csv'))
  .sort()

let errorCount = 0
let warningCount = 0
let rowsChecked = 0

for (const file of files) {
  const filePath = join('research', 'evidence-pack', file)
  const text = readFileSync(filePath, 'utf8')
  const result = validateDownloadBacklogCsv(text, filePath)
  rowsChecked += result.rowsChecked

  for (const issue of result.issues) {
    const marker = issue.severity === 'error' ? 'ERROR' : 'WARN'
    console.log(`${marker} ${issue.filePath}:${issue.line} ${issue.message}`)
    if (issue.severity === 'error') errorCount += 1
    else warningCount += 1
  }
}

console.log(
  `Checked ${files.length} download-backlog CSV files, ${rowsChecked} rows: ${errorCount} errors, ${warningCount} warnings`,
)

if (errorCount > 0) process.exitCode = 1
