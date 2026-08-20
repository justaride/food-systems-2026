\set ON_ERROR_STOP on

SELECT set_config(
  'foodsystems.candidate_expected_checker_sha256',
  :'expected_checker_sha256',
  false
) AS candidate_expected_checker_sha256
\gset
SELECT set_config(
  'foodsystems.candidate_expected_graph_sha256',
  :'expected_graph_sha256',
  false
) AS candidate_expected_graph_sha256
\gset

DO $candidate_security_attestation$
DECLARE
  actual_checker_sha256 TEXT;
  drift_code TEXT;
BEGIN
  IF current_setting('server_version_num')::INTEGER / 10000 <> 16 THEN
    RAISE EXCEPTION 'candidate_security_postgres_major_drift';
  END IF;

  WITH required(ordinal, signature) AS (
    VALUES
      (1, 'public.candidate_security_routine_descriptor(oid)'),
      (2, 'public.candidate_security_trigger_descriptor(oid)'),
      (3, 'public.candidate_security_checker_descriptor()'),
      (4, 'public.candidate_security_graph_descriptor()'),
      (5, 'public.candidate_security_graph_drift(text,text)')
  ), routine_descriptor AS (
    SELECT required.ordinal, required.signature, string_agg(
      field.name || '=' || encode(convert_to(field.value, 'UTF8'), 'base64'),
      E'\n' ORDER BY field.ordinal
    ) AS value
    FROM required
    LEFT JOIN pg_proc procedure
      ON procedure.oid = to_regprocedure(required.signature)
    LEFT JOIN pg_namespace namespace ON namespace.oid = procedure.pronamespace
    LEFT JOIN pg_language language ON language.oid = procedure.prolang
    CROSS JOIN LATERAL (VALUES
      (1, 'schema', COALESCE(namespace.nspname, '')),
      (2, 'name', COALESCE(procedure.proname, '')),
      (3, 'identity_arguments', COALESCE(
        pg_get_function_identity_arguments(procedure.oid), ''
      )),
      (4, 'argument_modes', COALESCE(procedure.proargmodes::TEXT, '')),
      (5, 'return_type', COALESCE(pg_get_function_result(procedure.oid), '')),
      (6, 'returns_set', COALESCE(procedure.proretset::TEXT, '')),
      (7, 'prokind', COALESCE(procedure.prokind::TEXT, '')),
      (8, 'language', COALESCE(language.lanname, '')),
      (9, 'probin', COALESCE(procedure.probin, '')),
      (10, 'prosrc', COALESCE(procedure.prosrc, '')),
      (11, 'prosqlbody', COALESCE(procedure.prosqlbody::TEXT, '')),
      (12, 'owner_is_database_owner', COALESCE((
        procedure.proowner = (
          SELECT database.datdba FROM pg_database database
          WHERE database.datname = current_database()
        )
      )::TEXT, '')),
      (13, 'security_definer', COALESCE(procedure.prosecdef::TEXT, '')),
      (14, 'strict', COALESCE(procedure.proisstrict::TEXT, '')),
      (15, 'leakproof', COALESCE(procedure.proleakproof::TEXT, '')),
      (16, 'volatility', COALESCE(procedure.provolatile::TEXT, '')),
      (17, 'parallel', COALESCE(procedure.proparallel::TEXT, '')),
      (18, 'config', COALESCE((
        SELECT string_agg(setting, E'\x1f' ORDER BY setting COLLATE "C")
        FROM unnest(procedure.proconfig) setting
      ), '')),
      (19, 'public_execute', COALESCE(EXISTS (
        SELECT 1
        FROM aclexplode(COALESCE(
          procedure.proacl,
          acldefault('f', procedure.proowner)
        )) privilege
        WHERE privilege.grantee = 0
          AND privilege.privilege_type = 'EXECUTE'
      )::TEXT, ''))
    ) AS field(ordinal, name, value)
    GROUP BY required.ordinal, required.signature
  ), checker_descriptor AS (
    SELECT string_agg(
      routine_descriptor.signature || E'\x1e' || COALESCE(
        NULLIF(routine_descriptor.value, ''), 'missing'
      ),
      E'\x1f' ORDER BY routine_descriptor.ordinal
    ) AS value
    FROM routine_descriptor
  )
  SELECT encode(sha256(convert_to(value, 'UTF8')), 'hex')
  INTO actual_checker_sha256
  FROM checker_descriptor;

  IF actual_checker_sha256 IS DISTINCT FROM current_setting(
    'foodsystems.candidate_expected_checker_sha256'
  ) THEN
    RAISE EXCEPTION 'candidate_security_checker_drift';
  END IF;

  drift_code := public.candidate_security_graph_drift(
    current_setting('foodsystems.candidate_expected_checker_sha256'),
    current_setting('foodsystems.candidate_expected_graph_sha256')
  );
  IF drift_code IS NOT NULL THEN
    IF drift_code LIKE 'candidate_trigger_%' THEN
      RAISE EXCEPTION 'candidate trigger drift: %', drift_code;
    END IF;
    RAISE EXCEPTION '%', drift_code;
  END IF;
END
$candidate_security_attestation$;
