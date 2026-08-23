#!/usr/bin/env node

const context = process.argv[2] ?? "candidate database operation";
const names = Object.keys(process.env)
  .filter((name) => /^PG[A-Z0-9_]*$/.test(name))
  .sort();

if (names.length > 0) {
  for (const name of names) {
    console.error(`[candidate-libpq-env] ERROR: ${context}: ${name} is not permitted`);
  }
  process.exit(1);
}
