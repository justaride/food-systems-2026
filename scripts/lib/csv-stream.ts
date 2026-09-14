import { createReadStream } from 'fs'

const QUOTE = 34
const LF = 10
const CR = 13

/**
 * Stream CSV records from a file without loading it: quoted fields may hold the
 * delimiter, doubled quotes and line breaks, including across read chunks.
 * Brreg's entity file is ~800 MB with free-text columns, so a line reader is not enough.
 */
export async function* readCsvRecords(
  path: string,
  { delimiter = ',', highWaterMark = 1 << 20 }: { delimiter?: string; highWaterMark?: number } = {}
): AsyncGenerator<Record<string, string>> {
  const delim = delimiter.charCodeAt(0)
  let header: string[] | null = null
  let record: string[] = []
  let field = ''
  let quoted = false
  let pendingQuote = false
  let firstChunk = true

  const toObject = (values: string[]) => {
    const keys = header!
    const out: Record<string, string> = {}
    for (let k = 0; k < keys.length; k++) out[keys[k]] = values[k] ?? ''
    return out
  }

  for await (const chunk of createReadStream(path, { encoding: 'utf8', highWaterMark })) {
    let text = chunk as string
    if (firstChunk) {
      text = text.replace(/^﻿/, '')
      firstChunk = false
    }
    const completed: string[][] = []
    const n = text.length
    let i = 0

    while (i < n) {
      if (quoted) {
        if (pendingQuote) {
          pendingQuote = false
          if (text.charCodeAt(i) === QUOTE) {
            field += '"'
            i++
          } else {
            quoted = false
          }
          continue
        }
        const q = text.indexOf('"', i)
        if (q === -1) {
          field += text.slice(i)
          break
        }
        field += text.slice(i, q)
        pendingQuote = true
        i = q + 1
        continue
      }

      let j = i
      while (j < n) {
        const c = text.charCodeAt(j)
        if (c === delim || c === LF || c === CR || c === QUOTE) break
        j++
      }
      field += text.slice(i, j)
      if (j === n) break

      const c = text.charCodeAt(j)
      if (c === QUOTE) {
        quoted = true
      } else if (c === delim) {
        record.push(field)
        field = ''
      } else if (c === LF) {
        record.push(field)
        field = ''
        completed.push(record)
        record = []
      }
      i = j + 1
    }

    for (const values of completed) {
      if (!header) header = values.map(v => v.trim())
      else if (values.some(v => v !== '')) yield toObject(values)
    }
  }

  if (field !== '' || record.length > 0) {
    record.push(field)
    if (!header) return
    if (record.some(v => v !== '')) yield toObject(record)
  }
}
