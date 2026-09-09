#!/usr/bin/env python3
"""Local round005 integrity receipt. Does not establish truth or authority."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "docs/project/analysis/source-review-beredskap-2026-09-09/round-005"
BASE = "9a4ae7d0d457b0d0c2e0f681b7595f942c40bd1b"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.output.exists():
        raise FileExistsError("receipt output directory must be new")
    checks = []
    def check(name, passed):
        checks.append({"check": name, "passed": bool(passed)})
    manifest = json.loads((PACKAGE / "input-manifest.json").read_text())
    private = Path(manifest["inputs"]["no_yield"]["path"]).parent
    sources = json.loads((PACKAGE / "source-bindings.json").read_text())["sources"]
    byid = {s["sourceId"]: s for s in sources}
    check("unique_source_ids", len(byid) == len(sources))
    for source in sources:
        for label in ("raw", "text"):
            check(source["sourceId"] + ":" + label, sha(Path(source[label+"Path"])) == source[label+"Sha256"])
        if source.get("requestPath"):
            check(source["sourceId"] + ":request", sha(Path(source["requestPath"])) == source["requestSha256"])
    baseline = json.loads((private / "predecessor-byte-baseline.json").read_text())
    check("119_predecessor_files_byte_identical", len(baseline) == 119 and all(sha(Path(p)) == h for p,h in baseline.items()))
    spec = importlib.util.spec_from_file_location("c1", ROOT / "scripts/analyze-beredskap-c1.py")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    calculated = module.analyze(module.checked_inputs(manifest))
    check("calculations_reproduce_exactly", calculated == json.loads((PACKAGE / "calculations.json").read_text()))
    check("script_hash", sha(ROOT / "scripts/analyze-beredskap-c1.py") == manifest["scriptSha256"])
    check("dependency_hash", sha(ROOT / "scripts/analyze-beredskap-cereals.py") == manifest["dependencyScriptSha256"])
    for p in PACKAGE.glob("*.json"):
        json.loads(p.read_text())
    check("all_package_json_parse", True)
    observations = json.loads((PACKAGE / "observations.json").read_text())["observations"]
    for observation in observations:
        check(observation["id"] + ":bindings", observation["human_verified"] is False and
              observation["targetProfileSha256"] == sha(PACKAGE / "case.json") and
              observation["policySha256"] == sha(ROOT / "AGENTS.md") and
              all(r["rawSha256"] == byid[r["sourceId"]]["rawSha256"] and r["locator"] for r in observation["sourceRefs"]))
    case = json.loads((PACKAGE / "case.json").read_text())
    check("26_operational_fields_null", sum(v is None for route in case["alternatives"] for v in route["observedQuantities"].values()) == 26)
    status = json.loads((PACKAGE / "status-delta.json").read_text())
    check("five_purpose_updates", {p['id'] for p in status['purposeUpdates']} == {'P1','P2','P3','P4','P5'})
    check("historical_gaps_not_closed", all(x['closeOriginalGap'] is False for x in status['parentGapUpdates']))
    check("no_readiness_or_authority_change", not any(status[k] for k in ['human_verified','canonicalChanged','coverageReadinessChanged']))
    gaps = json.loads((PACKAGE / "data-gaps.json").read_text())["gaps"]
    check("ten_open_gaps", len(gaps)==10 and len({g['id'] for g in gaps})==10 and all(g['value'] is None and g['status']=='open' for g in gaps))
    notebook = json.loads((PACKAGE / "analysis.ipynb").read_text())
    execution = json.loads((private / "notebook-execution.json").read_text())
    code = [c for c in notebook['cells'] if c['cell_type']=='code']
    check("kernel_receipt_matches_notebook", execution['passed'] and execution['notebookSha256']==sha(PACKAGE/'analysis.ipynb'))
    check("five_code_cells_executed_without_error", len(code)==5 and [c['execution_count'] for c in code]==list(range(1,6)) and not any(o['output_type']=='error' for c in code for o in c['outputs']))
    tests=[]
    for name in ['test-analyze-beredskap-c1.py','test-analyze-beredskap-cereals.py']:
        run=subprocess.run([sys.executable,str(ROOT/'scripts'/name)],cwd=ROOT,text=True,capture_output=True)
        tests.append({'script':name,'exitCode':run.returncode,'output':run.stdout+run.stderr})
        check(name,run.returncode==0)
    git=subprocess.run(['git','diff','--check'],cwd=ROOT,capture_output=True,text=True)
    check('git_diff_check',git.returncode==0)
    changed=subprocess.check_output(['git','diff','--name-only',BASE],cwd=ROOT,text=True).splitlines()
    allowed={'scripts/analyze-beredskap-c1.py','scripts/test-analyze-beredskap-c1.py','scripts/verify-beredskap-c1.py'}
    check('no_predecessor_tracked_files_changed',all(p in allowed or '/round-005/' in p for p in changed))
    for commit in [BASE,'52d410158341cce852be1b7c0e9c17d3629b5633']:
        check('ancestry:'+commit,subprocess.run(['git','merge-base','--is-ancestor',commit,'HEAD'],cwd=ROOT).returncode==0)
    receipt={'asOf':'2026-09-09','authority':'internal_analysis_only','humanReview':'not_performed','semanticTruthVerifiedByScript':False,
        'passed':all(c['passed'] for c in checks),'checks':checks,
        'counts':{'checks':len(checks),'sourceBindings':len(sources),'observations':len(observations),'gaps':len(gaps),'yieldWarnings':8,'newUnitTests':9,'priorCerealUnitTests':14,'preservedPredecessorFiles':len(baseline)},
        'notebook':execution,'testRuns':tests,
        'PDFVisualRead':{'method':'pdftoppm + view_image','pages':['no-products.pdf physical3 printed5','se-products-2026.pdf physical/printed5','no-distribution.pdf physical/printed6'],'scope':'selected source rows only; no complete-catalog review'},
        'sourceProfile':{'grain':'source identity; eight country/crop/year diagnostics; no operational observation rows','newOpenedSources':14,'reusedFrozenSources':10,'warningShareOfPanel':8/48,'operationalFieldsMissing':'26/26','materialRisk':'Critical for a delivery decision: need, quality acceptance, allocation and physical throughput absent'},
        'gates':{'local':'passed' if all(c['passed'] for c in checks) else 'failed','CI':'not_run','migration':'not_run','deployment':'not_run','runtimeSHA':'not_checked','authenticatedProductionUI':'not_checked','DBWrites':False,'canonicalPromotion':False,'coverageReadinessChanged':False,'contact':'not_performed','push':'not_performed','PR':'not_created','publication':'not_performed'}}
    args.output.mkdir(parents=True,exist_ok=False)
    (args.output/'verification.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'passed':receipt['passed'],'checks':len(checks),'failures':[c['check'] for c in checks if not c['passed']]}))
    if not receipt['passed']:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
