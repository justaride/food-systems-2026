-- Advance the sealed library analysis and validation bindings to 1.0.19
-- without rewriting the historical candidate-analysis foundation migration.

CREATE OR REPLACE FUNCTION public.candidate_worker_append(
  writer_operation TEXT,
  write_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
DECLARE
  run_row public."CandidateAnalysisRun"%ROWTYPE;
  event_row public."CandidateAnalysisRunEvent"%ROWTYPE;
  artifact_row public."CandidateAnalysisArtifact"%ROWTYPE;
  assertion_row public."CandidateAssertion"%ROWTYPE;
  evidence_row public."CandidateEvidenceLink"%ROWTYPE;
  dependency_row public."CandidateDependency"%ROWTYPE;
  input_item JSONB;
  derived_inputs JSONB;
  derived_idempotency JSONB;
  stored_manifest JSONB;
  latest_event public."CandidateAnalysisRunEvent"%ROWTYPE;
  assertion_run_id TEXT;
  result_state TEXT;
  upstream_ids TEXT[];
  required_limitations TEXT[];
  dependent_machine_rank INTEGER;
  weakest_machine_rank INTEGER;
  dependent_identity_rank INTEGER;
  weakest_identity_rank INTEGER;
  dependent_evidence_rank INTEGER;
  weakest_evidence_rank INTEGER;
BEGIN
  IF writer_operation NOT IN (
    'create_run', 'append_event', 'append_artifact', 'append_assertion',
    'append_evidence', 'append_dependency'
  ) THEN
    RAISE EXCEPTION 'candidate_writer_operation_invalid';
  END IF;

  IF writer_operation = 'create_run' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'scopeHash', 'workflowId', 'workflowVersion', 'workflowPath',
      'workflowHash', 'promptId', 'promptVersion', 'promptPath', 'promptHash',
      'modelProvider', 'modelName', 'modelVersion', 'config', 'configHash',
      'inputEnvelopeHash', 'purpose', 'outputProfile', 'workerId',
      'idempotencyKey', 'attempt', 'predecessorRunId', 'inputs', 'initialEvent'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'scopeHash', 'workflowId', 'workflowVersion', 'workflowPath',
        'workflowHash', 'promptId', 'promptVersion', 'promptPath', 'promptHash',
        'modelProvider', 'modelName', 'modelVersion', 'configHash',
        'inputEnvelopeHash', 'purpose', 'outputProfile', 'workerId',
        'idempotencyKey'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_integer(write_payload->'attempt')
      OR jsonb_typeof(write_payload->'inputs') IS DISTINCT FROM 'array'
      OR jsonb_typeof(write_payload->'initialEvent') IS DISTINCT FROM 'object'
      OR jsonb_typeof(write_payload->'predecessorRunId') NOT IN ('null', 'string')
      OR (
        jsonb_typeof(write_payload->'predecessorRunId') = 'string'
        AND write_payload->>'predecessorRunId' !~ '^[a-z0-9][a-z0-9._:-]*$'
      )
    THEN
      RAISE EXCEPTION 'candidate_run_input_schema_invalid';
    END IF;
    run_row := jsonb_populate_record(NULL::public."CandidateAnalysisRun", write_payload);
    IF run_row.id IS NULL OR run_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR run_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-scope', jsonb_build_object('runId', run_row.id)
      )
      OR NOT (
        (
          run_row."outputProfile" = 'candidate_only'
          AND run_row."workflowId" = 'workflow.candidate_analysis.v1'
          AND run_row."workflowVersion" = '1.0.0'
          AND run_row."workflowPath" = 'knowledge/corpus/workflows/candidate-analysis-v1.md'
          AND run_row."workflowHash" = '707ea0ebd78db21a539ce9fde6945bc4954476468d8ba297c86e8d6cbc0385d4'
          AND run_row."promptId" = 'prompt.candidate_analysis.v1'
          AND run_row."promptVersion" = '1.0.0'
          AND run_row."promptPath" = 'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md'
          AND run_row."promptHash" = '483d34ca87cb5cdaae0923e617f78defafece7825e0afd5ef2e07b3261127e85'
        ) OR (
          run_row."outputProfile" = 'library_analysis_v1'
          AND run_row."workflowId" = 'workflow.library_analysis.automated.v1'
          AND run_row."workflowVersion" = '1.0.19'
          AND run_row."workflowPath" = 'knowledge/corpus/workflows/library-analysis-automated-v1.md'
          AND run_row."workflowHash" = 'e5fa5be3c22caca05c269651f1e129dd0e80f2f2b8a963e4bd09a8e9ac86dcf4'
          AND run_row."promptId" = 'prompt.library_analysis.automated.v1'
          AND run_row."promptVersion" = '1.0.19'
          AND run_row."promptPath" = 'knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md'
          AND run_row."promptHash" = '964ce5810958c5f280e5de6c1bea89b773978c4b7da7f754ac8119e59bae6d73'
        ) OR (
          run_row."outputProfile" = 'library_validation_v1'
          AND run_row."workflowId" = 'workflow.library_validation.automated.v1'
          AND run_row."workflowVersion" = '1.0.19'
          AND run_row."workflowPath" = 'knowledge/corpus/workflows/library-validation-automated-v1.md'
          AND run_row."workflowHash" = 'c8aa67dc93a472627c82b219a5576ba36d9681557a6362264dd8aa742bd3f268'
          AND run_row."promptId" = 'prompt.library_validation.automated.v1'
          AND run_row."promptVersion" = '1.0.19'
          AND run_row."promptPath" = 'knowledge/corpus/workflows/library-validation-automated-prompt-v1.md'
          AND run_row."promptHash" = 'ce323fb2fa91ef85b16f08e25a47d0a4e2b10eaf997f40124903168621e26be8'
        )
      )
      OR (write_payload->'config') IS NULL
      OR run_row."configHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-config', write_payload->'config'
      )
      OR btrim(run_row."modelProvider") = ''
      OR btrim(run_row."modelName") = ''
      OR btrim(run_row."modelVersion") = ''
      OR btrim(run_row.purpose) = ''
      OR run_row."workerId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR run_row.attempt <= 0
      OR jsonb_typeof(write_payload->'inputs') <> 'array'
      OR jsonb_array_length(write_payload->'inputs') = 0
    THEN
      RAISE EXCEPTION 'candidate_run_integrity_mismatch';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(write_payload->'inputs') supplied(value)
      WHERE NOT public.candidate_json_keys_equal(
          value, ARRAY['contentUnitId', 'position', 'inputHash']
        )
        OR jsonb_typeof(value->'contentUnitId') IS DISTINCT FROM 'string'
        OR NOT public.candidate_json_integer(value->'position')
        OR jsonb_typeof(value->'inputHash') IS DISTINCT FROM 'string'
    ) THEN
      RAISE EXCEPTION 'candidate_run_input_schema_invalid';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM jsonb_array_elements(write_payload->'inputs') WITH ORDINALITY supplied(value, ordinal)
      WHERE (value->>'position')::INTEGER <> ordinal - 1
        OR value->>'contentUnitId' !~ '^[a-z0-9][a-z0-9._:-]*$'
        OR value->>'inputHash' !~ '^[0-9a-f]{64}$'
        OR NOT EXISTS (
          SELECT 1 FROM public."CandidateContentUnit" content
          WHERE content.id = value->>'contentUnitId'
            AND content."contentHash" = value->>'inputHash'
        )
    ) OR (
      SELECT count(DISTINCT value->>'contentUnitId')
      FROM jsonb_array_elements(write_payload->'inputs') supplied(value)
    ) <> jsonb_array_length(write_payload->'inputs') THEN
      RAISE EXCEPTION 'candidate_run_input_content_binding_mismatch';
    END IF;

    SELECT jsonb_agg(jsonb_build_object(
      'contentUnitId', value->>'contentUnitId',
      'position', (value->>'position')::INTEGER,
      'inputHash', value->>'inputHash'
    ) ORDER BY (value->>'position')::INTEGER)
    INTO derived_inputs
    FROM jsonb_array_elements(write_payload->'inputs') supplied(value);
    IF run_row."inputEnvelopeHash" IS DISTINCT FROM public.candidate_writer_hash(
      'run-input-envelope', jsonb_build_object('inputs', derived_inputs)
    ) THEN
      RAISE EXCEPTION 'candidate_run_input_envelope_mismatch';
    END IF;

    derived_idempotency := jsonb_build_object(
      'workflow', jsonb_build_object(
        'id', run_row."workflowId", 'version', run_row."workflowVersion",
        'path', run_row."workflowPath", 'hash', run_row."workflowHash"
      ),
      'prompt', jsonb_build_object(
        'id', run_row."promptId", 'version', run_row."promptVersion",
        'path', run_row."promptPath", 'hash', run_row."promptHash"
      ),
      'model', jsonb_build_object(
        'provider', run_row."modelProvider", 'name', run_row."modelName",
        'version', run_row."modelVersion"
      ),
      'configHash', run_row."configHash",
      'inputEnvelopeHash', run_row."inputEnvelopeHash",
      'purpose', run_row.purpose,
      'outputProfile', run_row."outputProfile",
      'attempt', run_row.attempt,
      'predecessorRunId', run_row."predecessorRunId"
    );
    IF run_row."idempotencyKey" IS DISTINCT FROM public.candidate_writer_hash(
      'run-idempotency', derived_idempotency
    ) THEN
      RAISE EXCEPTION 'candidate_run_idempotency_mismatch';
    END IF;

    IF NOT public.candidate_json_keys_equal(write_payload->'initialEvent', ARRAY[
      'id', 'runId', 'scopeHash', 'sequence', 'eventType', 'payload',
      'eventHash', 'supersededEventId', 'supersededEventHash',
      'supersededEventScopeHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'scopeHash', 'eventType', 'eventHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->'initialEvent'->field.name)
        IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_integer(
      write_payload->'initialEvent'->'sequence'
    ) OR jsonb_typeof(write_payload->'initialEvent'->'payload') NOT IN (
      'null', 'object'
    ) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'supersededEventId', 'supersededEventHash', 'supersededEventScopeHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->'initialEvent'->field.name)
        IS DISTINCT FROM 'null'
    ) THEN
      RAISE EXCEPTION 'candidate_initial_event_invalid';
    END IF;
    event_row := jsonb_populate_record(
      NULL::public."CandidateAnalysisRunEvent",
      write_payload->'initialEvent'
    );
    IF event_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR event_row."runId" <> run_row.id
      OR event_row."scopeHash" <> run_row."scopeHash"
      OR event_row.sequence <> 1
      OR event_row."eventType" <> 'queued'
      OR event_row."supersededEventId" IS NOT NULL
      OR event_row."supersededEventHash" IS NOT NULL
      OR event_row."supersededEventScopeHash" IS NOT NULL
      OR event_row."eventHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-event', jsonb_build_object(
          'id', event_row.id, 'runId', event_row."runId",
          'scopeHash', event_row."scopeHash", 'sequence', event_row.sequence,
          'eventType', event_row."eventType", 'payload', event_row.payload,
          'supersededEventId', event_row."supersededEventId",
          'supersededEventHash', event_row."supersededEventHash",
          'supersededEventScopeHash', event_row."supersededEventScopeHash"
        )
      )
    THEN
      RAISE EXCEPTION 'candidate_initial_event_invalid';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || run_row.id, 0));
    INSERT INTO public."CandidateAnalysisRun" (
      id, "scopeHash", "workflowId", "workflowVersion", "workflowPath",
      "workflowHash", "promptId", "promptVersion", "promptPath", "promptHash",
      "modelProvider", "modelName", "modelVersion", config, "configHash",
      "inputEnvelopeHash", purpose, "outputProfile", "workerId",
      "idempotencyKey", attempt, "predecessorRunId"
    ) VALUES (
      run_row.id, run_row."scopeHash", run_row."workflowId",
      run_row."workflowVersion", run_row."workflowPath", run_row."workflowHash",
      run_row."promptId", run_row."promptVersion", run_row."promptPath",
      run_row."promptHash", run_row."modelProvider", run_row."modelName",
      run_row."modelVersion", write_payload->'config', run_row."configHash",
      run_row."inputEnvelopeHash", run_row.purpose, run_row."outputProfile",
      run_row."workerId", run_row."idempotencyKey", run_row.attempt,
      run_row."predecessorRunId"
    );
    FOR input_item IN
      SELECT value FROM jsonb_array_elements(write_payload->'inputs') value
      ORDER BY (value->>'position')::INTEGER
    LOOP
      INSERT INTO public."CandidateAnalysisRunInput" (
        id, "runId", "contentUnitId", position, "inputHash"
      ) VALUES (
        'candidate-run-input:' || public.candidate_writer_hash(
          'run-input-row', jsonb_build_object(
            'runId', run_row.id,
            'contentUnitId', input_item->>'contentUnitId',
            'position', (input_item->>'position')::INTEGER
          )
        ),
        run_row.id,
        input_item->>'contentUnitId',
        (input_item->>'position')::INTEGER,
        input_item->>'inputHash'
      );
    END LOOP;
    INSERT INTO public."CandidateAnalysisRunEvent" (
      id, "runId", "scopeHash", sequence, "eventType", payload, "eventHash",
      "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
    ) VALUES (
      event_row.id, event_row."runId", event_row."scopeHash", event_row.sequence,
      event_row."eventType", event_row.payload, event_row."eventHash",
      event_row."supersededEventId", event_row."supersededEventHash",
      event_row."supersededEventScopeHash"
    );
    RETURN jsonb_build_object('runId', run_row.id, 'created', true);
  END IF;

  IF writer_operation = 'append_event' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'runId', 'scopeHash', 'sequence', 'eventType', 'payload',
      'eventHash', 'supersededEventId', 'supersededEventHash',
      'supersededEventScopeHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'scopeHash', 'eventType', 'eventHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_integer(write_payload->'sequence')
      OR jsonb_typeof(write_payload->'payload') NOT IN ('null', 'object')
      OR EXISTS (
        SELECT 1 FROM unnest(ARRAY[
          'supersededEventId', 'supersededEventHash',
          'supersededEventScopeHash'
        ]) field(name)
        WHERE jsonb_typeof(write_payload->field.name) NOT IN ('null', 'string')
      )
    THEN
      RAISE EXCEPTION 'candidate_event_input_schema_invalid';
    END IF;
    event_row := jsonb_populate_record(NULL::public."CandidateAnalysisRunEvent", write_payload);
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || event_row."runId", 0));
    IF event_row.id IS NULL OR event_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR event_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR (
        event_row."supersededEventId" IS NOT NULL
        AND event_row."supersededEventId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      )
      OR event_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-scope', jsonb_build_object('runId', event_row."runId")
      )
      OR NOT EXISTS (
        SELECT 1 FROM public."CandidateAnalysisRun" run
        WHERE run.id = event_row."runId" AND run."scopeHash" = event_row."scopeHash"
      )
      OR event_row."eventHash" IS DISTINCT FROM public.candidate_writer_hash(
        'run-event', jsonb_build_object(
          'id', event_row.id, 'runId', event_row."runId",
          'scopeHash', event_row."scopeHash", 'sequence', event_row.sequence,
          'eventType', event_row."eventType", 'payload', event_row.payload,
          'supersededEventId', event_row."supersededEventId",
          'supersededEventHash', event_row."supersededEventHash",
          'supersededEventScopeHash', event_row."supersededEventScopeHash"
        )
      )
    THEN
      RAISE EXCEPTION 'candidate_event_integrity_mismatch';
    END IF;
    SELECT * INTO latest_event
    FROM public."CandidateAnalysisRunEvent" event
    WHERE event."runId" = event_row."runId"
    ORDER BY event.sequence DESC
    LIMIT 1;
    IF latest_event.id IS NULL OR event_row.sequence <> latest_event.sequence + 1 THEN
      RAISE EXCEPTION 'event_sequence_conflict';
    END IF;
    IF latest_event."eventType" = 'queued'
      AND event_row."eventType" NOT IN ('started', 'failed', 'blocked_input', 'quarantined') THEN
      RAISE EXCEPTION 'invalid_event_transition';
    ELSIF latest_event."eventType" IN ('started', 'checkpoint')
      AND event_row."eventType" NOT IN (
        'checkpoint', 'candidate_completed', 'partial_completed', 'failed',
        'blocked_input', 'quarantined'
      ) THEN
      RAISE EXCEPTION 'invalid_event_transition';
    ELSIF latest_event."eventType" IN ('candidate_completed', 'partial_completed') THEN
      IF event_row."eventType" <> 'superseded'
        OR event_row."supersededEventId" IS DISTINCT FROM latest_event.id
        OR event_row."supersededEventHash" IS DISTINCT FROM latest_event."eventHash"
        OR event_row."supersededEventScopeHash" IS DISTINCT FROM latest_event."scopeHash" THEN
        RAISE EXCEPTION 'invalid_event_supersession';
      END IF;
    ELSIF latest_event."eventType" IN (
      'failed', 'blocked_input', 'quarantined', 'superseded'
    ) THEN
      RAISE EXCEPTION 'event_after_terminal_state';
    END IF;

    IF event_row."eventType" IN ('candidate_completed', 'partial_completed') THEN
      stored_manifest := public.candidate_stored_output_manifest(event_row."runId");
      IF jsonb_array_length(stored_manifest->'artifacts') = 0
        OR jsonb_array_length(stored_manifest->'assertions') = 0 THEN
        RAISE EXCEPTION 'terminal_output_missing';
      END IF;
      IF EXISTS (
          SELECT 1
          FROM public."CandidateAnalysisRunInput" input
          JOIN public."CandidateContentUnit" content ON content.id = input."contentUnitId"
          WHERE input."runId" = event_row."runId"
            AND input."inputHash" <> content."contentHash"
        )
        OR EXISTS (
          SELECT 1 FROM public."CandidateAssertion" assertion
          WHERE assertion."runId" = event_row."runId"
            AND assertion."evidenceLevel" = 'exact_locator'
            AND NOT EXISTS (
              SELECT 1
              FROM public."CandidateEvidenceLink" evidence
              JOIN public."CandidateContentUnit" content ON content.id = evidence."contentUnitId"
              JOIN public."CandidateAnalysisRunInput" input
                ON input."runId" = assertion."runId"
               AND input."contentUnitId" = content.id
              WHERE evidence."assertionId" = assertion.id
                AND evidence.relation = 'supports'
                AND evidence.locator = content.locator
                AND evidence."locatorHash" = content."locatorHash"
                AND input."inputHash" = content."contentHash"
            )
        )
        OR event_row.payload #> '{data,manifest}' IS DISTINCT FROM stored_manifest
        OR event_row.payload #>> '{data,manifestHash}' IS DISTINCT FROM
          public.candidate_writer_hash('output-manifest', stored_manifest)
      THEN
        RAISE EXCEPTION 'terminal_output_integrity';
      END IF;
    END IF;

    INSERT INTO public."CandidateAnalysisRunEvent" (
      id, "runId", "scopeHash", sequence, "eventType", payload, "eventHash",
      "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
    ) VALUES (
      event_row.id, event_row."runId", event_row."scopeHash", event_row.sequence,
      event_row."eventType", event_row.payload, event_row."eventHash",
      event_row."supersededEventId", event_row."supersededEventHash",
      event_row."supersededEventScopeHash"
    );
    result_state := CASE event_row."eventType"
      WHEN 'queued' THEN 'queued'
      WHEN 'started' THEN 'running'
      WHEN 'checkpoint' THEN 'running'
      WHEN 'candidate_completed' THEN 'candidate_complete'
      WHEN 'partial_completed' THEN 'partial'
      ELSE event_row."eventType"::TEXT
    END;
    RETURN jsonb_build_object(
      'runId', event_row."runId", 'sequence', event_row.sequence, 'state', result_state
    );
  END IF;

  IF writer_operation = 'append_artifact' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'runId', 'artifactType', 'schemaVersion', 'payload', 'payloadHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'artifactType', 'schemaVersion', 'payloadHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR jsonb_typeof(write_payload->'payload') IS DISTINCT FROM 'object'
    THEN
      RAISE EXCEPTION 'candidate_artifact_input_schema_invalid';
    END IF;
    artifact_row := jsonb_populate_record(NULL::public."CandidateAnalysisArtifact", write_payload);
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || artifact_row."runId", 0));
    PERFORM public.candidate_writer_assert_open(artifact_row."runId");
    IF artifact_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR artifact_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR artifact_row."artifactType" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR artifact_row."schemaVersion" <> 'candidate-analysis-v1'
      OR artifact_row."payloadHash" IS DISTINCT FROM public.candidate_writer_hash(
        'artifact-payload', artifact_row.payload
      ) THEN
      RAISE EXCEPTION 'candidate_artifact_integrity_mismatch';
    END IF;
    INSERT INTO public."CandidateAnalysisArtifact" (
      id, "runId", "artifactType", "schemaVersion", payload, "payloadHash"
    ) VALUES (
      artifact_row.id, artifact_row."runId", artifact_row."artifactType",
      artifact_row."schemaVersion", artifact_row.payload, artifact_row."payloadHash"
    );
    RETURN jsonb_build_object('artifactId', artifact_row.id);
  END IF;

  IF writer_operation = 'append_assertion' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'runId', 'assertionType', 'schemaVersion', 'payload', 'payloadHash',
      'confidence', 'machineUse', 'identityConfidence', 'evidenceLevel',
      'limitations', 'scopeKey', 'scopeHash', 'supersededAssertionId',
      'supersededAssertionPayloadHash', 'promotionState'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'runId', 'assertionType', 'schemaVersion', 'payloadHash',
        'machineUse', 'identityConfidence', 'evidenceLevel', 'scopeKey',
        'scopeHash', 'promotionState'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR jsonb_typeof(write_payload->'payload') IS DISTINCT FROM 'object'
      OR jsonb_typeof(write_payload->'confidence') NOT IN ('null', 'number')
      OR NOT public.candidate_json_nonempty_text_array(write_payload->'limitations')
      OR EXISTS (
        SELECT 1 FROM unnest(ARRAY[
          'supersededAssertionId', 'supersededAssertionPayloadHash'
        ]) field(name)
        WHERE jsonb_typeof(write_payload->field.name) NOT IN ('null', 'string')
      )
      OR write_payload->>'promotionState' <> 'candidate'
    THEN
      RAISE EXCEPTION 'candidate_assertion_input_schema_invalid';
    END IF;
    assertion_row := jsonb_populate_record(NULL::public."CandidateAssertion", write_payload);
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || assertion_row."runId", 0));
    PERFORM public.candidate_writer_assert_open(assertion_row."runId");
    IF assertion_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR assertion_row."runId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR assertion_row."schemaVersion" <> 'candidate-analysis-v1'
      OR assertion_row."scopeKey" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR (
        assertion_row."supersededAssertionId" IS NOT NULL
        AND assertion_row."supersededAssertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      )
      OR assertion_row."payloadHash" IS DISTINCT FROM public.candidate_writer_hash(
        'assertion-payload', assertion_row.payload
      )
      OR assertion_row."scopeHash" IS DISTINCT FROM public.candidate_writer_hash(
        'assertion-scope', jsonb_build_object('scopeKey', assertion_row."scopeKey")
      )
      OR ((assertion_row."supersededAssertionId" IS NULL)
        <> (assertion_row."supersededAssertionPayloadHash" IS NULL))
      OR assertion_row."supersededAssertionId" = assertion_row.id
      OR EXISTS (SELECT 1 FROM unnest(assertion_row.limitations) limitation WHERE btrim(limitation) = '')
    THEN
      RAISE EXCEPTION 'candidate_assertion_integrity_mismatch';
    END IF;
    IF assertion_row."supersededAssertionId" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public."CandidateAssertion" prior
      WHERE prior.id = assertion_row."supersededAssertionId"
        AND prior."payloadHash" = assertion_row."supersededAssertionPayloadHash"
        AND prior."scopeHash" = assertion_row."scopeHash"
    ) THEN
      RAISE EXCEPTION 'supersession_conflict';
    END IF;
    INSERT INTO public."CandidateAssertion" (
      id, "runId", "assertionType", "schemaVersion", payload, "payloadHash",
      confidence, "machineUse", "identityConfidence", "evidenceLevel",
      limitations, "scopeKey", "scopeHash", "supersededAssertionId",
      "supersededAssertionPayloadHash"
    ) VALUES (
      assertion_row.id, assertion_row."runId", assertion_row."assertionType",
      assertion_row."schemaVersion", assertion_row.payload,
      assertion_row."payloadHash", assertion_row.confidence,
      assertion_row."machineUse", assertion_row."identityConfidence",
      assertion_row."evidenceLevel", assertion_row.limitations,
      assertion_row."scopeKey", assertion_row."scopeHash",
      assertion_row."supersededAssertionId",
      assertion_row."supersededAssertionPayloadHash"
    );
    RETURN jsonb_build_object('assertionId', assertion_row.id);
  END IF;

  IF writer_operation = 'append_evidence' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'assertionId', 'contentUnitId', 'relation', 'locator',
      'locatorHash', 'excerptHash'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'assertionId', 'contentUnitId', 'relation', 'locator',
        'locatorHash'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR jsonb_typeof(write_payload->'excerptHash') NOT IN ('null', 'string')
    THEN
      RAISE EXCEPTION 'candidate_evidence_input_schema_invalid';
    END IF;
    evidence_row := jsonb_populate_record(NULL::public."CandidateEvidenceLink", write_payload);
    SELECT assertion."runId" INTO assertion_run_id
    FROM public."CandidateAssertion" assertion WHERE assertion.id = evidence_row."assertionId";
    IF assertion_run_id IS NULL THEN RAISE EXCEPTION 'candidate_assertion_not_found'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || assertion_run_id, 0));
    PERFORM public.candidate_writer_assert_open(assertion_run_id);
    IF evidence_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR evidence_row."assertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR evidence_row."contentUnitId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR length(evidence_row.locator) = 0
      OR evidence_row."locatorHash" IS DISTINCT FROM public.candidate_writer_hash(
        'evidence-locator', jsonb_build_object('locator', evidence_row.locator)
      )
      OR NOT EXISTS (
        SELECT 1
        FROM public."CandidateAnalysisRunInput" input
        JOIN public."CandidateContentUnit" content ON content.id = input."contentUnitId"
        WHERE input."runId" = assertion_run_id
          AND input."contentUnitId" = evidence_row."contentUnitId"
          AND input."inputHash" = content."contentHash"
      ) THEN
      RAISE EXCEPTION 'candidate_evidence_integrity_mismatch';
    END IF;
    INSERT INTO public."CandidateEvidenceLink" (
      id, "assertionId", "contentUnitId", relation, locator, "locatorHash", "excerptHash"
    ) VALUES (
      evidence_row.id, evidence_row."assertionId", evidence_row."contentUnitId",
      evidence_row.relation, evidence_row.locator, evidence_row."locatorHash",
      evidence_row."excerptHash"
    );
    RETURN jsonb_build_object('evidenceLinkId', evidence_row.id);
  END IF;

  IF writer_operation = 'append_dependency' THEN
    IF NOT public.candidate_json_keys_equal(write_payload, ARRAY[
      'id', 'assertionId', 'upstreamAssertionId', 'relation',
      'inheritedLimitations'
    ]) OR EXISTS (
      SELECT 1 FROM unnest(ARRAY[
        'id', 'assertionId', 'upstreamAssertionId', 'relation'
      ]) field(name)
      WHERE jsonb_typeof(write_payload->field.name) IS DISTINCT FROM 'string'
    ) OR NOT public.candidate_json_nonempty_text_array(
      write_payload->'inheritedLimitations'
    ) THEN
      RAISE EXCEPTION 'candidate_dependency_input_schema_invalid';
    END IF;
    dependency_row := jsonb_populate_record(NULL::public."CandidateDependency", write_payload);
    FOR assertion_run_id IN
      SELECT identity FROM (VALUES
        (dependency_row."assertionId"),
        (dependency_row."upstreamAssertionId")
      ) candidate(identity) ORDER BY identity
    LOOP
      PERFORM pg_advisory_xact_lock(hashtextextended('candidate-assertion:' || assertion_run_id, 0));
    END LOOP;
    SELECT assertion."runId" INTO assertion_run_id
    FROM public."CandidateAssertion" assertion
    WHERE assertion.id = dependency_row."assertionId";
    IF assertion_run_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public."CandidateAssertion"
      WHERE id = dependency_row."upstreamAssertionId"
    ) THEN
      RAISE EXCEPTION 'candidate_assertion_not_found';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('candidate-run:' || assertion_run_id, 0));
    PERFORM public.candidate_writer_assert_open(assertion_run_id);
    IF dependency_row.id !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row."assertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row."upstreamAssertionId" !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row.relation !~ '^[a-z0-9][a-z0-9._:-]*$'
      OR dependency_row."assertionId" = dependency_row."upstreamAssertionId"
      OR dependency_row."inheritedLimitations" IS DISTINCT FROM ARRAY(
        SELECT DISTINCT limitation
        FROM unnest(dependency_row."inheritedLimitations") limitation
        WHERE btrim(limitation) <> ''
        ORDER BY limitation
      ) THEN
      RAISE EXCEPTION 'candidate_dependency_integrity_mismatch';
    END IF;
    WITH RECURSIVE upstream_tree(id) AS (
      VALUES (dependency_row."upstreamAssertionId")
      UNION
      SELECT dependency."upstreamAssertionId"
      FROM public."CandidateDependency" dependency
      JOIN upstream_tree ON dependency."assertionId" = upstream_tree.id
    )
    SELECT array_agg(id ORDER BY id) INTO upstream_ids FROM upstream_tree;
    IF dependency_row."assertionId" = ANY(upstream_ids) THEN
      RAISE EXCEPTION 'dependency_cycle';
    END IF;

    SELECT ARRAY(
      SELECT DISTINCT limitation
      FROM (
        SELECT unnest(assertion.limitations) AS limitation
        FROM public."CandidateAssertion" assertion
        WHERE assertion.id = ANY(upstream_ids)
        UNION ALL
        SELECT unnest(dependency."inheritedLimitations")
        FROM public."CandidateDependency" dependency
        WHERE dependency."assertionId" = ANY(upstream_ids)
      ) inherited
      ORDER BY limitation
    ) INTO required_limitations;
    IF EXISTS (
      SELECT 1 FROM unnest(required_limitations) limitation
      WHERE NOT limitation = ANY(dependency_row."inheritedLimitations")
        OR NOT EXISTS (
          SELECT 1
          FROM public."CandidateAssertion" dependent
          WHERE dependent.id = dependency_row."assertionId"
            AND limitation = ANY(dependent.limitations)
        )
    ) THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;

    SELECT CASE assertion."machineUse"
        WHEN 'quarantined' THEN 0 WHEN 'candidate_only' THEN 1 ELSE 2 END,
      CASE assertion."identityConfidence"
        WHEN 'unresolved' THEN 0 WHEN 'provisional' THEN 1 ELSE 2 END,
      CASE assertion."evidenceLevel"
        WHEN 'no_locator' THEN 0 WHEN 'partial_locator' THEN 1 ELSE 2 END
    INTO dependent_machine_rank, dependent_identity_rank, dependent_evidence_rank
    FROM public."CandidateAssertion" assertion
    WHERE assertion.id = dependency_row."assertionId";
    SELECT min(CASE assertion."machineUse"
        WHEN 'quarantined' THEN 0 WHEN 'candidate_only' THEN 1 ELSE 2 END),
      min(CASE assertion."identityConfidence"
        WHEN 'unresolved' THEN 0 WHEN 'provisional' THEN 1 ELSE 2 END),
      min(CASE assertion."evidenceLevel"
        WHEN 'no_locator' THEN 0 WHEN 'partial_locator' THEN 1 ELSE 2 END)
    INTO weakest_machine_rank, weakest_identity_rank, weakest_evidence_rank
    FROM public."CandidateAssertion" assertion
    WHERE assertion.id = ANY(upstream_ids);
    IF dependent_machine_rank > weakest_machine_rank THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;
    IF dependent_identity_rank > weakest_identity_rank AND NOT EXISTS (
      SELECT 1
      FROM public."CandidateEvidenceLink" evidence
      JOIN public."CandidateContentUnit" content ON content.id = evidence."contentUnitId"
      JOIN public."CandidateAnalysisRunInput" input
        ON input."runId" = assertion_run_id
       AND input."contentUnitId" = content.id
      WHERE evidence."assertionId" = dependency_row."assertionId"
        AND evidence.relation = 'supports'
        AND input."inputHash" = content."contentHash"
        AND (CASE content."identityConfidence"
          WHEN 'unresolved' THEN 0 WHEN 'provisional' THEN 1 ELSE 2 END)
          >= dependent_identity_rank
    ) THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;
    IF dependent_evidence_rank > weakest_evidence_rank AND NOT EXISTS (
      SELECT 1
      FROM public."CandidateEvidenceLink" evidence
      JOIN public."CandidateContentUnit" content ON content.id = evidence."contentUnitId"
      JOIN public."CandidateAnalysisRunInput" input
        ON input."runId" = assertion_run_id
       AND input."contentUnitId" = content.id
      WHERE evidence."assertionId" = dependency_row."assertionId"
        AND evidence.relation = 'supports'
        AND input."inputHash" = content."contentHash"
        AND evidence.locator = content.locator
        AND evidence."locatorHash" = content."locatorHash"
    ) THEN
      RAISE EXCEPTION 'upstream_authority_upgrade';
    END IF;
    INSERT INTO public."CandidateDependency" (
      id, "assertionId", "upstreamAssertionId", relation, "inheritedLimitations"
    ) VALUES (
      dependency_row.id, dependency_row."assertionId",
      dependency_row."upstreamAssertionId", dependency_row.relation,
      dependency_row."inheritedLimitations"
    );
    RETURN jsonb_build_object('dependencyId', dependency_row.id);
  END IF;

  RAISE EXCEPTION 'candidate_writer_operation_invalid';
END
$function$;
