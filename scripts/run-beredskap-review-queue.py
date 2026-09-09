#!/usr/bin/env python3
"""Run a bounded local receipt-verification queue; no model, network, DB or authority.

Manifest: {verifierSha256, policySha256, jobs: [{jobId, packetPath, packetSha256}]}.
All input paths must be absolute. Output directory must be new. Each invocation
rechecks original source bytes; prior output is never used as evidence or cache.
"""
import argparse
import collections
import hashlib
import json
import os
import pathlib
import re
import stat
import types

VERIFIER = pathlib.Path(__file__).with_name("verify-beredskap-review.py")
MAX_JOBS = 100
MAX_INPUT_BYTES = 32 * 1024 * 1024
HEX = re.compile(r"[0-9a-f]{64}\Z")
JOB_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,63}\Z")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def strict_json(raw):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("duplicate_json_key:" + key)
            result[key] = value
        return result

    def constant(value):
        raise ValueError("nonfinite_json:" + value)

    return json.loads(raw, object_pairs_hook=pairs, parse_constant=constant)


def read_input(path):
    path = pathlib.Path(path)
    if not path.is_absolute():
        raise ValueError("input_path_must_be_absolute")
    # Nonblocking open avoids hanging on FIFOs; reject non-regular inputs.
    fd = os.open(path, os.O_RDONLY | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as stream:
        if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
            raise ValueError("input_must_be_regular_file")
        raw = stream.read(MAX_INPUT_BYTES + 1)
    if len(raw) > MAX_INPUT_BYTES:
        raise ValueError("input_too_large")
    return raw


def new_output(path):
    path = pathlib.Path(path)
    if not path.is_absolute() or ".." in path.parts:
        raise ValueError("output_requires_absolute_path_without_parent_traversal")
    if any(p.is_symlink() for p in (path, *path.parents)):
        raise ValueError("output_symlink_forbidden")
    # Parent must already exist; never create an unreviewed directory hierarchy.
    path.mkdir(mode=0o700, exist_ok=False)
    return path


def hash_dependency(path):
    # Source archives may exceed the JSON-input bound; hash them in chunks.
    fd = os.open(path, os.O_RDONLY | os.O_NONBLOCK)
    with os.fdopen(fd, "rb") as stream:
        if not stat.S_ISREG(os.fstat(stream.fileno()).st_mode):
            raise ValueError("dependency_must_be_regular_file")
        digest = hashlib.sha256()
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def write_new(directory, name, value):
    with (directory / name).open("x", encoding="utf-8") as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2, allow_nan=False)
        stream.write("\n")
    (directory / name).chmod(0o444)


def load_verifier():
    raw = VERIFIER.read_bytes()
    module = types.ModuleType("beredskap_queue_verifier")
    module.__file__ = str(VERIFIER)
    # Execute precisely the code whose bytes are recorded, not a stale pyc.
    exec(compile(raw, str(VERIFIER), "exec"), module.__dict__)
    return module, sha(raw), module.sha(module.canonical(module.POLICY))


def validate_manifest(manifest, max_jobs, verifier_hash, policy_hash):
    if not isinstance(manifest, dict):
        raise ValueError("manifest_must_be_object")
    if manifest.get("verifierSha256") != verifier_hash:
        raise ValueError("verifier_binding_changed_new_review_required")
    if manifest.get("policySha256") != policy_hash:
        raise ValueError("policy_binding_changed_new_review_required")
    jobs = manifest.get("jobs")
    if not isinstance(jobs, list) or not 1 <= len(jobs) <= max_jobs:
        raise ValueError("invalid_queue_size")
    ids = set()
    for job in jobs:
        if not isinstance(job, dict):
            raise ValueError("job_must_be_object")
        jid = job.get("jobId")
        if not isinstance(jid, str) or not JOB_ID.fullmatch(jid) or jid.lower() in ids:
            raise ValueError("invalid_or_duplicate_job_id")
        # APFS and other supported filesystems can be case insensitive.
        ids.add(jid.lower())
        if not isinstance(job.get("packetPath"), str) or not pathlib.Path(job["packetPath"]).is_absolute():
            raise ValueError("packet_path_must_be_absolute")
        if not isinstance(job.get("packetSha256"), str) or not HEX.fullmatch(job["packetSha256"]):
            raise ValueError("invalid_packet_hash")
    return jobs


