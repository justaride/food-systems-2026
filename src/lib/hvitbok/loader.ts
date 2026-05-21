import fs from 'node:fs'
import path from 'node:path'

const PROJECT_ROOT = process.cwd()

export function readChapterMarkdown(filePath: string): string {
  return fs.readFileSync(path.join(PROJECT_ROOT, filePath), 'utf-8')
}

export function countChapterWords(filePath: string): number {
  const text = readChapterMarkdown(filePath)
  return text.split(/\s+/).filter(Boolean).length
}
