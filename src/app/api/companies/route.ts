import { NextRequest, NextResponse } from 'next/server'
import { getCompanies, getInterlockingDirectorates } from '@/lib/queries/companies'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const valueChainStage = params.get('stage') ?? undefined
  const ownershipType = params.get('ownership') ?? undefined
  const interlocks = params.get('interlocks') === 'true'

  if (interlocks) {
    const data = await getInterlockingDirectorates()
    return NextResponse.json({ interlocks: data })
  }

  const companies = await getCompanies({ valueChainStage, ownershipType })
  return NextResponse.json({ count: companies.length, companies })
}
