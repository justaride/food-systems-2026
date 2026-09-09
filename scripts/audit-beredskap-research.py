#!/usr/bin/env python3
"""Read-only source audit. Writes a NEW private run directory; never touches the DB.

This is a deterministic preflight for AI review, not semantic or human approval.
Usage: python3 scripts/audit-beredskap-research.py --package PATH --output NEW_PATH
"""
import argparse
import collections
import hashlib
import json
import pathlib
import re
import shutil

POLICY = {
    "id": "beredskap-internal-preflight-v1",
    "scope": "metadata, exact local bytes, references and review routing",
    "semanticReview": "not_performed",
    "humanReview": "not_performed",
    "productionQualification": "not_assessed",
    "authority": "internal_analysis_only",
    "rules": ["unique_ids", "local_source_refs", "nonempty_locators",
              "declared_sha256_matches_bytes", "preserve_prior_assessment",
              "no_inferred_gap_closure", "no_authority_transition"],
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()


def inspect_source(source):
    path = pathlib.Path(source["archivePath"]) if source.get("archivePath") else None
    expected = source.get("sha256")
    actual = digest(path.read_bytes()) if path and path.is_file() else None
    if expected and not re.fullmatch(r"[a-fA-F0-9]{64}", expected):
        state = "invalid_declared_hash"
    elif expected and actual and expected.lower() != actual:
        state = "hash_mismatch"
    elif expected and actual:
        state = "bytes_match"
    elif expected:
        state = "archive_unavailable"
    else:
        state = "content_not_bound"
    return {"sourceId": source["sourceId"], "title": source.get("title"),
            "url": source.get("url"), "priorReadStatus": source.get("readStatus"),
            "priorReadScope": source.get("readScope"), "declaredSha256": expected,
            "observedSha256": actual, "archivePath": str(path) if path else None,
            "integrity": state, "semanticReview": "not_performed"}


def inspect_observation(observation, sources, duplicate_sources=()):
    refs = observation.get("sourceRefs") or []
    errors = []
    if not refs:
        errors.append("no_source_refs")
    for ref in refs:
        sid = ref.get("sourceId")
        if sid not in sources or sid in duplicate_sources:
            errors.append("unresolved_or_ambiguous_source:" + str(sid))
        if not str(ref.get("locator") or "").strip():
            errors.append("missing_locator:" + str(sid))
    referenced = [sources[r["sourceId"]] for r in refs if r.get("sourceId") in sources]
    blockers = sorted({s["integrity"] for s in referenced if s["integrity"] != "bytes_match"})
    if errors:
        route = "repair_references"
    elif any(s in blockers for s in ("hash_mismatch", "invalid_declared_hash")):
        route = "resolve_source_identity"
    elif blockers:
        route = "capture_source_content"
    elif any(s["priorReadStatus"] != "fulltekst_relevant_del" for s in referenced):
        route = "expand_read_scope"
    else:
        route = "prepare_semantic_review"
    return {"observationId": observation["observationId"],
            "questionId": observation.get("questionId"), "claim": observation.get("claim"),
            "priorAssessment": observation.get("assessment"), "sourceRefs": refs,
            "route": route, "referenceErrors": errors, "contentBlockers": blockers,
            "semanticReview": "not_performed", "authority": "internal_analysis_only"}


def audit(package, output):
    # Never overwrite a prior run, including a partially completed run.
    output.mkdir(parents=True, exist_ok=False)
    (output / "inputs").mkdir()
    (output / "archives").mkdir()
    documents, input_hashes = [], []
    for track in ("A1", "A2", "A3", "A4", "A5"):
        path = package / "resultater" / track / "data.json"
        raw = path.read_bytes()
        data = json.loads(raw)
        if data.get("templateOnly") or data.get("trackId") != track:
            raise ValueError("Not a completed track payload: " + track)
        (output / "inputs" / (track + ".json")).write_bytes(raw)
        input_hashes.append({"file": str(path), "sha256": digest(raw)})
        documents.append(data)
    all_sources = [s for d in documents for s in d["sources"]]
    counts = collections.Counter(s["sourceId"] for s in all_sources)
    duplicates = sorted(k for k, v in counts.items() if v > 1)
    source_rows = [inspect_source(s) for s in all_sources]
    by_id = {s["sourceId"]: s for s in source_rows}
    for row in source_rows:
        # Preserve observed files, including mismatches; never bless the declared hash.
        if row["observedSha256"]:
            archive = output / "archives" / row["observedSha256"]
            if not archive.exists():
                shutil.copyfile(row["archivePath"], archive)
            if digest(archive.read_bytes()) != row["observedSha256"]:
                raise ValueError("Source changed while copying: " + row["sourceId"])
            row["preservedPath"] = str(archive)
    observations = [inspect_observation(o, by_id, duplicates)
                    for d in documents for o in d["observations"]]
    obs_ids = collections.Counter(o["observationId"] for o in observations)
    duplicate_obs = sorted(k for k, v in obs_ids.items() if v > 1)
    for observation in observations:
        if observation["observationId"] in duplicate_obs:
            observation["referenceErrors"].append("duplicate_observation_id")
            observation["route"] = "repair_references"
    gaps = [{"trackId": d["trackId"], **g, "closure": "not_inferred"}
            for d in documents for g in d["gaps"]]
    tracks = [{"track": d["trackId"], "sourceRecords": len(d["sources"]),
               "observations": len(d["observations"]), "gaps": len(d["gaps"])} for d in documents]
    summary = {"sourceRecords": len(source_rows), "observations": len(observations),
               "gaps": len(gaps), "integrity": dict(collections.Counter(s["integrity"] for s in source_rows)),
               "routes": dict(collections.Counter(o["route"] for o in observations)),
               "priorReadStatus": dict(collections.Counter(s["priorReadStatus"] for s in source_rows)),
               "priorAssessment": dict(collections.Counter(o["priorAssessment"] for o in observations)),
               "duplicateSourceIds": duplicates, "duplicateObservationIds": duplicate_obs,
               "referenceErrorCount": sum(len(o["referenceErrors"]) for o in observations),
               "semanticReviewsPerformed": 0, "authority": "internal_analysis_only"}
    result = {"policy": POLICY, "policySha256": digest(encoded(POLICY)),
              "scriptSha256": digest(pathlib.Path(__file__).read_bytes()),
              "inputs": input_hashes, "summary": summary, "tracks": tracks,
              "sources": source_rows, "observations": observations, "gaps": gaps}
    (output / "audit.json").write_bytes(encoded(result))
    (output / "policy.json").write_bytes(encoded(POLICY))
    seals = []
    for path in sorted(output.rglob("*")):
        if path.is_file():
            seals.append(digest(path.read_bytes()) + "  " + str(path.relative_to(output)))
    (output / "SHA256SUMS.txt").write_text("\n".join(seals) + "\n")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package", type=pathlib.Path, required=True)
    parser.add_argument("--output", type=pathlib.Path, required=True)
    args = parser.parse_args()
    print(json.dumps(audit(args.package, args.output)["summary"], ensure_ascii=False, indent=2))
