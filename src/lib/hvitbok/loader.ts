import fs from 'node:fs'
import path from 'node:path'

// turbopackIgnore: the chapter path is resolved at runtime, not build time.
// The Dockerfile copies content/ into the image explicitly, so the file
// tracer must not try to bundle it (which traced the whole project).
export function readChapterMarkdown(filePath: string): string {
  return fs.readFileSync(
    path.join(/* turbopackIgnore: true */ process.cwd(), filePath),
    'utf-8',
  )
}

export function countChapterWords(filePath: string): number {
  const text = readChapterMarkdown(filePath)
  return text.split(/\s+/).filter(Boolean).length
}
