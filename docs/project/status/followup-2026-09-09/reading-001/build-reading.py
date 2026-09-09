#!/usr/bin/env python3
"""Build offline reading dossiers. No database access or candidate-history writes.

Authored input versions and generated dossiers are immutable: create a new input
filename for corrections. Only register/status/README snapshots may regenerate.
Hashes prove binding and reproduction, not that semantic reading was performed.
"""
import argparse
import collections
import hashlib
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[4]
PRIOR = HERE.parent / 'continuation-001'
sha = lambda b: hashlib.sha256(b).hexdigest()
encode = lambda x: json.dumps(x, ensure_ascii=False, sort_keys=True, indent=2) + '\n'
canonical = lambda x: sha(json.dumps(x, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def load(p):
    return json.loads(p.read_text())


def output(p, obj, write, immutable=False):
    content = encode(obj) if not isinstance(obj, str) else obj
    if p.exists() and (immutable or not write):
        assert p.read_text() == content, f'Artifact drift: {p}; append a new input version'
    elif write:
        p.parent.mkdir(parents=True, exist_ok=True)
        with p.open('x' if immutable else 'w') as f:
            f.write(content)
    else:
        raise AssertionError(f'Missing generated artifact: {p}')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    candidates = load(PRIOR / 'document-candidates.json')['candidates']
    queue = load(PRIOR / 'queue.json')['items']
    page_index = {(p['rawSha256'], p['physicalPage']): p for p in load(PRIOR / 'page-index.json')['pages']}
    by_id = {c['candidateId']: c for c in candidates}
    profile = load(HERE / 'target-profile.json')
    authority = dict(human_verified=False, humanReviewRecorded=False, canonicalChanged=False,
                     readinessChanged=False, published=False, databaseWritePerformed=False)
    dossiers = []
    for inp in sorted((HERE / 'inputs').glob('*.json')):
        a = load(inp)
        c = by_id[a['identityCandidateId']]
        assert c['associationStatus'] == 'compatible_limited'
        assert canonical({k: v for k, v in c.items() if k != 'candidateSha256'}) == c['candidateSha256']
        assert sha(pathlib.Path(c['rawPath']).read_bytes()) == c['rawSha256']
        text = pathlib.Path(c['textPath']).read_bytes()
        assert sha(text) == c['textSha256']
        pages = text.decode().split('\f')
        if not pages[-1].strip():
            pages.pop()
        assert len(pages) == c['physicalPages']
        read = set()
        for block in a['readingBlocks']:
            assert block['assessment'] and block['mode'] in ('semantic_text', 'front_back_matter')
            start, end = block['physicalPages']
            assert 1 <= start <= end <= len(pages)
            assert not read.intersection(range(start, end + 1)), 'Overlapping reading blocks'
            read.update(range(start, end + 1))
        assert a['status'] in ('full_document_read', 'partial_document_read')
        if a['status'] == 'full_document_read':
            assert read == set(range(1, len(pages) + 1))
            assert all(a['appraisal'].get(k) for k in ('question', 'method', 'dataPeriodGeography', 'denominator', 'results', 'limitations', 'contradictions', 'transferability'))
        bindings = []
        for n in sorted(read):
            ph = sha(pages[n-1].encode())
            assert ph == page_index[(c['rawSha256'], n)]['pageTextSha256']
            label = a['printedPageLabels'].get(str(n))
            assert str(n) in a['printedPageLabels'], f'Missing printed label {n}'
            bindings.append(dict(physicalPage=n, printedPage=label, pageTextSha256=ph,
                                 wordCount=len(pages[n-1].split())))
        visual = []
        for v in a['visualChecks']:
            assert v['physicalPage'] in read and v['finding']
            p = pathlib.Path(v['imagePath'])
            visual.append({**v, 'imageSha256': sha(p.read_bytes())})
        claims = []
        for claim in a['claims']:
            locators = []
            for loc in claim['locators']:
                n = loc['physicalPage']
                assert n in read
                lines = pages[n-1].splitlines(keepends=True)
                start, end = loc['lines']
                assert 1 <= start <= end <= len(lines)
                passage = ''.join(lines[start-1:end])
                assert passage.strip()
                locators.append({**loc, 'printedPage': a['printedPageLabels'][str(n)],
                                 'passageSha256': sha(passage.encode()),
                                 'pageTextSha256': sha(pages[n-1].encode())})
            assert locators and claim['epistemicStatus'] and claim['caveat']
            claims.append({**claim, 'locators': locators})
        dossier = dict(schema='offline-library-reading-dossier/v1', assessmentId=a['assessmentId'],
                       identityCandidateId=c['candidateId'], identityCandidateSha256=c['candidateSha256'],
                       title=c['observedTitle'], source={k:c[k] for k in ('rawPath','rawSha256','textPath','textSha256')},
                       policySha256=sha((ROOT/'AGENTS.md').read_bytes()), targetProfileSha256=canonical(profile),
                       authoredInputPath=str(inp.relative_to(ROOT)), authoredInputSha256=sha(inp.read_bytes()),
                       status=a['status'], readingBlocks=a['readingBlocks'], appraisal=a['appraisal'],
                       claims=claims, pageBindings=bindings, visualChecks=visual,
                       unreadPhysicalPages=sorted(set(range(1,len(pages)+1))-read), authority=authority,
                       relatedLibraryRecordIds=[r['libraryAnalysisRecordId'] for r in queue if c['candidateId'] in r['usableCandidateIds']],
                       scope='Offline candidate-only analysis for later governed intake; not a database candidate or human review.')
        dossier['assessmentSha256'] = canonical(dossier)
        output(HERE/'dossiers'/inp.name, dossier, args.write, immutable=True)
        dossiers.append(dossier)
    latest = {d['identityCandidateId']: d for d in dossiers}
    supplements = []
    for path in sorted((HERE/'supplements').glob('*.json')):
        s = load(path)
        assert s['parentIdentityCandidateId'] in latest
        for pk, hk in [('rawPath','rawSha256'),('textPath','textSha256'),('receiptPath','receiptSha256')]:
            assert sha(pathlib.Path(s[pk]).read_bytes()) == s[hk]
        assert s['independentEvidence'] is False and s['human_verified'] is False and s['readinessChanged'] is False
        assert [im['physicalPage'] for im in s['images']] == list(range(1,s['physicalPages']+1))
        for im in s['images']:
            assert sha(pathlib.Path(im['path']).read_bytes()) == im['sha256']
        supplements.append(s)
    rows = []
    for c in candidates:
        d = latest.get(c['candidateId'])
        state = d['status'] if d else ('unread' if c['associationStatus']=='compatible_limited' else 'identity_or_context_hold')
        readpages = [p['physicalPage'] for p in d['pageBindings']] if d else []
        rows.append(dict(identityCandidateId=c['candidateId'], title=c['observedTitle'], rawSha256=c['rawSha256'],
                         associationStatus=c['associationStatus'], state=state, physicalPages=c['physicalPages'],
                         readPhysicalPages=readpages, unreadPhysicalPages=[n for n in range(1,c['physicalPages']+1) if n not in readpages],
                         latestAssessmentId=d['assessmentId'] if d else None,
                         latestAssessmentSha256=d['assessmentSha256'] if d else None))
    completed = {r['identityCandidateId'] for r in rows if r['state']=='full_document_read'}
    library_rows = [dict(libraryAnalysisRecordId=r['libraryAnalysisRecordId'], title=r['registeredTitle'],
                         availabilityStatus=r['status'], usableCandidateIds=r['usableCandidateIds'],
                         fullyReadCandidateIds=sorted(set(r['usableCandidateIds']) & completed),
                         nextAction=r['nextAction'] if not r['usableCandidateIds'] else 'Read remaining originals; preserve version dependence and candidate-only authority.') for r in queue]
    output(HERE/'reading-register.json', dict(schema='offline-library-reading-register/v1',documents=rows,libraryRecords=library_rows,authority=authority), args.write)
    counts = dict(collections.Counter(r['state'] for r in rows))
    status = dict(schema='offline-library-reading-status/v1', inheritedCommit='0d72eb8a7edc8aca7a61affcc0fb2b423d2b3e6d',
                  frozenLibraryRecords=len(queue), uniquePdfFiles=len(rows), physicalPages=sum(r['physicalPages'] for r in rows),
                  documentStates=counts, readPhysicalPages=sum(len(r['readPhysicalPages']) for r in rows),
                  claimCandidates=sum(len(d['claims']) for d in dossiers), assessmentVersions=len(dossiers),
                  visualPageChecks=sum(len(d['visualChecks']) for d in dossiers), fullLibraryReadingComplete=False,
                  supplementaryDocuments=len(supplements), supplementaryPagesRead=sum(s['physicalPages'] for s in supplements),
                  authority=authority, verificationScope='Local source hashes, exact passage bindings, page accounting and reproducibility. No CI/runtime/release proof; no automatic semantic-reading attestation.')
    output(HERE/'status.json', status, args.write)
    receipt = dict(schema='offline-reading-verification/v1', result='passed', checkedSourceFiles=len(latest),
                   checkedDossiers=len(dossiers), checkedClaims=status['claimCandidates'],
                   sourcePageBindings=status['readPhysicalPages'], documentCount=len(rows), libraryRecordCount=len(queue),
                   supplementaryDocuments=len(supplements), supplementaryPagesRead=status['supplementaryPagesRead'],
                   builderSha256=sha(pathlib.Path(__file__).read_bytes()), authority=authority)
    assert len(rows)==140 and len(queue)==392 and status['physicalPages']==9919
    output(HERE/'verification.json',receipt,args.write)
    print(encode(status))


if __name__ == '__main__':
    main()
