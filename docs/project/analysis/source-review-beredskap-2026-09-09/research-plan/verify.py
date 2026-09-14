#!/usr/bin/env python3
"""Validate planning coverage and immutable inputs, not research truth or Astra execution."""
import argparse
import hashlib
import importlib.util
import json
import re
import subprocess
import sys
sys.dont_write_bytecode = True
from pathlib import Path
from datetime import datetime, timezone

PLAN = Path(__file__).resolve().parent
REPO = Path(subprocess.check_output(['git', 'rev-parse', '--show-toplevel'], cwd=PLAN, text=True).strip())
checks, failures, unverified = [], [], []


def check(condition, name):
    (checks if condition else failures).append(name)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def canonical(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def pointer(path, loc):
    value = json.loads((REPO / path).read_text())
    for key in loc.strip('/').split('/'):
        key = key.replace('~1', '/').replace('~0', '~')
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value


def hash_check(path, expected, name):
    check(path.is_file() and sha(path) == expected, name)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    reg = json.loads((PLAN / 'work-packages.json').read_text())
    cov = json.loads((PLAN / 'coverage.json').read_text())
    manifest = json.loads((PLAN / 'input-manifest.json').read_text())
    packages = {p['id']: p for p in reg['packages']}
    expected = {f'B{i:02d}' for i in range(1, 21)}
    check(len(reg['packages']) == 20 and set(packages) == expected, '20 unique packages')
    check(reg['master']['model'] == 'gpt-6-astra' and set(reg['master']['dependsOn']) == expected, 'Astra master requires every package')
    check(reg['executionRequestedInThisPlan'] is False and reg['master']['status'] == 'not_started', 'planning only; master not started')
    owned = [g for p in packages.values() for g in p['ownedGapIds']]
    check(len(owned) == 92 and len(set(owned)) == 92, '92 gap IDs assigned exactly once')
    check(len(cov['gaps']) == 92 and {g['id'] for g in cov['gaps']} == set(owned), 'coverage equals owner inventory')
    for p in packages.values():
        check(p['status'] == 'not_started', p['id'] + ' not started')
        check(all(d in packages and packages[d]['wave'] < p['wave'] for d in p['dependsOn']), p['id'] + ' dependencies precede package; no cycle')
        check(set(p['coordinationWith']) <= expected - {p['id']}, p['id'] + ' coordination references valid')
        for f in p['inputs']:
            check((REPO / f).is_file(), 'package input exists: ' + f)
    for g in cov['gaps']:
        check(g['primaryPackageId'] in packages and g['id'] in packages[g['primaryPackageId']]['ownedGapIds'], 'gap owner: ' + g['id'])
        check(g['semanticGapClosed'] is False, 'no gap closure: ' + g['id'])
        hash_check(REPO / g['sourcePath'], g['sourceSha256'], 'gap source hash: ' + g['id'])
        record = pointer(g['sourcePath'], g['jsonPointer'])
        check(canonical(record) == g['recordSha256'], 'exact original record: ' + g['id'])
        normalized = record['original'] if g['sourcePath'].endswith('round-003/gap-intake.json') else record
        check(normalized == g['originalRecord'], 'retained original gap: ' + g['id'])
    check({c['chapter'] for c in cov['chapters']} == set(range(1, 16)) and len(cov['chapters']) == 15, '15 chapter dispositions')
    for c in cov['chapters']:
        original = pointer(c['sourcePath'], c['jsonPointer'])
        check(original['title'] == c['title'] and original['chapter'] == c['chapter'], 'chapter source: ' + str(c['chapter']))
        check(set(c['ownerPackages']) <= expected and c['canonicalChangeAuthorized'] is False, 'chapter authority: ' + str(c['chapter']))
    check(len(cov['operationalBoundary']) == 30, '30 historical FS boundary rows')
    for o in cov['operationalBoundary']:
        original = pointer(o['sourcePath'], o['jsonPointer'])
        check(original['id'] == o['id'] and original['state'] == o['historicalState'] and not o['stateReverified'], 'historical FS state: ' + o['id'])
        check(set(o['researchPackages']) <= expected, 'FS research owner: ' + o['id'])
    check({p['id'] for p in cov['purposes']} == {f'P{i}' for i in range(1, 6)}, 'five purposes')
    for entry in manifest['inputs']:
        hash_check(REPO / entry['path'], entry['sha256'], 'frozen input: ' + entry['path'])
    for name, expected_sha in manifest['historicalFiles'].items():
        hash_check(REPO / name, expected_sha, 'preserved historical file: ' + name)
    private_count = 0
    for entry in manifest['priorPrivateBaselines']:
        path = Path(entry['path'])
        if not path.exists():
            unverified.append('Private baseline unavailable: ' + str(path))
            continue
        hash_check(path, entry['sha256'], 'private baseline file: ' + path.name)
        for name, expected_sha in json.loads(path.read_text()).items():
            target = Path(name) if Path(name).is_absolute() else REPO / name
            if not target.exists():
                unverified.append('Private baseline member unavailable: ' + name)
            else:
                hash_check(target, expected_sha, 'private baseline member: ' + name)
                private_count += 1
    for f in (PLAN / 'templates').glob('*.json'):
        check(json.loads(f.read_text())['templateOnly'] is True, 'template never implies execution: ' + f.name)
    spec = importlib.util.spec_from_file_location('plan_generate', PLAN / 'generate.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    for name, content in module.outputs().items():
        check((PLAN / name).read_text() == content, 'generated output current: ' + name)
    rebuilt = subprocess.run(['python3', str(PLAN / 'build-registers.py')], cwd=REPO, text=True, capture_output=True)
    check(rebuilt.returncode == 0, 'registers reproduce from source: ' + (rebuilt.stderr.strip() if rebuilt.returncode else 'verified'))
    for f in PLAN.rglob('*.md'):
        for target in re.findall(r'\]\(([^)]+)\)', f.read_text()):
            if '://' not in target and not target.startswith('#'):
                check((f.parent / target.split('#')[0]).exists(), f'local link: {f.name} -> {target}')
    result = {'schema': 'beredskap-plan-verification/v1', 'checkedAt': datetime.now(timezone.utc).isoformat(),
              'status': 'failed' if failures else ('passed_with_unverified_private_inputs' if unverified else 'passed'),
              'checksPassed': len(checks), 'failures': failures, 'unverified': unverified,
              'packages': len(packages), 'gapRecordIds': len(cov['gaps']), 'historicalFilesPreserved': len(manifest['historicalFiles']),
              'priorBaselineMembersChecked': private_count, 'researchExecuted': False, 'astraReviewExecuted': False,
              'ciVerified': False, 'deploymentVerified': False, 'humanReviewRecorded': False}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(1 if failures else 0)


if __name__ == '__main__':
    main()
