import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type TranscriptManifestEntry = {
  video_id?: unknown
  status?: unknown
  segment_count?: unknown
  txt_file?: unknown
}

export type ManagedTranscriptIdentityInput = {
  manifest: readonly TranscriptManifestEntry[]
  localAsrManifest: readonly TranscriptManifestEntry[]
  transcriptFileExists: (relativePath: string) => boolean
  localAsrFileExists: (relativePath: string) => boolean
}

function usable(entry: TranscriptManifestEntry) {
  return entry.status === 'ok' &&
    typeof entry.video_id === 'string' && entry.video_id.length > 0 &&
    typeof entry.txt_file === 'string' && entry.txt_file.length > 0 &&
    typeof entry.segment_count === 'number' && entry.segment_count > 0
}

export function buildManagedTranscriptSourceDocIds(
  input: ManagedTranscriptIdentityInput,
): string[] {
  const localByVideoId = new Map(
    input.localAsrManifest
      .filter(usable)
      .map(entry => [String(entry.video_id), entry] as const),
  )
  const ids = new Set<string>()

  for (const entry of input.manifest) {
    const videoId = typeof entry.video_id === 'string' ? entry.video_id : null
    if (!videoId) continue

    const mainAvailable = usable(entry) &&
      input.transcriptFileExists(String(entry.txt_file))
    const local = localByVideoId.get(videoId)
    const localAvailable = Boolean(
      !mainAvailable && local && input.localAsrFileExists(String(local.txt_file)),
    )
    if (!mainAvailable && !localAvailable) continue

    const id = `src-yt-${videoId}`
    if (ids.has(id)) {
      throw new Error(`Transcript identity contract contains duplicate SourceDoc id: ${id}`)
    }
    ids.add(id)
  }

  return [...ids].sort()
}

function parseManifest(path: string): TranscriptManifestEntry[] {
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  if (!Array.isArray(parsed)) throw new Error(`Transcript manifest is not an array: ${path}`)
  return parsed as TranscriptManifestEntry[]
}

export function loadManagedTranscriptSourceDocIds(projectRoot = process.cwd()): string[] {
  const transcriptDirectory = join(projectRoot, 'research/landbrukarena_transcripts')
  const localAsrDirectory = join(transcriptDirectory, 'local_asr_missing')
  const manifestPath = join(transcriptDirectory, 'manifest.json')
  const localAsrManifestPath = join(localAsrDirectory, 'local_asr_manifest.json')

  if (!existsSync(manifestPath)) return []
  return buildManagedTranscriptSourceDocIds({
    manifest: parseManifest(manifestPath),
    localAsrManifest: existsSync(localAsrManifestPath)
      ? parseManifest(localAsrManifestPath)
      : [],
    transcriptFileExists: relativePath => existsSync(join(transcriptDirectory, relativePath)),
    localAsrFileExists: relativePath => existsSync(join(localAsrDirectory, relativePath)),
  })
}
