import { NextResponse, type NextRequest } from 'next/server'
import { checkApiAccess } from '@/lib/cf-access'

export async function proxy(request: NextRequest) {
  // Local `next dev` has no Cloudflare in front of it.
  if (process.env.NODE_ENV !== 'production') return NextResponse.next()

  const decision = await checkApiAccess(
    request.nextUrl.pathname,
    request.headers.get('cf-access-jwt-assertion'),
  )
  if (decision !== 'denied') return NextResponse.next()

  return NextResponse.json(
    { error: 'cloudflare_access_required' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } },
  )
}

export const config = {
  matcher: '/api/:path*',
}
