import fs from 'node:fs'
import path from 'node:path'
import { buildWhitepaperProjection, WHITEPAPER_SOURCE_PATH } from '../src/lib/hvitbok/projection'

const outputPath = 'src/lib/hvitbok/generated/whitepaper-chapters.json'
const root = process.cwd()
const source = fs.readFileSync(path.join(root, WHITEPAPER_SOURCE_PATH), 'utf8')
const projection = buildWhitepaperProjection(source)
const rendered = `${JSON.stringify(projection, null, 2)}\n`

if (process.argv.includes('--check')) {
  const current = fs.existsSync(path.join(root, outputPath)) ? fs.readFileSync(path.join(root, outputPath), 'utf8') : ''
  if (current !== rendered) {
    console.error(`Utdatert hvitbokprojeksjon: kjør npx tsx ${process.argv[1]}`)
    process.exitCode = 1
  }
} else {
  fs.mkdirSync(path.dirname(path.join(root, outputPath)), { recursive: true })
  fs.writeFileSync(path.join(root, outputPath), rendered)
  console.log(`Genererte ${projection.chapters.length} deler fra ${projection.sourceHash}`)
}
