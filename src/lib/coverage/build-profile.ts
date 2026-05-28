import { bucketVerification, classifyTemporal, deriveGeographicScope, rollupVerification } from './classify'
import type { CoverageProfile, DatasetSpec } from './types'

export type RawDatasetData = {
  years: number[]
  countries: string[]
  verificationStatusCounts: Record<string, number>
}

export function buildProfile(
  spec: DatasetSpec,
  raw: RawDatasetData,
  computedAt: string,
  computedEnv: 'prod' | 'local',
): CoverageProfile {
  return {
    datasetId: spec.id,
    label: spec.label,
    temporal: classifyTemporal(raw.years),
    geographic: deriveGeographicScope(raw.countries, spec.presentedAs),
    verification: rollupVerification(bucketVerification(raw.verificationStatusCounts)),
    computedAt,
    computedEnv,
  }
}
