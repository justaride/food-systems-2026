import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type UrlResult = {
  url: string
  status: number | string
  source: string
}

async function collectUrls(): Promise<{ url: string; source: string }[]> {
  const seen = new Map<string, string>()

  const theses = await prisma.thesis.findMany({
    where: { url: { not: '' } },
    select: { id: true, url: true },
  })
  for (const t of theses) {
    if (!seen.has(t.url)) seen.set(t.url, `thesis:${t.id}`)
  }

  const reports = await prisma.report.findMany({
    where: { sourceUrl: { not: null } },
    select: { id: true, sourceUrl: true },
  })
  for (const r of reports) {
    if (r.sourceUrl && !seen.has(r.sourceUrl)) seen.set(r.sourceUrl, `report:${r.id}`)
  }

  const sources = await prisma.sourceDoc.findMany({
    where: { url: { not: null }, isDuplicate: false },
    select: { id: true, url: true },
  })
  for (const s of sources) {
    if (s.url && !seen.has(s.url)) seen.set(s.url, `source:${s.id}`)
  }

  const docs = await prisma.document.findMany({
    where: { url: { not: null } },
    select: { slug: true, url: true },
  })
  for (const d of docs) {
    if (d.url && !seen.has(d.url)) seen.set(d.url, `document:${d.slug}`)
  }

  return [...seen.entries()].map(([url, source]) => ({ url, source }))
}

async function checkUrl(url: string): Promise<{ status: number | string }> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'FoodSystems2026-LinkChecker/1.0' },
      redirect: 'manual',
    })
    clearTimeout(timeout)

    if (res.status === 405) {
      const controller2 = new AbortController()
      const timeout2 = setTimeout(() => controller2.abort(), 10000)
      try {
        const res2 = await fetch(url, {
          method: 'GET',
          signal: controller2.signal,
          headers: { 'User-Agent': 'FoodSystems2026-LinkChecker/1.0' },
          redirect: 'manual',
        })
        clearTimeout(timeout2)
        return { status: res2.status }
      } catch (e) {
        clearTimeout(timeout2)
        if ((e as Error).name === 'AbortError') return { status: 'timeout' }
        return { status: `error: ${(e as Error).message}` }
      }
    }

    return { status: res.status }
  } catch (e) {
    clearTimeout(timeout)
    if ((e as Error).name === 'AbortError') return { status: 'timeout' }
    return { status: `error: ${(e as Error).message}` }
  }
}

async function main() {
  console.log('URL Health Check — Food Systems 2026\n')

  const urls = await collectUrls()
  console.log(`Found ${urls.length} unique URLs to check\n`)

  const results: UrlResult[] = []

  for (let i = 0; i < urls.length; i++) {
    const { url, source } = urls[i]
    const { status } = await checkUrl(url)
    results.push({ url, status, source })
    if ((i + 1) % 10 === 0) {
      console.log(`  Checked ${i + 1}/${urls.length}...`)
    }
  }

  const ok = results.filter(r => r.status === 200)
  const redirects = results.filter(r => typeof r.status === 'number' && r.status >= 300 && r.status < 400)
  const forbidden = results.filter(r => r.status === 403)
  const notFound = results.filter(r => r.status === 404)
  const errors = results.filter(r => typeof r.status === 'string')
  const other = results.filter(
    r => typeof r.status === 'number' && ![200, 403, 404].includes(r.status as number) && ((r.status as number) < 300 || (r.status as number) >= 400)
  )

  console.log('\n' + '='.repeat(60))
  console.log('  URL Health Check Results')
  console.log('='.repeat(60))
  console.log(`  ✓ OK (200): ${ok.length}`)
  console.log(`  → Redirects (3xx): ${redirects.length}`)
  console.log(`  ⚠ Forbidden (403): ${forbidden.length}`)
  console.log(`  ✗ Not Found (404): ${notFound.length}`)
  console.log(`  ✗ Errors: ${errors.length}`)
  if (other.length) console.log(`  ? Other: ${other.length}`)

  if (notFound.length) {
    console.log('\n--- Not Found (404) ---')
    for (const r of notFound) {
      console.log(`  ${r.source}: ${r.url}`)
    }
  }
  if (errors.length) {
    console.log('\n--- Errors ---')
    for (const r of errors) {
      console.log(`  ${r.source}: ${r.url} (${r.status})`)
    }
  }

  await prisma.$disconnect()
}

main().catch(console.error)
