import {
  canonicalRuntimeJson,
  computeSourceRegistrationRuntimeAttestation,
  createSourceRegistrationExecutionSnapshot,
  removeSourceRegistrationExecutionSnapshot,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const before = computeSourceRegistrationRuntimeAttestation();
const snapshot = createSourceRegistrationExecutionSnapshot();
try {
  const after = computeSourceRegistrationRuntimeAttestation({
    projectRoot: snapshot.projectRoot,
  });
  process.stdout.write(
    `${JSON.stringify({
      equal: canonicalRuntimeJson(before) === canonicalRuntimeJson(after),
      localClosureSha256: after.localClosure.closureSha256,
      nodeModulesTreeSha256: after.nodeModules.treeSha256,
      prismaGeneratedClientTreeSha256: after.prismaGeneratedClient.treeSha256,
    })}\n`,
  );
} finally {
  removeSourceRegistrationExecutionSnapshot(snapshot.snapshotRoot);
}
