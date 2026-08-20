import { z } from 'zod'
import {
  AUTOMATED_VALIDATION_ERROR_CLASSES,
  AutomatedLibraryAnalysisResultSchema,
  AutomatedValidationFindingSchema,
} from './library-analysis-automated-validation'

export const AUTOMATED_LIBRARY_DISPOSITIONS = [
  'candidate_complete',
  'partial',
  'blocked_input',
  'quarantined',
  'failed',
  'superseded',
] as const

export const AUTOMATED_STATUS_VALIDATOR_SEPARATION_LEVELS = [
  'same_model_distinct_prompt',
  'different_model_same_provider',
  'different_provider',
] as const

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/)
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/)
const dispositionSchema = z.enum(AUTOMATED_LIBRARY_DISPOSITIONS)
const validatorSeparationSchema = z.enum(
  AUTOMATED_STATUS_VALIDATOR_SEPARATION_LEVELS,
)

const AutomatedLibraryAnalysisStatusRecordSchema = z.object({
  sourceKey: identifierSchema,
  dataClass: z.string().min(1),
  disposition: dispositionSchema,
  machineUse: z.enum([
    'candidate_only',
    'reusable_for_ai_context',
    'quarantined',
  ]),
  findings: z.array(AutomatedValidationFindingSchema),
  analysisDisposition: dispositionSchema.nullable(),
  validatorDisposition: dispositionSchema.nullable(),
  validatorSeparationLevel: validatorSeparationSchema.nullable(),
}).strict()

export const AutomatedLibraryAnalysisStatusInputSchema = z.object({
  populationSnapshotId: identifierSchema.nullable(),
  populationHash: hashSchema.nullable(),
  populationTotal: z.number().int().nonnegative(),
  queryErrors: z.array(z.string().min(1)),
  records: z.array(AutomatedLibraryAnalysisStatusRecordSchema),
}).strict().superRefine((input, context) => {
  if (new Set(input.records.map(record => record.sourceKey)).size !== input.records.length) {
    context.addIssue({ code: 'custom', message: 'duplicate_source_key' })
  }
  if ((input.populationSnapshotId === null) !== (input.populationHash === null)) {
    context.addIssue({ code: 'custom', message: 'partial_population_identity' })
  }
})

export type AutomatedLibraryAnalysisStatusInput = z.infer<
  typeof AutomatedLibraryAnalysisStatusInputSchema
>

export const AutomatedLibraryStatusRunConfigSchema = z.object({
  populationSnapshotId: z.string().min(1),
  populationHash: hashSchema,
  sourceKey: identifierSchema,
  analysisDisposition: dispositionSchema,
  automatedResult: AutomatedLibraryAnalysisResultSchema,
  dataClass: z.string().min(1),
  validatorSeparationLevel: validatorSeparationSchema,
}).passthrough()

const findingCountsSchema = z.object(Object.fromEntries(
  AUTOMATED_VALIDATION_ERROR_CLASSES.map(errorClass => [
    errorClass,
    z.number().int().nonnegative(),
  ]),
) as Record<(typeof AUTOMATED_VALIDATION_ERROR_CLASSES)[number], z.ZodNumber>).strict()

export const AutomatedLibraryAnalysisStatusSchema = z.object({
  automatedOnly: z.literal(true),
  automatedValidationState: z.enum([
    'not_started',
    'running',
    'complete',
    'degraded',
  ]),
  populationSnapshotId: identifierSchema.nullable(),
  populationHash: hashSchema.nullable(),
  populationTotal: z.number().int().nonnegative(),
  disposedTotal: z.number().int().nonnegative(),
  candidateComplete: z.number().int().nonnegative(),
  partial: z.number().int().nonnegative(),
  blockedInput: z.number().int().nonnegative(),
  quarantined: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  superseded: z.number().int().nonnegative(),
  reusableForAiContext: z.number().int().nonnegative(),
  automatedFindingsByClass: findingCountsSchema,
  automatedFindingRateByDataClass: z.record(
    z.string().min(1),
    z.number().min(0).max(1),
  ),
  analysisValidatorDisagreementRate: z.number().min(0).max(1).nullable(),
  validatorSeparationLevel: validatorSeparationSchema.nullable(),
}).strict()

export type AutomatedLibraryAnalysisStatus = z.infer<
  typeof AutomatedLibraryAnalysisStatusSchema
>

