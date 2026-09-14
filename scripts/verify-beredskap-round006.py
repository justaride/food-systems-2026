#!/usr/bin/env python3
"""Verify round006 source/candidate integrity and preservation; no semantic or human authority."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / 'docs/project/analysis/source-review-beredskap-2026-09-09/round-006'
BASE = '44e34c60df69c686633008bb11524b91310e7f9a'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        raise FileExistsError('Use a new private verification run directory')
    checks = []

    def check(name, passed):
        checks.append({'check': name, 'passed': bool(passed)})

    def read(name):
        return json.loads((PACKAGE / name).read_text())

    manifest = read('input-manifest.json')
    sources = read('source-bindings.json')['sources']
    by_id = {s['sourceId']: s for s in sources}
    check('17_unique_primary_source_versions', len(sources) == len(by_id) == 17)
    for source in sources:
        sid = source['sourceId']
        for path_key, hash_key in [('rawPath', 'rawSha256'), ('textPath', 'textSha256'), ('acquisitionReceiptPath', 'acquisitionReceiptSha256')]:
            check(sid + ':' + path_key, sha(source[path_key]) == source[hash_key])
        if source.get('supersededTextPath'):
            check(sid + ':initial_text_preserved', sha(source['supersededTextPath']) == source['supersededTextSha256'])
        check(sid + ':private_raw', not Path(source['rawPath']).resolve().is_relative_to(ROOT))
        check(sid + ':version_and_scope', source['status'] == 200 and source['version'] and source['human_verified'] is False and source['specificationValidityConfirmed'] is False)
    evidence = read('evidence-bindings.json')['evidence']

    def valid_ref(ref):
        source = by_id[ref['sourceId']]
        lines = Path(source['textPath']).read_text().splitlines()
        loc = ref['locator']
        if not (1 <= loc['start'] <= loc['end'] <= len(lines)):
            return False
        fragment = '\n'.join(lines[loc['start'] - 1:loc['end']]) + '\n'
        return (bool(loc['label']) and ref['rawSha256'] == source['rawSha256']
                and ref['textSha256'] == source['textSha256']
                and hashlib.sha256(fragment.encode()).hexdigest() == ref['evidenceSha256'])

    for key, ref in evidence.items():
        check('evidence:' + key, valid_ref(ref))
    observations = read('observations.json')['observations']
    check('13_unique_observations', len(observations) == len({o['id'] for o in observations}) == 13)
    for observation in observations:
        body = {k: v for k, v in observation.items() if k != 'candidateSha256'}
        check(observation['id'] + ':candidate_hash', digest(body) == observation['candidateSha256'])
        check(observation['id'] + ':evidence_profile_policy',
              observation['sourceRefs'] and all(valid_ref(r) for r in observation['sourceRefs'])
              and observation['targetProfileSha256'] == sha(PACKAGE / 'target-profile.json')
              and observation['policySha256'] == sha(ROOT / 'AGENTS.md')
              and observation['status'] == 'candidate_only' and observation['human_verified'] is False)
    for entry in manifest['baselines']:
        check('baseline_hash:' + Path(entry['path']).name, sha(entry['path']) == entry['sha256'])
        baseline = json.loads(Path(entry['path']).read_text())
        check('bytes_preserved:' + Path(entry['path']).name,
              all(sha(Path(path) if Path(path).is_absolute() else ROOT / path) == value for path, value in baseline.items()))
        if Path(entry['path']).name == 'predecessor-119-baseline.json':
            check('119_predecessor_files', len(baseline) == 119)
    for key in ['builder', 'policy', 'priorCase']:
        entry = manifest[key]
        path = Path(entry['path'])
        check('manifest:' + key, sha(path if path.is_absolute() else ROOT / path) == entry['sha256'])
    check('manifest_sources', sha(PACKAGE / 'source-bindings.json') == manifest['sourceBindingsSha256'])
    check('manifest_profile', sha(PACKAGE / 'target-profile.json') == manifest['profileSha256'])
    profile = read('target-profile.json')
    prev = PACKAGE.parent / 'round-005'
    check('previous_case_and_protocol_frozen', sha(prev / 'case.json') == profile['previousCaseSha256'] and sha(prev / 'MAALEPROTOKOLL.md') == profile['previousProtocolSha256'])
    check('profile_unknowns', all(profile[k] is None for k in ['numericAcceptanceLimits', 'recipientCurrentProductionAndQ1NeedConfirmed', 'bulkReceptionCompatible', 'nordicAdditionalEffect_t']) and all(x is None for x in profile['productEquivalentToQ1'].values()))
    comparison = read('q1-comparison.json')
    check('12_Q1_rows_no_invented_acceptance_or_batch_values', len(comparison['rows']) == 12 and comparison['equivalence'] is None and all(all(r[k] is None for k in ['acceptedLimit', 'NO_batchResult', 'SE_batchResult']) and all(valid_ref(e) for e in r['sourceRefs']) for r in comparison['rows']))
    protein = next(r for r in comparison['rows'] if r['parameter'] == 'Protein')
    check('nutrition_values_bound_to_exact_bulk_SKUs', protein['NO_public'] == 13 and protein['SE_public'] == 12 and {r['sourceId'] for r in protein['sourceRefs']} == {'R6-S01', 'R6-S02'})
    intake = read('intake-template.json')
    fields = [f for s in intake['sections'] for f in s['fields']]
    check('70_unique_unanswered_intake_fields', len(fields) == len({f['id'] for f in fields}) == 70 and all(f['value'] is None and f['evidence'] is None and f['unitOrFormat'] for f in fields))
    check('intake_unsent_and_bound', not intake['sent'] and not intake['responsesReceived'] and not intake['human_verified'] and intake['targetProfileSha256'] == sha(PACKAGE / 'target-profile.json') and intake['policySha256'] == sha(ROOT / 'AGENTS.md'))
    gaps = read('data-gaps.json')['gaps']
    check('nine_open_linked_gaps', len(gaps) == len({g['id'] for g in gaps}) == 9 and all(g['value'] is None and g['status'] == 'open' and not g['closeOriginalGap'] and set(g['sourceObservationIds']) <= {o['id'] for o in observations} for g in gaps))
    check('intake_covers_each_gap', {s['gapId'] for s in intake['sections']} == {g['id'] for g in gaps})
    delta = read('status-delta.json')
    values = [v for arm in delta['operationalQuantities'].values() for v in arm.values()]
    check('26_operational_quantities_unknown', len(values) == 26 and all(v is None for v in values))
    check('authority_and_prior_stops_unchanged', not any(delta[k] for k in ['human_verified', 'canonicalChanged', 'coverageReadinessChanged']) and not delta['parentGapsClosed'] and delta['unchanged']['Finland2018ResidualsOpen'] == 2 and delta['unchanged']['yieldWarningsOpen'] == 8)
    prior_sources = {s['sourceId']: s for s in json.loads((prev / 'source-bindings.json').read_text())['sources']}
    for current, prior in [('R6-S09', 'R5-S04'), ('R6-S10', 'R5-S16'), ('R6-S11', 'R5-S07')]:
        check('reopened_catalog_identical:' + current, by_id[current]['rawSha256'] == prior_sources[prior]['rawSha256'])
    visual = read('access-review.json')['pdfVisualReview']
    check('ten_source_pages_visually_reviewed', len(visual) == 10 and all(v['reviewed'] and sha(v['imagePath']) == v['imageSha256'] and by_id[v['sourceId']]['rawSha256'] == v['sourceSha256'] for v in visual))
    check('all_package_json_parse', all(json.loads(p.read_text()) is not None for p in PACKAGE.glob('*.json')))
    for path in PACKAGE.glob('*.md'):
        for target in re.findall(r'\]\(([^)]+)\)', path.read_text()):
            if not re.match(r'^[a-z]+:', target):
                check('link:' + path.name + ':' + target, (path.parent / target.split('#')[0]).exists() or target == 'verification.json')
    changed = subprocess.check_output(['git', 'diff', '--name-only', BASE], cwd=ROOT, text=True).splitlines()
    unknown = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT, text=True).splitlines()
    prefix = str(PACKAGE.relative_to(ROOT)) + '/'
    check('only_round006_and_verifier_paths_changed', all(p.startswith(prefix) or p == 'scripts/verify-beredskap-round006.py' for p in changed + unknown))
    check('no_raw_source_files_inside_package', all(p.suffix in ['.json', '.md'] for p in PACKAGE.rglob('*') if p.is_file()))
    check('git_diff_check', subprocess.run(['git', 'diff', '--check'], cwd=ROOT, capture_output=True).returncode == 0)
    check('base_ancestry', subprocess.run(['git', 'merge-base', '--is-ancestor', BASE, 'HEAD'], cwd=ROOT).returncode == 0)
    result = {'asOf': '2026-09-09', 'authority': 'internal_analysis_only', 'humanReview': 'not_performed', 'semanticTruthVerifiedByScript': False,
              'passed': all(c['passed'] for c in checks), 'checks': checks,
              'counts': {'checks': len(checks), 'sources': len(sources), 'observations': len(observations), 'gaps': len(gaps), 'intakeFields': len(fields), 'preservedPredecessorFiles': 119, 'preservedTrackedHistoricalFiles': 64, 'preservedRound005PrivateWorkingFiles': 48},
              'verifierSha256': sha(Path(__file__)),
              'gates': {'localIntegrity': 'passed' if all(c['passed'] for c in checks) else 'failed', 'CI': 'not_run', 'migration': 'not_run', 'deployment': 'not_run', 'runtimeSHA': 'not_checked', 'authenticatedProductionUI': 'not_checked', 'DBWrites': False, 'canonicalPromotion': False, 'coverageReadinessChanged': False, 'contactsSent': False, 'testPerformed': False, 'push': 'not_performed', 'PR': 'not_created'},
              'limitations': ['Hash checks prove integrity and reproducibility, not completeness of public search or scientific truth.', 'Applicant statements and municipal decisions retain distinct evidential roles.', 'Missing operational data stays unknown.']}
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / 'verification.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'passed': result['passed'], 'checks': len(checks), 'failures': [c['check'] for c in checks if not c['passed']]}))
    if not result['passed']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
