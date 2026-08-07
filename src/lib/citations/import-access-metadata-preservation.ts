export type AccessMetadataUpdateGuardReason =
  | 'seed_reviewed_locator_access_pair'
  | null

type AccessMetadataUpdateGuardInput = {
  seedAccessDate: string | null | undefined
}

function hasValue(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * A seed-side reviewed date keeps the generic import from applying a reviewed
 * pair to an existing row. Existing database review dates are protected by an
 * atomic updateMany predicate on the live row, not by a stale pre-read. The
 * upsert create branch remains independent and may materialize the seed pair.
 */
export function accessMetadataUpdateGuardReason(
  input: AccessMetadataUpdateGuardInput,
): AccessMetadataUpdateGuardReason {
  if (hasValue(input.seedAccessDate)) return 'seed_reviewed_locator_access_pair'
  return null
}
