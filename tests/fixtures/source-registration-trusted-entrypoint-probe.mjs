import { closeSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [launcherPath, projectRoot] = process.argv.slice(2);

try {
  const launcher = await import(pathToFileURL(launcherPath).href);
  const trusted = launcher.requireTrustedCompanionLauncherEntrypoint({
    projectRoot,
  });
  closeSync(5);
  closeSync(trusted.descriptor);
  process.stdout.write("TRUSTED_ENTRYPOINT_OK\n");
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : "TRUSTED_ENTRYPOINT_FAILED"}\n`,
  );
  process.exitCode = 1;
}
