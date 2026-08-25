import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getDataStatus, type DataStatusDb } from '@/lib/data-status'
import version from '@/generated/version.json'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const status = await getDataStatus(prisma as unknown as DataStatusDb)

  return NextResponse.json(
    {
      ok: status.ok,
      checkedAt: new Date().toISOString(),
      version,
      dbOk: status.dbOk,
      pageGatesOk: status.pageGatesOk,
      knowledgeBaseGatesOk: status.knowledgeBaseGatesOk,
      tables: status.tables,
      tableErrors: status.tableErrors,
      pages: status.pages,
      knowledgeBase: status.knowledgeBase,
      financialCoverage: status.financialCoverage,
      fallbackSurfaces: status.fallbackSurfaces,
      fallbackSensitiveTables: status.fallbackSensitiveTables,
    },
    { status: status.ok ? 200 : 503 }
  )
}
