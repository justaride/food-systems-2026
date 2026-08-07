import { writeFileSync } from "node:fs";

const callback = `${JSON.stringify({
  evidenceClass: "logical-comparison-surrogate",
  receiptSha256: "a".repeat(64),
  status: "pass",
})}\n`;

const [mode, ...arguments_] = process.argv.slice(2);

function keepAlive() {
  setInterval(() => {}, 1_000);
}

function installCleanupHandler(markerPath, signals) {
  let handled = false;
  for (const signal of signals) {
    process.on(signal, () => {
      if (handled) return;
      handled = true;
      writeFileSync(markerPath, `${signal}\n`, { mode: 0o600 });
      process.exit(0);
    });
  }
}

switch (mode) {
  case "valid":
    process.stdout.write(callback);
    break;
  case "raw-failure":
    process.stdout.write(`${arguments_[0]}\n`);
    process.stderr.write(`${arguments_[1]}\n`);
    process.exitCode = 1;
    break;
  case "controlled-diagnostic":
    process.stderr.write(
      `[logical-restore-companion] ERROR ${arguments_[0]}\n`,
    );
    process.exitCode = 1;
    break;
  case "controlled-diagnostic-extra":
    process.stderr.write(
      `[logical-restore-companion] ERROR ${arguments_[0]}\n${arguments_[1]}\n`,
    );
    process.exitCode = 1;
    break;
  case "controlled-diagnostic-with-stdout":
    process.stdout.write(`${arguments_[1]}\n`);
    process.stderr.write(
      `[logical-restore-companion] ERROR ${arguments_[0]}\n`,
    );
    process.exitCode = 1;
    break;
  case "controlled-diagnostic-wrong-exit":
    process.stderr.write(
      `[logical-restore-companion] ERROR ${arguments_[0]}\n`,
    );
    process.exitCode = 2;
    break;
  case "malformed":
    process.stdout.write('{"evidenceClass":\n');
    break;
  case "extra-output":
    process.stdout.write(`${callback}unexpected-output\n`);
    break;
  case "extra-field":
    process.stdout.write(
      `${JSON.stringify({
        evidenceClass: "logical-comparison-surrogate",
        receiptSha256: "a".repeat(64),
        status: "pass",
        unexpected: true,
      })}\n`,
    );
    break;
  case "overflow": {
    const [markerPath, stream] = arguments_;
    installCleanupHandler(markerPath, ["SIGTERM"]);
    process[stream].write("x".repeat(20_000));
    keepAlive();
    break;
  }
  case "signal-wait": {
    const [cleanupMarkerPath, readyMarkerPath] = arguments_;
    installCleanupHandler(cleanupMarkerPath, ["SIGINT", "SIGTERM"]);
    process.stdout.write(callback);
    writeFileSync(readyMarkerPath, "ready\n", { mode: 0o600 });
    keepAlive();
    break;
  }
  default:
    process.stderr.write("unknown fixture mode\n");
    process.exitCode = 2;
}
