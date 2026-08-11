if (process.argv.length !== 3 || process.argv[2] !== "--probe") {
  process.stderr.write("CONTROLLED_BOOTSTRAP_PROBE_ARGUMENT_REFUSAL\n");
} else {
  process.stderr.write("CONTROLLED_BOOTSTRAP_PROBE_REFUSAL\n");
}
process.exitCode = 1;
