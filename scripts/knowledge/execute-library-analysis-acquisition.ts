#!/usr/bin/env node

import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export type LibraryAnalysisAcquisitionExecutionCliOptions = {
  plan: string;
  runRoot: string;
  mode: "check_only" | "execute_network";
};

export function parseLibraryAnalysisAcquisitionExecutionArgs(
  arguments_: readonly string[],
): LibraryAnalysisAcquisitionExecutionCliOptions {
  let plan: string | null = null;
  let runRoot: string | null = null;
  let checkOnly = false;
  let executeNetwork = false;
  for (const argument of arguments_) {
    if (argument.startsWith("--plan=")) {
      if (plan !== null) throw new Error("acquisition_execution_plan_duplicate");
      plan = parsePrivateAbsolutePath(argument.slice("--plan=".length));
      continue;
    }
    if (argument.startsWith("--run-root=")) {
      if (runRoot !== null) throw new Error("acquisition_execution_root_duplicate");
      runRoot = parsePrivateAbsolutePath(argument.slice("--run-root=".length));
      continue;
    }
    if (argument === "--check-only") {
      if (checkOnly) throw new Error("acquisition_execution_mode_duplicate");
      checkOnly = true;
      continue;
    }
    if (argument === "--execute-network") {
      if (executeNetwork) throw new Error("acquisition_execution_mode_duplicate");
      executeNetwork = true;
      continue;
    }
    throw new Error("acquisition_execution_argument_unknown");
  }
  if (checkOnly && executeNetwork) {
    throw new Error("execution_modes_mutually_exclusive");
  }
  if (!checkOnly && !executeNetwork) {
    throw new Error("explicit_execution_mode_required");
  }
  if (plan === null || runRoot === null || plan === runRoot) {
    throw new Error("acquisition_execution_arguments_invalid");
  }
  return {
    plan,
    runRoot,
    mode: checkOnly ? "check_only" : "execute_network",
  };
}

function parsePrivateAbsolutePath(value: string): string {
  if (
    value.length === 0 ||
    !isAbsolute(value) ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new Error("acquisition_execution_path_invalid");
  }
  return resolve(value);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.stderr.write("library_analysis_acquisition_execution_not_implemented\n");
  process.exitCode = 1;
}
