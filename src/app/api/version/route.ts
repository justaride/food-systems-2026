import { NextResponse } from 'next/server'
import version from '@/generated/version.json'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json(version)
}
