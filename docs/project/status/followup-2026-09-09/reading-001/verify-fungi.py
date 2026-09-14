#!/usr/bin/env python3
"""Reproduce selected table checks without promoting corrected source data."""
import argparse, hashlib, json
from decimal import Decimal as D
from pathlib import Path
HERE=Path(__file__).resolve().parent

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--write',action='store_true'); args=parser.parse_args()
    dossier=json.loads((HERE/'dossiers/038-002.json').read_text())
    rows={'AO':[19.9,7.51,13.8,24.6,21.4,5.66,14.2,16.9,17.2],
          'NI':[20.7,8.65,16.1,27.1,24.4,6.05,15.8,18.1,20.2],
          'RO':[18.7,7.66,15.7,24.5,22.9,5.98,14.6,16.2,18.5],
          'FM':[38.2,15.9,25,44.5,46.4,16.3,24.3,25.6,30],
          'SBM':[32,11.5,19.9,31.9,26.6,6.2,21.7,17.7,20.8]}
    reported={'AO':123.9,'NI':136.9,'RO':126.24,'FM':236.2,'SBM':167.5}
    checks=[]
    for name,values in rows.items():
        total=sum(D(str(x)) for x in values); source=D(str(reported[name]))
        assert total!=source
        checks.append(dict(claimId='READ038-05',species=name,unit='g/kg DM',sumOfNineDisplayedRows=str(total),sourceSum=str(source),difference=str(total-source),disposition='Preserve source conflict; obtain original analytical table'))
    assert 27.1<44.5 and 8.05>7.86
    checks.append(dict(claimId='READ038-04',check='NI leucine versus fishmeal',amountPerKgDM=[27.1,44.5],percentTotalAA=[8.05,7.86],disposition='Different denominators give opposite ordering'))
    checks.append(dict(claimId='READ038-07',check='COD at 5 percent v/v if only dilution',recomputed=str(D('835')*D('.05')),source='around21g/L',disposition='Unresolved preparation/normalization; not corrected measurement'))
    checks.append(dict(claimId='READ038-08',check='COD reduction percentages from source concentrations',recomputed=[round((835-v)/835*100,3) for v in [450,485,555]],reported=[46.1,41.9,33.5],disposition='Arithmetic agrees; volume basis still unresolved'))
    out=dict(schema='offline-fungi-consistency-check/v1',result='passed_with_preserved_source_conflicts',assessmentSha256=dossier['assessmentSha256'],scriptSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),checks=checks,human_verified=False,readinessChanged=False)
    content=json.dumps(out,ensure_ascii=False,sort_keys=True,indent=2)+'\n'; path=HERE/'fungi-verification.json'
    if args.write:path.write_text(content)
    else:assert path.read_text()==content
    print(f'Passed {len(checks)} checks; no functional feed effect inferred.')

if __name__=='__main__':main()
