import { z } from "zod";

import {
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
} from "./candidate-analysis-contract";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const nonEmptyTextSchema = z.string().min(1);

export const LIBRARY_ANALYSIS_POPULATION_SCHEMA =
  "library-analysis-population/v1" as const;

export const LibraryAnalysisPopulationRowSchema = z
  .object({
    sourceKind: nonEmptyTextSchema,
    sourceKey: nonEmptyTextSchema,
    sourceVersionHash: hashSchema.nullable(),
    inputKind: z.enum([
      "database_record",
      "artifact",
      "repository_file",
      "none",
    ]),
    locator: nonEmptyTextSchema.nullable(),
    contentHash: hashSchema.nullable(),
    identityConfidence: z.enum(["exact", "provisional", "unresolved"]),
    eligibility: z.enum(["eligible", "blocked_input", "superseded"]),
    blockers: z.array(nonEmptyTextSchema),
  })
  .strict();

export type LibraryAnalysisPopulationRow = z.infer<
  typeof LibraryAnalysisPopulationRowSchema
>;

export type LibraryAnalysisPopulationInputRow = Omit<
  LibraryAnalysisPopulationRow,
  "eligibility" | "blockers"
> & {
  readableInput: boolean;
  superseded: boolean;
};

export const LibraryAnalysisPopulationSnapshotSchema = z
  .object({
    schema: z.literal(LIBRARY_ANALYSIS_POPULATION_SCHEMA),
    snapshotId: nonEmptyTextSchema,
    populationHash: hashSchema,
    rows: z.array(LibraryAnalysisPopulationRowSchema),
  })
  .strict()
  .superRefine((snapshot, context) => {
    if (snapshot.populationHash !== libraryAnalysisPopulationHash(snapshot)) {
      context.addIssue({
        code: "custom",
        message: "library_analysis_population_hash_mismatch",
      });
    }
    if (snapshot.snapshotId !== `library-analysis-population:${snapshot.populationHash}`) {
      context.addIssue({
        code: "custom",
        message: "library_analysis_population_snapshot_id_mismatch",
      });
    }
  });

export type LibraryAnalysisPopulationSnapshot = z.infer<
  typeof LibraryAnalysisPopulationSnapshotSchema
>;

function blockersFor(row: LibraryAnalysisPopulationInputRow): string[] {
  if (row.superseded) return ["source_superseded"];
  const blockers: string[] = [];
  if (!row.readableInput) blockers.push("readable_input_missing");
  if (row.inputKind === "none") blockers.push("input_kind_missing");
  if (row.locator === null) blockers.push("locator_missing");
  if (row.contentHash === null) blockers.push("content_hash_missing");
  if (row.sourceVersionHash === null) blockers.push("source_version_hash_missing");
  return blockers;
}

export function libraryAnalysisPopulationHash(input: {
  schema: typeof LIBRARY_ANALYSIS_POPULATION_SCHEMA;
  rows: readonly LibraryAnalysisPopulationRow[];
}): string {
  return candidateAnalysisSha256("library-analysis-population", {
    schema: input.schema,
    rows: input.rows,
  });
}

export function buildLibraryAnalysisPopulation(
  inputRows: readonly LibraryAnalysisPopulationInputRow[],
): LibraryAnalysisPopulationSnapshot {
  const sorted = [...inputRows].sort((left, right) => {
    const kind = compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind);
    return kind === 0
      ? compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey)
      : kind;
  });
  const identities = new Set<string>();
  const rows = sorted.map((input): LibraryAnalysisPopulationRow => {
    const identity = `${input.sourceKind}\u0000${input.sourceKey}`;
    if (identities.has(identity)) throw new Error("duplicate_population_identity");
    identities.add(identity);
    const blockers = blockersFor(input);
    return LibraryAnalysisPopulationRowSchema.parse({
      sourceKind: input.sourceKind,
      sourceKey: input.sourceKey,
      sourceVersionHash: input.sourceVersionHash,
      inputKind: input.inputKind,
      locator: input.locator,
      contentHash: input.contentHash,
      identityConfidence: input.identityConfidence,
      eligibility: input.superseded
        ? "superseded"
        : blockers.length > 0
          ? "blocked_input"
          : "eligible",
      blockers,
    });
  });
  const core = { schema: LIBRARY_ANALYSIS_POPULATION_SCHEMA, rows } as const;
  const populationHash = libraryAnalysisPopulationHash(core);
  return LibraryAnalysisPopulationSnapshotSchema.parse({
    ...core,
    snapshotId: `library-analysis-population:${populationHash}`,
    populationHash,
  });
}