def dependencies(packet):
    """Inventory the same file dependencies checked by the existing verifier."""
    paths = [packet["baselinePath"]]
    for source in packet.get("sources", []):
        if source.get("status") == "bound":
            paths.extend([source["rawPath"], source["textPath"]])
    for review in packet.get("reviews", []):
        for item in review.get("supplementalEvidence", []):
            paths.extend([item["rawPath"], item["textPath"]])
    result = {}
    for path in paths:
        if not isinstance(path, str) or not pathlib.Path(path).is_absolute():
            raise ValueError("dependency_path_must_be_absolute")
        try:
            result[path] = hash_dependency(path)
        except OSError:
            result[path] = None
    return result


def run_job(job, verifier, verifier_hash, policy_hash):
    result = dict(job, status="invalid_input", newReviewRequired=True,
                  verifierSha256=verifier_hash, policySha256=policy_hash)
    try:
        raw = read_input(job["packetPath"])
        result["actualPacketSha256"] = sha(raw)
        if result["actualPacketSha256"] != job["packetSha256"]:
            result.update(status="input_changed", errors=["packet_changed_new_review_required"])
            return result
        packet = strict_json(raw)
        if not isinstance(packet, dict):
            raise ValueError("packet_must_be_object")
        before = dependencies(packet)
        verification = verifier.verify(packet)
        after = dependencies(packet)
        result.update(verification=verification, dependencySha256=after)
        result["status"] = "passed" if verification["ok"] else "failed"
        if before != after or sha(read_input(job["packetPath"])) != sha(raw):
            result.update(status="input_changed", errors=["input_changed_during_verification"])
        if sha(VERIFIER.read_bytes()) != verifier_hash:
            result.update(status="input_changed", errors=["verifier_changed_during_verification"])
        result["newReviewRequired"] = result["status"] != "passed"
    except FileNotFoundError:
        result.update(status="missing_input", errors=["packet_missing"])
    except (OSError, ValueError, TypeError, KeyError, AttributeError, RecursionError) as error:
        result.update(status="invalid_input", errors=[type(error).__name__ + ":" + str(error)])
    return result


def run_queue(manifest_path, output_dir, max_jobs=20):
    if type(max_jobs) is not int or not 1 <= max_jobs <= MAX_JOBS:
        raise ValueError("max_jobs_must_be_1_to_100")
    output = new_output(output_dir)
    verifier, verifier_hash, policy_hash = load_verifier()
    summary = {"authority": "internal_analysis_only", "humanReview": "not_performed",
               "canonicalStatus": "unchanged", "publicationStatus": "unchanged",
               "readinessStatus": "unchanged", "semanticTruthVerified": False,
               "verifierSha256": verifier_hash, "policySha256": policy_hash,
               "queueRunnerSha256": sha(pathlib.Path(__file__).read_bytes()), "jobs": []}
    try:
        raw = read_input(manifest_path)
        summary["manifestSha256"] = sha(raw)
        jobs = validate_manifest(strict_json(raw), max_jobs, verifier_hash, policy_hash)
        for job in jobs:
            result = run_job(job, verifier, verifier_hash, policy_hash)
            name = "job-" + job["jobId"] + ".json"
            write_new(output, name, result)
            summary["jobs"].append({"jobId": job["jobId"], "status": result["status"],
                                    "resultFile": name, "resultSha256": sha((output / name).read_bytes())})
        summary["status"] = "passed" if all(j["status"] == "passed" for j in summary["jobs"]) else "failed"
        if read_input(manifest_path) != raw:
            summary.update(status="input_changed", errors=["manifest_changed_during_run"])
    except FileNotFoundError:
        summary.update(status="missing_input", errors=["manifest_missing"])
    except (OSError, ValueError, TypeError, KeyError, AttributeError, RecursionError) as error:
        summary.update(status="invalid_input", errors=[type(error).__name__ + ":" + str(error)])
    summary["counts"] = dict(collections.Counter(j["status"] for j in summary["jobs"]))
    write_new(output, "summary.json", summary)
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, type=pathlib.Path)
    parser.add_argument("--output-dir", required=True, type=pathlib.Path)
    parser.add_argument("--max-jobs", type=int, default=20)
    args = parser.parse_args()
    try:
        result = run_queue(args.manifest, args.output_dir, args.max_jobs)
    except (OSError, ValueError) as error:
        parser.exit(2, str(error) + "\n")
    print(json.dumps({"status": result["status"], "counts": result["counts"]}))
    return 0 if result["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
