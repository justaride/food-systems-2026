import { createHash } from 'crypto'
import { createReadStream, createWriteStream, existsSync, mkdirSync, openSync, readSync, closeSync, renameSync, rmSync, statSync } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'

/** Raw register downloads. `tmp/` is gitignored; nothing here is ever committed. */
export const CACHE_DIR = join(__dirname, '..', '..', 'tmp', 'kart-cache')

export type CachedFile = {
  url: string
  path: string
  sha256: string
  bytes: number
  fetchedAt: string
}

export async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256')
  await pipeline(createReadStream(path), hash)
  return hash.digest('hex')
}

function isGzip(path: string): boolean {
  const fd = openSync(path, 'r')
  const header = Buffer.alloc(2)
  readSync(fd, header, 0, 2, 0)
  closeSync(fd)
  return header[0] === 0x1f && header[1] === 0x8b
}

/**
 * Download `url` to `tmp/kart-cache/<fileName>`, reusing a copy younger than
 * `maxAgeHours`. Gzip bodies (Brreg's bulk files) are decompressed on arrival.
 * The SHA-256 is of the stored, decompressed file.
 */
export async function cachedDownload(
  url: string,
  fileName: string,
  { maxAgeHours = 24, headers }: { maxAgeHours?: number; headers?: Record<string, string> } = {}
): Promise<CachedFile> {
  mkdirSync(CACHE_DIR, { recursive: true })
  const path = join(CACHE_DIR, fileName)
  const fresh = existsSync(path) && Date.now() - statSync(path).mtimeMs < maxAgeHours * 3_600_000

  if (!fresh) {
    const res = await fetch(url, { redirect: 'follow', headers })
    if (!res.ok || !res.body) throw new Error(`Nedlasting feilet (${res.status}): ${url}`)
    const partial = `${path}.download`
    await pipeline(Readable.fromWeb(res.body as import('stream/web').ReadableStream), createWriteStream(partial))
    if (isGzip(partial)) {
      await pipeline(createReadStream(partial), createGunzip(), createWriteStream(path))
      rmSync(partial)
    } else {
      renameSync(partial, path)
    }
  }

  const stats = statSync(path)
  return {
    url,
    path,
    sha256: await sha256File(path),
    bytes: stats.size,
    fetchedAt: stats.mtime.toISOString(),
  }
}
