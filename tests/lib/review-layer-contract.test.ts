import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

type Layer = {
  layerId: string;
  statusVocabulary: string[];
  approvalStates: string[];
  cannotSatisfyLayerIds: string[];
  autoAuthorizesPublication: boolean;
  autoPromotesCoverage: boolean;
};

type Contract = {
  ownerPolicy: Record<string, unknown>;
  layers: Layer[];
  legacyMappings: Array<{
    sourceStatus: string;
    canonicalAssignments: Array<{ layerId: string; status: string }>;
    legacyHumanReviewState: string;
    canonicalReviewLayerResolution: string;
    migrationMode: string;
    independentValidationImplied: boolean;
    rightsHolderValidationImplied: boolean;
    rightsClearanceImplied: boolean;
    publicationImplied: boolean;
    coveragePromotionImplied: boolean;
  }>;
  legacyReceiptPolicy: Record<string, unknown>;
  publicationRule: Record<string, unknown>;
  coveragePromotionRule: Record<string, unknown>;
  sapmiBoundary: Record<string, unknown>;
};

const root = fileURLToPath(new URL("../../", import.meta.url));

function readJson(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(`${root}${path}`, "utf8")) as Record<
    string,
    unknown
  >;
}

const schema = readJson(
  "knowledge/schema/review-layer-contract.schema.v1.json",
);
const contract = readJson(
  "knowledge/review/review-layer-contract.v1.json",
) as Contract & Record<string, unknown>;

test("review-layer contract validates and defines every independent axis exactly once", () => {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  assert.equal(validate(contract), true, JSON.stringify(validate.errors));

  const expected = [
    "ai_processing",
    "coverage_promotion",
    "independent_expert_validation",
    "owner_review",
    "partner_validation",
    "publication",
    "rights_clearance",
    "rights_holder_validation",
  ];
  assert.deepEqual(
    contract.layers.map((layer) => layer.layerId).sort(),
    expected,
  );

  for (const layer of contract.layers) {
    assert.ok(
      layer.approvalStates.every((state) =>
        layer.statusVocabulary.includes(state),
      ),
    );
    assert.deepEqual(
      [...layer.cannotSatisfyLayerIds].sort(),
      expected.filter((layerId) => layerId !== layer.layerId),
    );
    assert.equal(layer.autoAuthorizesPublication, false);
    assert.equal(layer.autoPromotesCoverage, false);
  }
});

test("Gabriel may sign AI-assisted owner review but cannot self-assert independent validation", () => {
  assert.deepEqual(contract.ownerPolicy, {
    ownerId: "person.gabriel_freeman",
    name: "Gabriel Freeman",
    ownerReceiptLayerId: "owner_review",
    maySignOwnerReceipts: true,
    aiAssistanceAllowed: true,
    aiAssistanceDisclosureRequired: true,
    maySelfAssertIndependentExpertValidation: false,
    maySubstituteForRightsHolderAuthority: false,
  });

  const owner = contract.layers.find(
    (layer) => layer.layerId === "owner_review",
  );
  assert.ok(owner);
  assert.ok(
    owner.cannotSatisfyLayerIds.includes("independent_expert_validation"),
  );
  assert.ok(owner.cannotSatisfyLayerIds.includes("rights_holder_validation"));
});

test("Gate 2C legacy human-review statuses stay unclassified until signer authority is known", () => {
  const pending = contract.legacyMappings.find(
    (mapping) => mapping.sourceStatus === "human_review_pending",
  );
  assert.deepEqual(pending?.canonicalAssignments, []);
  assert.equal(pending?.legacyHumanReviewState, "pending_unclassified");
  assert.equal(pending?.migrationMode, "read_time_alias_no_historical_rewrite");

  const machinePending = contract.legacyMappings.find(
    (mapping) =>
      mapping.sourceStatus === "machine_checked_human_review_pending",
  );
  assert.deepEqual(machinePending?.canonicalAssignments, [
    { layerId: "ai_processing", status: "ai_processed" },
  ]);

  for (const mapping of contract.legacyMappings) {
    assert.equal(
      mapping.canonicalReviewLayerResolution,
      "unresolved_until_receipt_actor_and_gate_role_classified",
    );
    assert.equal(
      mapping.canonicalAssignments.some(
        (assignment) => assignment.layerId !== "ai_processing",
      ),
      false,
    );
    assert.equal(mapping.independentValidationImplied, false);
    assert.equal(mapping.rightsHolderValidationImplied, false);
    assert.equal(mapping.rightsClearanceImplied, false);
    assert.equal(mapping.publicationImplied, false);
    assert.equal(mapping.coveragePromotionImplied, false);
  }
  assert.deepEqual(contract.legacyReceiptPolicy, {
    sourceDocumentType: "field08_human_review_receipt",
    canonicalLayerId: null,
    classificationMode: "classify_from_actual_signer_authority_and_gate_role",
    allowedCanonicalLayerIds: [
      "owner_review",
      "independent_expert_validation",
      "partner_validation",
      "rights_holder_validation",
    ],
    requiredClassificationEvidence: [
      "named_signer_identity",
      "gate_required_reviewer_role",
      "qualifications_or_role_authority",
      "affiliation",
      "conflict_declaration",
      "exact_scope_binding",
    ],
    statusAloneCreatesCanonicalApproval: false,
    unclassifiedLegacyReceiptCreatesCanonicalApproval: false,
    externalUseAllowed: false,
    coveragePromotionAllowed: false,
  });
});

test("Sápmi remains non-additive and rights-holder-led while publication and coverage stay separate", () => {
  assert.deepEqual(contract.sapmiBoundary, {
    geographyId: "geo.sapmi",
    aggregationClass: "sapmi_overlapping",
    nonAdditiveWithPoliticalNordicTotals: true,
    requiredLayerId: "rights_holder_validation",
    requiresRightsHolderLedScope: true,
    requiresConsentAndDataGovernanceBasis: true,
    requiresRightsHolderInterpretation: true,
    politicalCountryEvidenceCreatesSapmiEvidence: false,
    substitutionProhibitedLayerIds: [
      "ai_processing",
      "owner_review",
      "independent_expert_validation",
      "partner_validation",
    ],
    partnerMayActAsRightsHolderOnlyWithDocumentedAuthorityAndSeparateReceipt: true,
    rightsHolderValidationAlsoClearsRights: false,
  });

  assert.equal(contract.publicationRule.automaticApprovalAllowed, false);
  assert.equal(
    contract.coveragePromotionRule.requiredEventType,
    "append_only_coverage_assessment",
  );
  assert.equal(contract.coveragePromotionRule.publicationIsSufficient, false);
  assert.equal(contract.coveragePromotionRule.automaticPromotionAllowed, false);
});