export function buildAutomatedLibraryAnalysisStatus(
  rawInput: AutomatedLibraryAnalysisStatusInput,
): AutomatedLibraryAnalysisStatus {
  const input = AutomatedLibraryAnalysisStatusInputSchema.parse(rawInput)
  const dispositionCounts = Object.fromEntries(
    AUTOMATED_LIBRARY_DISPOSITIONS.map(disposition => [disposition, 0]),
  ) as Record<(typeof AUTOMATED_LIBRARY_DISPOSITIONS)[number], number>
  const findingCounts = Object.fromEntries(
    AUTOMATED_VALIDATION_ERROR_CLASSES.map(errorClass => [errorClass, 0]),
  ) as Record<(typeof AUTOMATED_VALIDATION_ERROR_CLASSES)[number], number>
  const dataClassTotals = new Map<string, number>()
  const dataClassWithFindings = new Map<string, number>()
  let reusableForAiContext = 0
  let comparable = 0
  let disagreements = 0

  for (const record of input.records) {
    dispositionCounts[record.disposition] += 1
    if (record.machineUse === 'reusable_for_ai_context') reusableForAiContext += 1
    dataClassTotals.set(record.dataClass, (dataClassTotals.get(record.dataClass) ?? 0) + 1)
    if (record.findings.length > 0) {
      dataClassWithFindings.set(
        record.dataClass,
        (dataClassWithFindings.get(record.dataClass) ?? 0) + 1,
      )
    }
    for (const finding of record.findings) findingCounts[finding.errorClass] += 1
    if (record.analysisDisposition !== null && record.validatorDisposition !== null) {
      comparable += 1
      if (record.analysisDisposition !== record.validatorDisposition) disagreements += 1
    }
  }

  const disposedTotal = Object.values(dispositionCounts).reduce(
    (total, count) => total + count,
    0,
  )
  const hasPopulationIdentity = input.populationSnapshotId !== null
  const reconciliationInvalid = disposedTotal > input.populationTotal ||
    (!hasPopulationIdentity && (disposedTotal > 0 || input.populationTotal > 0))
  const degraded = input.queryErrors.length > 0 || reconciliationInvalid
  const automatedValidationState = degraded
    ? 'degraded'
    : !hasPopulationIdentity && input.populationTotal === 0 && disposedTotal === 0
      ? 'not_started'
      : disposedTotal === input.populationTotal
        ? 'complete'
        : 'running'

  const rates = Object.fromEntries(
    [...dataClassTotals.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([dataClass, total]) => [
        dataClass,
        (dataClassWithFindings.get(dataClass) ?? 0) / total,
      ]),
  )

  const result: AutomatedLibraryAnalysisStatus = {
    automatedOnly: true,
    automatedValidationState,
    populationSnapshotId: input.populationSnapshotId,
    populationHash: input.populationHash,
    populationTotal: input.populationTotal,
    disposedTotal,
    candidateComplete: dispositionCounts.candidate_complete,
    partial: dispositionCounts.partial,
    blockedInput: dispositionCounts.blocked_input,
    quarantined: dispositionCounts.quarantined,
    failed: dispositionCounts.failed,
    superseded: dispositionCounts.superseded,
    reusableForAiContext: degraded ? 0 : reusableForAiContext,
    automatedFindingsByClass: findingCounts,
    automatedFindingRateByDataClass: rates,
    analysisValidatorDisagreementRate: comparable === 0 ? null : disagreements / comparable,
    validatorSeparationLevel: leastIndependentSeparation(input.records),
  }

  return AutomatedLibraryAnalysisStatusSchema.parse(result)
}

export function buildAutomatedLibraryAnalysisStatusFromRunConfigs(input: {
  populationTotal: number
  configs: readonly unknown[]
  queryErrors?: readonly string[]
}): AutomatedLibraryAnalysisStatus {
  const queryErrors = [...(input.queryErrors ?? [])]
  const parsedConfigs = input.configs.flatMap(config => {
    const parsed = AutomatedLibraryStatusRunConfigSchema.safeParse(config)
    if (parsed.success) return [parsed.data]
    queryErrors.push('candidate_validation_config_invalid')
    return []
  })
  const current = parsedConfigs[0]
  if (current === undefined) {
    return buildAutomatedLibraryAnalysisStatus({
      populationSnapshotId: null,
      populationHash: null,
      populationTotal: queryErrors.length === 0 ? 0 : input.populationTotal,
      queryErrors,
      records: [],
    })
  }

  const sourceKeys = new Set<string>()
  const records: AutomatedLibraryAnalysisStatusInput['records'] = []
  for (const config of parsedConfigs) {
    if (
      config.populationSnapshotId !== current.populationSnapshotId ||
      config.populationHash !== current.populationHash ||
      sourceKeys.has(config.sourceKey)
    ) continue
    sourceKeys.add(config.sourceKey)
    records.push({
      sourceKey: config.sourceKey,
      dataClass: config.dataClass,
      disposition: config.automatedResult.disposition,
      machineUse: config.automatedResult.machineUse,
      findings: config.automatedResult.findings,
      analysisDisposition: config.analysisDisposition,
      validatorDisposition: config.automatedResult.disposition,
      validatorSeparationLevel: config.validatorSeparationLevel,
    })
  }

  return buildAutomatedLibraryAnalysisStatus({
    populationSnapshotId: current.populationSnapshotId,
    populationHash: current.populationHash,
    populationTotal: input.populationTotal,
    queryErrors,
    records,
  })
}

function leastIndependentSeparation(
  records: AutomatedLibraryAnalysisStatusInput['records'],
): AutomatedLibraryAnalysisStatus['validatorSeparationLevel'] {
  const levels = records.flatMap(record => (
    record.validatorSeparationLevel === null ? [] : [record.validatorSeparationLevel]
  ))
  if (levels.length === 0) return null
  for (const level of AUTOMATED_STATUS_VALIDATOR_SEPARATION_LEVELS) {
    if (levels.includes(level)) return level
  }
  return null
}
