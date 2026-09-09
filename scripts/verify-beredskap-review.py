#!/usr/bin/env python3
"""Validate private AI review receipts without granting authority or changing data.

Input: {observations: original rows, sources: bound file descriptors, reviews: receipts}.
All original observations must receive one receipt, including explicit evidence gaps.
This verifies receipt integrity and coverage, not whether an AI judgment is correct.
"""
import argparse
import collections
import hashlib
import json
import pathlib

POLICY = {"id": "internal-semantic-receipt-v2", "authority": "internal_analysis_only",
          "targetProfile": "internal_beredskap_working", "semanticTruthCheck": False}


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def sha(data):
    return hashlib.sha256(data).hexdigest()


def _verify(packet):
    errors = []
    policy_hash = sha(canonical(POLICY))
    if canonical(packet.get("policy")) != canonical(POLICY) or packet.get("policySha256") != policy_hash:
        errors.append("invalid_policy_binding")
    if not nonempty(packet.get("runId")):
        errors.append("missing_run_id")
    def unique(rows, key, kind):
        ids = [row.get(key) for row in rows]
        if any(not nonempty(i) for i in ids) or len(set(ids)) != len(ids):
            errors.append(kind + ":missing_or_duplicate_id")
        return {row.get(key): row for row in rows}
    observations = unique(packet.get("observations", []), "observationId", "observations")
    try:
        baseline_raw = pathlib.Path(packet["baselinePath"]).read_bytes()
        if sha(baseline_raw) != packet.get("baselineSha256") or canonical(json.loads(baseline_raw)) != canonical(packet.get("observations")):
            raise ValueError("baseline_mismatch")
    except (KeyError, OSError, ValueError):
        errors.append("baseline_missing_or_changed")
    sources = unique(packet.get("sources", []), "sourceId", "sources")
    reviews = unique(packet.get("reviews", []), "observationId", "reviews")
    if not observations:
        errors.append("no_observations")
    if set(observations) != set(reviews):
        errors.append("review_coverage_mismatch")
    valid_sources = set()
    for sid, source in sources.items():
        if source.get("status") == "unavailable":
            if not nonempty(source.get("reason")):
                errors.append(str(sid) + ":unexplained_unavailable")
            continue
        if source.get("status") != "bound":
            errors.append(str(sid) + ":invalid_source_status")
            continue
        valid = True
        for path_key, hash_key in (("rawPath", "rawSha256"), ("textPath", "textSha256")):
            try:
                raw = pathlib.Path(source[path_key]).read_bytes()
                actual = sha(raw)
                if path_key == "rawPath" and raw.startswith(b"\x89PNG") and source.get("contentKind") != "image_ocr":
                    raise ValueError("image_not_text_source")
                if actual != source.get(hash_key):
                    raise ValueError("hash_mismatch")
            except (KeyError, OSError, ValueError):
                errors.append(str(sid) + ":" + path_key + ":unavailable_or_changed")
                valid = False
        if valid:
            valid_sources.add(sid)
    for oid, review in reviews.items():
        prefix = str(oid) + ":"
        original = observations.get(oid)
        if not original:
            continue
        if not nonempty(original.get("claim")):
            errors.append(prefix + "invalid_original_claim")
            continue
        if review.get("claimSha256") != sha(original["claim"].encode()):
            errors.append(prefix + "stale_claim")
        if review.get("observationSha256") != sha(canonical(original)):
            errors.append(prefix + "stale_observation")
        if review.get("runId") != packet.get("runId") or review.get("policySha256") != policy_hash or review.get("targetProfile") != POLICY["targetProfile"]:
            errors.append(prefix + "stale_run_policy_or_target")
        if review.get("outcome") not in {"supported_with_limits", "contradicted", "insufficient_evidence"}:
            errors.append(prefix + "invalid_outcome")
        if not nonempty(review.get("rationale")) or not nonempty(review.get("reviewer")):
            errors.append(prefix + "missing_reason_or_reviewer")
        if review.get("authority") != "internal_analysis_only":
            errors.append(prefix + "authority_escalation")
        if review.get("modelVersionAttested") is not False:
            errors.append(prefix + "unsupported_model_attestation")
        refs = review.get("evidence", [])
        original_refs = {r["sourceId"] for r in original.get("sourceRefs", [])}
        if any(not nonempty(sid) for sid in original_refs):
            errors.append(prefix + "invalid_original_source_ref")
        evidence_ids = [r.get("sourceId") for r in refs]
        unreviewed_ids = [r.get("sourceId") for r in review.get("unreviewedRefs", [])]
        if len(set(evidence_ids)) != len(evidence_ids) or len(set(unreviewed_ids)) != len(unreviewed_ids) or set(evidence_ids) & set(unreviewed_ids):
            errors.append(prefix + "duplicate_or_conflicting_refs")
        accounted = set(evidence_ids) | set(unreviewed_ids)
        if accounted != original_refs:
            errors.append(prefix + "source_coverage_mismatch")
        for ref in review.get("unreviewedRefs", []):
            if not nonempty(ref.get("reason")):
                errors.append(prefix + "unexplained_unreviewed_ref")
        for ref in refs:
            sid = ref.get("sourceId")
            if sid not in valid_sources:
                errors.append(prefix + "unbound_review_evidence:" + str(sid))
                continue
            if ref.get("rawSha256") != sources[sid]["rawSha256"] or ref.get("textSha256") != sources[sid]["textSha256"]:
                errors.append(prefix + "stale_evidence_hash:" + str(sid))
            if not nonempty(ref.get("locator")) or not nonempty(ref.get("readScope")):
                errors.append(prefix + "missing_locator_or_scope:" + str(sid))
        supplements = review.get("supplementalEvidence", [])
        supplement_ids = [item.get("artifactId") for item in supplements]
        if any(not nonempty(item) for item in supplement_ids) or len(set(supplement_ids)) != len(supplement_ids):
            errors.append(prefix + "invalid_supplement_ids")
        for item in supplements:
            if item.get("parentSourceId") not in original_refs:
                errors.append(prefix + "unrelated_supplement")
            if not nonempty(item.get("locator")) or not nonempty(item.get("readScope")) or not nonempty(item.get("reason")):
                errors.append(prefix + "missing_supplement_scope")
            for path_key, hash_key in (("rawPath", "rawSha256"), ("textPath", "textSha256")):
                try:
                    payload = pathlib.Path(item[path_key]).read_bytes()
                    if sha(payload) != item.get(hash_key) or payload.startswith(b"\x89PNG"):
                        raise ValueError("invalid_supplement_content")
                except (KeyError, OSError, ValueError):
                    errors.append(prefix + "supplement_unavailable_or_changed:" + path_key)
        if review.get("outcome") != "insufficient_evidence" and not refs:
            errors.append(prefix + "judgment_without_evidence")
    return {"ok": not errors, "errors": errors,
            "observationCount": len(observations), "reviewCount": len(reviews),
            "boundSourceCount": len(valid_sources),
            "outcomes": dict(collections.Counter(r.get("outcome") for r in reviews.values())),
            "receiptIntegrity": "passed" if not errors else "failed",
            "semanticTruthVerifiedByThisScript": False,
            "modelVersionAttested": False, "independentModelValidation": "not_attested",
            "authority": "internal_analysis_only", "productionQualification": "not_granted",
            "humanReview": "not_performed", "publicationStatus": "unchanged"}


def verify(packet):
    try:
        return _verify(packet)
    except (TypeError, AttributeError, KeyError, ValueError) as error:
        return {"ok": False, "errors": ["malformed_packet:" + type(error).__name__],
                "receiptIntegrity": "failed", "semanticTruthVerifiedByThisScript": False,
                "authority": "internal_analysis_only", "humanReview": "not_performed",
                "publicationStatus": "unchanged"}


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", type=pathlib.Path, required=True)
    p.add_argument("--output", type=pathlib.Path, required=True)
    args = p.parse_args()
    raw = args.input.read_bytes()
    result = verify(json.loads(raw))
    result["inputSha256"] = sha(raw)
    result["verifierSha256"] = sha(pathlib.Path(__file__).read_bytes())
    with args.output.open("x") as stream:
        json.dump(result, stream, ensure_ascii=False, indent=2)
        stream.write("\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["ok"] else 1)
