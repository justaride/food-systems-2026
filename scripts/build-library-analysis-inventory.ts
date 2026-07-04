import {
  loadLibraryAnalysisInventory,
  summarizeRows,
  writeLibraryAnalysisArtifacts,
} from './library-analysis-common'

async function main() {
  const json = process.argv.includes('--json')
  const rows = await loadLibraryAnalysisInventory()
  const summary = summarizeRows(rows)
  const paths = writeLibraryAnalysisArtifacts(rows)

  if (json) {
    console.log(JSON.stringify({ summary, paths }, null, 2))
    return
  }

  console.log(`Library inventory sources: ${summary.total}`)
  console.log(`Review queue: ${summary.reviewRequired}`)
  console.log(`Ledger: ${paths.ledgerPath}`)
  console.log(`Summary: ${paths.summaryPath}`)
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
