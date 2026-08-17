import { NextResponse } from 'next/server'
import version from '@/generated/version.json'

export const dynamic = 'force-static'

const FULL_SHA = /^[0-9a-f]{40}$/

/**
 * Deploy-beviset. Egne dokumenter kaller dette «fasit for gjeldende
 * deploy-SHA», og da må endepunktet enten svare sant eller si at det ikke kan.
 *
 * 503 og ikke 200-med-'unknown': en 200 er et svar noen bygger en kvittering
 * på. Målt 2026-08-16 rapporterte dette endepunktet i fem dager en commit som
 * ikke var den appen kjørte, med et ferskt `builtAt` ved siden av. En
 * kvittering som ser grønn ut på feil commit er verre enn ingen kvittering.
 */
export async function GET() {
  if (!FULL_SHA.test(version.sha)) {
    return NextResponse.json(
      { ok: false, error: 'runtime_commit_unavailable', shaSource: version.shaSource },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
  return NextResponse.json(version)
}
