import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateBibtexFile } from '@/lib/bibtex'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? 'all'

  const [theses, reports] = await Promise.all([
    type === 'report' ? Promise.resolve([]) : prisma.thesis.findMany({ orderBy: { year: 'asc' } }),
    type === 'thesis' ? Promise.resolve([]) : prisma.report.findMany({ orderBy: { year: 'asc' } }),
  ])

  const bib = generateBibtexFile(theses, reports)

  return new NextResponse(bib, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="food-systems-2026.bib"',
    },
  })
}
