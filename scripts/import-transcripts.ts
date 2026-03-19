import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as fs from 'fs'
import * as path from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const PROJECT_ROOT = path.resolve(__dirname, '..')
const TRANSCRIPTS_DIR = path.join(PROJECT_ROOT, 'research/landbrukarena_transcripts')
const LOCAL_ASR_DIR = path.join(TRANSCRIPTS_DIR, 'local_asr_missing')

type ManifestEntry = {
  index: number
  video_id: string
  title: string
  url: string
  status: 'ok' | 'error'
  language_code: string | null
  language: string | null
  is_generated: boolean | null
  is_translatable: boolean | null
  segment_count: number
  txt_file: string
  json_file: string
  error: string | null
}

type LocalAsrEntry = {
  index: number
  video_id: string
  title: string
  url: string
  status: 'ok' | 'error'
  model: string
  language: string
  segment_count: number
  txt_file: string
  json_file: string
  error: string | null
  language_probability?: number
}

type TranscriptRecord = {
  videoId: string
  title: string
  channel: string
  txtFile: string
  txtDir: string
  url: string
  language: string | null
  isLocalAsr: boolean
  asrModel?: string
  segmentCount: number
}

function deriveSlug(txtFile: string): string {
  return txtFile
    .replace(/\.txt$/, '')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function extractSummary(content: string, maxWords = 200): string | null {
  const lines = content.split('\n').filter(l => l.trim())
  const words: string[] = []

  for (const line of lines) {
    const cleaned = line.replace(/^\[\d{2}:\d{2}\.\d{3}\]\s*/, '').trim()
    if (!cleaned || cleaned === '[Music]') continue
    words.push(...cleaned.split(/\s+/))
    if (words.length >= maxWords) break
  }

  if (words.length === 0) return null
  return words.slice(0, maxWords).join(' ')
}

function normalizeChannelTag(channel: string): string {
  return channel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

async function main() {
  console.log('Importing transcript corpus...\n')

  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(path.join(TRANSCRIPTS_DIR, 'manifest.json'), 'utf-8')
  )

  let localAsrManifest: LocalAsrEntry[] = []
  const localAsrPath = path.join(LOCAL_ASR_DIR, 'local_asr_manifest.json')
  if (fs.existsSync(localAsrPath)) {
    localAsrManifest = JSON.parse(fs.readFileSync(localAsrPath, 'utf-8'))
  }

  const localAsrByVideoId = new Map(
    localAsrManifest
      .filter(e => e.status === 'ok' && e.segment_count > 0)
      .map(e => [e.video_id, e])
  )

  const CHANNEL = 'Landbruk Arena'
  const records: TranscriptRecord[] = []

  for (const entry of manifest) {
    if (entry.status === 'ok' && entry.segment_count > 0) {
      const txtPath = path.join(TRANSCRIPTS_DIR, entry.txt_file)
      if (fs.existsSync(txtPath)) {
        records.push({
          videoId: entry.video_id,
          title: entry.title,
          channel: CHANNEL,
          txtFile: entry.txt_file,
          txtDir: TRANSCRIPTS_DIR,
          url: entry.url,
          language: entry.language_code,
          isLocalAsr: false,
          segmentCount: entry.segment_count,
        })
        continue
      }
    }

    const localAsr = localAsrByVideoId.get(entry.video_id)
    if (localAsr) {
      const txtPath = path.join(LOCAL_ASR_DIR, localAsr.txt_file)
      if (fs.existsSync(txtPath)) {
        records.push({
          videoId: entry.video_id,
          title: entry.title,
          channel: CHANNEL,
          txtFile: localAsr.txt_file,
          txtDir: LOCAL_ASR_DIR,
          url: entry.url,
          language: localAsr.language,
          isLocalAsr: true,
          asrModel: localAsr.model,
          segmentCount: localAsr.segment_count,
        })
      }
    }
  }

  console.log(`Found ${records.length} transcripts to import (${records.filter(r => r.isLocalAsr).length} from local ASR)\n`)

  let imported = 0
  let errors = 0

  for (const rec of records) {
    const txtPath = path.join(rec.txtDir, rec.txtFile)
    const content = fs.readFileSync(txtPath, 'utf-8')

    if (!content.trim()) {
      console.log(`  Skipping ${rec.txtFile} (empty)`)
      continue
    }

    const slug = deriveSlug(rec.txtFile)
    const relPath = rec.isLocalAsr
      ? `landbrukarena_transcripts/local_asr_missing/${rec.txtFile}`
      : `landbrukarena_transcripts/${rec.txtFile}`
    const wordCount = content.split(/\s+/).filter(Boolean).length
    const summary = extractSummary(content)
    const channelTag = normalizeChannelTag(rec.channel)
    const sourceDocId = `src-yt-${rec.videoId}`

    try {
      const doc = await prisma.document.upsert({
        where: { filePath: relPath },
        update: {
          slug,
          title: rec.title,
          author: rec.channel,
          year: null,
          documentType: 'transcript',
          category: 'landbrukarena-transcripts',
          subcategory: null,
          country: 'no',
          content,
          summary,
          url: rec.url,
          wordCount,
          tags: ['transcript', 'landbruk', 'youtube', channelTag],
          metadata: {
            canonicalFileType: 'txt',
            availabilityStatus: 'fulltext',
            videoId: rec.videoId,
            channel: rec.channel,
            language: rec.language,
            segmentCount: rec.segmentCount,
            isLocalAsr: rec.isLocalAsr,
            asrModel: rec.asrModel ?? null,
            sourceScript: 'import-transcripts.ts',
          },
        },
        create: {
          slug,
          filePath: relPath,
          title: rec.title,
          author: rec.channel,
          year: null,
          documentType: 'transcript',
          category: 'landbrukarena-transcripts',
          subcategory: null,
          country: 'no',
          content,
          summary,
          url: rec.url,
          wordCount,
          tags: ['transcript', 'landbruk', 'youtube', channelTag],
          metadata: {
            canonicalFileType: 'txt',
            availabilityStatus: 'fulltext',
            videoId: rec.videoId,
            channel: rec.channel,
            language: rec.language,
            segmentCount: rec.segmentCount,
            isLocalAsr: rec.isLocalAsr,
            asrModel: rec.asrModel ?? null,
            sourceScript: 'import-transcripts.ts',
          },
        },
      })

      await prisma.sourceDoc.upsert({
        where: { id: sourceDocId },
        update: {
          filename: rec.txtFile,
          title: rec.title,
          author: rec.channel,
          sourceType: 'transkripsjon',
          description: `YouTube video transcript from ${rec.channel}: ${rec.title}`,
          relevance: 'Primary source - video transcript of Norwegian agricultural content',
          url: rec.url,
          documentId: doc.id,
        },
        create: {
          id: sourceDocId,
          filename: rec.txtFile,
          title: rec.title,
          author: rec.channel,
          sourceType: 'transkripsjon',
          description: `YouTube video transcript from ${rec.channel}: ${rec.title}`,
          relevance: 'Primary source - video transcript of Norwegian agricultural content',
          url: rec.url,
          documentId: doc.id,
        },
      })

      console.log(`  [OK] ${rec.txtFile}${rec.isLocalAsr ? ' (local ASR)' : ''}`)
      imported++
    } catch (err) {
      console.error(`  [FAIL] ${rec.txtFile}:`, err)
      errors++
    }
  }

  console.log(`\nDone: ${imported} transcripts imported, ${errors} errors`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
