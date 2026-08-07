import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import {
  canonicalLogicalStateJson,
  computeDatabaseLogicalStateDigest,
  logicalStateSha256,
  resolveExecutable,
} from "../../scripts/knowledge/database-logical-state-digest.mjs";

const fixtureRoot = mkdtempSync(join(tmpdir(), "database-logical-digest-"));
const fakePsqlPath = join(fixtureRoot, "psql");

writeFileSync(
  fakePsqlPath,
  `#!${process.execPath}
const sqlIndex = process.argv.indexOf("-c");
const sql = sqlIndex >= 0 ? process.argv[sqlIndex + 1] : "";
const databaseName = process.env.PGDATABASE || "";

if (process.env.UNTRUSTED_SENTINEL || process.env.PGSERVICE) {
  process.stderr.write("inherited uncontrolled environment");
  process.exit(3);
}

if (databaseName === "leak") {
  process.stderr.write("postgresql://operator:must-not-leak@example.invalid/db /private/secret/archive");
  process.exit(9);
}

if (sql.includes("pg_control_system")) {
  process.stdout.write(JSON.stringify({
    databaseName,
    databaseRole: process.env.PGUSER,
    serverAddress: "127.0.0.1/32",
    serverPort: Number(process.env.PGPORT),
    serverVersionNum: "160013",
    systemIdentifier: "7620055716543368057",
    largeObjectCount: databaseName === "large" ? 1 : 0,
  }) + "\\n");
} else if (sql.includes("FROM pg_class")) {
  const relations = databaseName === "empty" ? [] : databaseName === "unsafe"
    ? [{schemaName: "public", relationName: "Unsafe;Name", relationKind: "r", qualifiedName: 'public."Unsafe;Name"'}]
    : [
        {schemaName: "public", relationName: "Alpha", relationKind: "r", qualifiedName: 'public."Alpha"'},
        {schemaName: "public", relationName: "Beta", relationKind: "r", qualifiedName: 'public."Beta"'},
      ];
  process.stdout.write(JSON.stringify(relations) + "\\n");
} else if (sql.includes('FROM public."Alpha"')) {
  const value = databaseName === "tamper" ? "changed" : "stable";
  process.stdout.write(JSON.stringify({id: 1, value}) + "\\n");
  process.stdout.write(JSON.stringify({id: 2, value: null}) + "\\n");
} else if (sql.includes('FROM public."Beta"')) {
  process.stdout.write(JSON.stringify({enabled: true, id: "b"}) + "\\n");
} else if (sql.includes("FROM pg_sequences")) {
  process.stdout.write("");
} else {
  process.stderr.write("unexpected SQL");
  process.exitCode = 2;
}
`,
  { encoding: "utf8", mode: 0o700 },
);
chmodSync(fakePsqlPath, 0o700);

test.after(() => rmSync(fixtureRoot, { force: true, recursive: true }));

