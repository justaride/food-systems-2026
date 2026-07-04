import path from 'node:path'

import { buildNotebookLmExport } from '../src/lib/notebooklm-export'

function argValue(name: string, fallback: string) {
  const prefix = `--${name}=`
  const found = process.argv.find((arg) => arg.startsWith(prefix))
  return found ? found.slice(prefix.length) : fallback
}

async function main() {
  const sourceRoot = path.resolve(argValue('source-root', process.cwd()))
  const outputRoot = path.resolve(argValue('output-root', path.join(process.cwd(), 'exports', 'notebooklm')))
  const date = argValue('date', new Date().toISOString().slice(0, 10))

  const result = await buildNotebookLmExport({ sourceRoot, outputRoot, date })

  console.log(`NotebookLM export written to ${result.exportDir}`)
  console.log(`Markdown source files: ${result.files.length}`)
  for (const file of result.files) {
    console.log(`${file.filename}\t${file.wordCount} words\t${file.packetType}\t${file.status}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