test("canonical JSON and bare SHA-256 are deterministic", () => {
  assert.equal(
    canonicalLogicalStateJson({ z: [2, { b: true, a: null }], a: "first" }),
    '{"a":"first","z":[2,{"a":null,"b":true}]}',
  );
  assert.equal(
    logicalStateSha256("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("content digest is target-independent while the sealed manifest is not", async () => {
  const source = await computeDatabaseLogicalStateDigest({
    databaseUrl:
      "postgresql://foodsystems:private-secret@127.0.0.1:5432/foodsystems",
    psqlPath: fakePsqlPath,
  });
  const restored = await computeDatabaseLogicalStateDigest({
    databaseUrl: "postgresql://foodsystems:private-secret@127.0.0.1:5432/clone",
    psqlPath: fakePsqlPath,
  });

  assert.equal(source.relationCount, 2);
  assert.deepEqual(
    source.relations.map(
      (relation: { relationName: string; rowCount: number }) => [
        relation.relationName,
        relation.rowCount,
      ],
    ),
    [
      ["Alpha", 2],
      ["Beta", 1],
    ],
  );
  assert.equal(source.sequences.rowCount, 0);
  assert.equal(source.contentStateSha256, restored.contentStateSha256);
  assert.notEqual(source.logicalStateSha256, restored.logicalStateSha256);
  assert.equal(source.databaseTarget.databaseName, "foodsystems");
  assert.equal(restored.databaseTarget.databaseName, "clone");
  assert.equal(JSON.stringify(source).includes("private-secret"), false);
});

test("one changed row changes the content digest", async () => {
  const source = await computeDatabaseLogicalStateDigest({
    databaseUrl: "postgresql://foodsystems:secret@127.0.0.1/foodsystems",
    psqlPath: fakePsqlPath,
  });
  const tampered = await computeDatabaseLogicalStateDigest({
    databaseUrl: "postgresql://foodsystems:secret@127.0.0.1/tamper",
    psqlPath: fakePsqlPath,
  });
  assert.notEqual(source.contentStateSha256, tampered.contentStateSha256);
});

test("psql receives a minimal environment instead of inherited service state", async () => {
  const priorSentinel = process.env.UNTRUSTED_SENTINEL;
  const priorService = process.env.PGSERVICE;
  process.env.UNTRUSTED_SENTINEL = "must-not-reach-child";
  process.env.PGSERVICE = "must-not-override-explicit-target";
  try {
    const digest = await computeDatabaseLogicalStateDigest({
      databaseUrl: "postgresql://foodsystems:secret@127.0.0.1/foodsystems",
      psqlPath: fakePsqlPath,
    });
    assert.equal(digest.databaseTarget.databaseName, "foodsystems");
  } finally {
    if (priorSentinel === undefined) delete process.env.UNTRUSTED_SENTINEL;
    else process.env.UNTRUSTED_SENTINEL = priorSentinel;
    if (priorService === undefined) delete process.env.PGSERVICE;
    else process.env.PGSERVICE = priorService;
  }
});

test("large objects, empty inventories, and unsafe relation names fail closed", async () => {
  for (const [databaseName, pattern] of [
    ["large", /large objects are present/],
    ["empty", /relation inventory is empty/],
    ["unsafe", /unsafe or duplicated/],
  ] as const) {
    await assert.rejects(
      computeDatabaseLogicalStateDigest({
        databaseUrl: `postgresql://foodsystems:secret@127.0.0.1/${databaseName}`,
        psqlPath: fakePsqlPath,
      }),
      pattern,
    );
  }
});

test("executable lookup ignores relative PATH entries and resolves the exact file", () => {
  assert.equal(
    resolveExecutable("psql", `relative:${fixtureRoot}`),
    realpathSync(fakePsqlPath),
  );
  assert.throws(
    () => resolveExecutable("psql", "relative:also-relative"),
    /could not resolve executable/,
  );
  assert.throws(
    () => resolveExecutable("../psql", fixtureRoot),
    /bare file name/,
  );
});

test("CLI rejects unknown credential-bearing arguments without echoing them", () => {
  const secretArgument =
    "--database-url=postgresql://operator:must-not-leak@example.invalid/db";
  const result = spawnSync(
    process.execPath,
    [
      resolve(
        process.cwd(),
        "scripts/knowledge/database-logical-state-digest.mjs",
      ),
      secretArgument,
    ],
    {
      encoding: "utf8",
      env: { PATH: process.env.PATH ?? "" } as unknown as NodeJS.ProcessEnv,
    },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown or malformed argument was supplied/);
  assert.equal(result.stderr.includes(secretArgument), false);
  assert.equal(result.stderr.includes("must-not-leak"), false);
});

test("CLI never relays credential- or path-bearing psql stderr", () => {
  const result = spawnSync(
    process.execPath,
    [
      resolve(
        process.cwd(),
        "scripts/knowledge/database-logical-state-digest.mjs",
      ),
    ],
    {
      encoding: "utf8",
      env: {
        DATABASE_URL: "postgresql://foodsystems:database-secret@127.0.0.1/leak",
        PATH: fixtureRoot,
      } as unknown as NodeJS.ProcessEnv,
    },
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /psql failed \(code=9, signal=null\)/);
  for (const secret of [
    "must-not-leak",
    "database-secret",
    "/private/secret/archive",
    "postgresql://",
  ]) {
    assert.equal(result.stderr.includes(secret), false);
  }
});
