#!/usr/bin/env python3
"""Prepare local document candidates and an exhaustive metadata repair queue.

Uses frozen, already acquired originals. Never changes the application/DB.
Visual observations were made in this task; they are KI review, not human review.
"""
import argparse
import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
PRIOR = Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a083be-a7c3-7db2-bfa2-97227f1a107d/restlist')
SAMPLE = PRIOR / 'library-recovery-sample'
PRIVATE = Path('/Users/gabrielfreeman/.codex/visualizations/2026/09/09/01a0862f-bd95-7660-802d-282c781c1c5f/status-restlist/library-recovery')


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def objsha(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def read(path):
    return json.loads(path.read_text())


IDENTITIES = {
    'ecr': {'title': 'Dagligvarukartan 2024', 'publisher': 'DLF och Delfi', 'year': 2024,
            'authors': None, 'identityPages': [1], 'sourceType': 'market_chart_publication',
            'limitations': ['2024 is publication edition; sales mainly refer to fiscal 2023 with named exceptions.',
                            'No current 2026 market claim.', 'PDF is visually rich; 249 extracted words are not a full representation.',
                            'Nordic comparison pages are secondary citations and do not establish harmonized national definitions.']},
    'baltic-sea-food': {'title': 'Local Food Business-to-Business Distribution Model',
                       'publisher': 'Baltic Sea Food / Interreg Baltic Sea Region', 'year': None,
                       'authors': ['Kjersti Bjørke, Hardanger Business Garden, Norway'], 'identityPages': [1, 2],
                       'sourceType': 'business_model_report', 'limitations': ['Publication year not verified from the inspected identity pages.',
                       'Identity and navigability checked; the 76-page report has not received a full independent semantic analysis in this run.']},
    'kkv-2025-5': {'title': 'Utvärdering av lagen om förbud mot otillbörliga handelsmetoder',
                   'publisher': 'Konkurrensverket', 'year': 2025, 'authors': ['Kristin Kindgren (projektledare)'],
                   'identityPages': [1, 2], 'sourceType': 'report_2025_5',
                   'limitations': ['Colophon says October 2025.', 'Identity and page navigation are checked; no legal interpretation or full semantic analysis is supplied here.']},
    'matvett-or-28-24': {'title': 'Matsvinn i norske husholdninger - Oppdaterte matkastetall og forbrukerundersøkelser med anbefalinger til veien videre',
                       'publisher': 'NORSUS', 'year': 2024, 'authors': ['Sigrid Møyner Hohle', 'Aina Stensgård'],
                       'identityPages': [1, 2], 'sourceType': 'OR.28.24',
                       'limitations': ['54 physical PDF pages versus colophon ANTALL SIDER 39; physical page locators must be preserved separately.',
                       'Identity and page navigation checked; report estimates must not be promoted to measured collected material flow.']},
}

# Manual transcription of facts from the visually inspected PDF pages 2, 3, 7–14.
# These are exact printed values; rounding discrepancies are retained, not repaired.
REGIONS = [
    (7, 'Norra Norrland', [('ICA',104,8770,94.6),('Axfood',48,2811,83.2),('Coop',82,6588,87.2),('Lidl',4,350,78.5)], [238,18519,89.7]),
    (8, 'Södra Norrland', [('ICA',147,12100,90.1),('Axfood',62,3602,80.3),('City Gross',2,390,38.2),('Coop',72,4881,61.1),('Lidl',16,1400,78.5)], [299,22372,77.9]),
    (9, 'Västra Svealand', [('ICA',100,10117,100.0),('Axfood',70,4413,71.5),('City Gross',2,268,31.5),('Coop',85,5344,55.5),('Lidl',16,1400,78.5)], [273,21541,75.5]),
    (10, 'Mälardalen', [('ICA',140,18455,104.7),('Axfood',88,8592,82.2),('City Gross',5,1495,46.9),('Coop',81,5365,52.2),('Lidl',26,2275,78.1)], [340,36182,81.4]),
    (11, 'Stockholm', [('ICA',186,27940,122.8),('Axfood',163,16865,92.7),('City Gross',5,1180,34.7),('Coop',121,11520,78.5),('Lidl',49,4288,78.5)], [524,61792,95.8]),
    (12, 'Västra Götaland', [('ICA',227,30337,111.9),('Axfood',201,15077,83.4),('City Gross',6,1680,56.4),('Coop',133,12156,72.0),('Lidl',35,3063,78.5)], [602,62312,90.4]),
    (13, 'Östra Götaland', [('ICA',191,19661,102.5),('Axfood',136,9908,75.4),('City Gross',9,2585,40.8),('Coop',124,5800,59.2),('Lidl',26,2275,77.8)], [486,40228,78.3]),
    (14, 'Södra Götaland', [('ICA',170,21455,106.6),('Axfood',102,9487,80.5),('City Gross',13,2895,45.5),('Coop',105,7273,56.1),('Lidl',34,2975,78.5)], [424,44085,80.1]),
]


def build():
    source_manifest = read(SAMPLE / 'manifest.json')
    prior_queue = read(PRIOR / 'library-reconciliation/missing-text-worklist.json')
    assert prior_queue['count'] == len(prior_queue['items']) == 392
    assert len({x['id'] for x in prior_queue['items']}) == 392
    candidates, page_index = [], []
    for item in source_manifest['items']:
        raw = SAMPLE / item['rawPath']
        assert sha(raw) == item['rawSha256']
        if item['mimeType'] != 'application/pdf':
            continue
        key = Path(item['rawPath']).parent.name
        text = SAMPLE / item['textPath']
        assert sha(text) == item['textSha256']
        pages = text.read_text().split('\f')
        if not pages[-1].strip():
            pages.pop()
        info = subprocess.check_output(['pdfinfo', str(raw)], text=True)
        physical_count = int(next(line.split(':')[1] for line in info.splitlines() if line.startswith('Pages:')))
        assert physical_count == item['pages'] == len(pages)
        cover = PRIVATE / key / 'cover.png'
        assert cover.is_file()
        identity = IDENTITIES[key]
        row = {
            'candidateId': f'LIB-RECOVERY-20260909-{key}',
            'libraryAnalysisRecordId': item['libraryAnalysisRecordId'],
            'existingDocumentId': item['documentId'],
            'existingSourceDocId': item['sourceDocId'],
            'registeredTitle': item['title'], 'proposedIdentity': identity,
            'sourceUrl': item['url'], 'acquiredAt': source_manifest['checkedAt'],
            'rawPath': str(raw), 'rawSha256': sha(raw), 'textPath': str(text), 'textSha256': sha(text),
            'physicalPdfPages': physical_count, 'extractedWordCount': len(text.read_text().split()),
            'coverRenderPath': str(cover), 'coverRenderSha256': sha(cover),
            'identityInspection': 'Cover visually inspected; colophon/author page read in frozen text when listed.',
            'candidateStatus': 'document_identity_prepared_for_controlled_review',
            'fullSemanticAnalysisComplete': False, 'human_verified': False,
            'databaseBindingPerformed': False, 'productionQueueChanged': False,
            'rights': {'basis': 'Existing public-publisher acquisition retained privately for internal review', 'redistributionAuthorized': False},
        }
        row['candidateSha256'] = objsha(row)
        candidates.append(row)
        for i, page in enumerate(pages, 1):
            page_index.append({'candidateId': row['candidateId'], 'physicalPage': i,
                               'textSha256': hashlib.sha256(page.encode()).hexdigest(),
                               'wordCount': len(page.split()), 'fullyReadSemantically': False})
    assert len(candidates) == 4 and len(page_index) == 256
    rows = []
    prepared = {c['libraryAnalysisRecordId']: c['candidateId'] for c in candidates}
    for item in prior_queue['items']:
        existing = []
        for rel in dict.fromkeys([item.get('canonicalPath'), item.get('documentFilePath')]):
            if not rel:
                continue
            p = Path(rel)
            for q in [ROOT/p, ROOT/'research'/p]:
                if q.is_file():
                    existing.append({'path': str(q.relative_to(ROOT)), 'sha256': sha(q), 'bindingConfirmed': False})
        rows.append({'libraryAnalysisRecordId': item['id'], 'priority': item['priority'],
                     'sourceKind': item['sourceKind'], 'sourceKey': item['sourceKey'],
                     'documentId': item['documentId'], 'sourceDocId': item.get('selectedSourceDocId'),
                     'originalWordCount': item['wordCount'], 'localFileCandidates': existing,
                     'documentUrl': item.get('documentUrl'), 'sourceDocUrl': item.get('sourceDocUrl'),
                     'preparedCandidateId': prepared.get(item['id']),
                     'nextAction': 'controlled_identity_review_of_prepared_candidate' if item['id'] in prepared else item['nextAction'],
                     'originalNextAction': item['nextAction'], 'status': 'review_required', 'human_verified': False})
    queue = {'schema': 'library-recovery-followup/v1', 'asOf': '2026-09-09',
             'readbackAt': prior_queue['checkedAt'], 'sourceWorklistPath': str(PRIOR/'library-reconciliation/missing-text-worklist.json'),
             'sourceWorklistSha256': sha(PRIOR/'library-reconciliation/missing-text-worklist.json'),
             'count': len(rows), 'priorities': dict(Counter(i['priority'] for i in rows)),
             'preparedDocumentCandidates': len(prepared), 'remainingWithoutPreparedCandidate': len(rows)-len(prepared),
             'productionQueueChanged': False, 'human_verified': False, 'items': rows}
    ecr = {'schema': 'ecr-visual-extraction/v1', 'candidateOnly': True, 'human_verified': False,
           'rawSha256': candidates[0]['rawSha256'], 'edition': 2024, 'physicalPagesVisuallyInspected': list(range(1,15)),
           'extractScope': 'Swedish actor facts p2–3 and regional tables p7–14; Nordic pages inspected but not normalized.',
           'scopeNotes': IDENTITIES['ecr']['limitations'] + ['Average VAT uplift is an assumed 16 percent; no volume or crisis-capacity interpretation.'],
           'swedishActors': [{'actor': a, 'salesSharePercent': s, 'salesBillionSEK': v, 'physicalPages': [2,3]}
                              for a,s,v in [('ICA',49.9,168.3),('Axfood',21.9,73.9),('Coop',17.0,57.5),('Lidl',6.4,21.6),('City Gross',3.2,10.9),('Matrebellerna',0.9,3.0),('Mathem',0.7,2.4)]],
           'regions': [], 'warnings': []}
    for page, region, data, total in REGIONS:
        r = {'physicalPage': page, 'region': region,
             'rows': [dict(zip(['actor','count','salesMillionSEK','salesThousandSEKPerSqm'], row)) for row in data],
             'reportedTotal': dict(zip(['count','salesMillionSEK','meanSalesThousandSEKPerSqm'],total)),
             'computedMinusReportedCount': sum(row[1] for row in data)-total[0],
             'computedMinusReportedSalesMillionSEK': sum(row[2] for row in data)-total[1]}
        ecr['regions'].append(r)
        if r['computedMinusReportedCount'] or r['computedMinusReportedSalesMillionSEK']:
            ecr['warnings'].append({'physicalPage':page,'reason':'Printed row sums differ from printed total; possible rounding or source inconsistency retained.',
                                    'countResidual':r['computedMinusReportedCount'],'salesMillionSEKResidual':r['computedMinusReportedSalesMillionSEK']})
    ecr['warnings'].append({'physicalPage':4, 'reason':'Denmark labels include free-sector aggregate 30.7 alongside detailed categories; all visible labels sum to 130.7. Parent/subcategory scope must be resolved from the named original before a total or ranking is calculated.'})
    ecr['checks'] = {'swedishShareSum': round(sum(i['salesSharePercent'] for i in ecr['swedishActors']),1),
                     'swedishSalesSumBillionSEK': round(sum(i['salesBillionSEK'] for i in ecr['swedishActors']),1),
                     'printedSalesBillionSEK':337.6, 'regionalDetailRows':sum(len(r['rows']) for r in ecr['regions']),
                     'regionalMeansRecomputed':False, 'regionalMeanReason':'Missing unrounded area denominators; do not average actor averages.'}
    return {
        'library-document-candidates.json': {'schema':'library-document-candidates/v1','sampleManifestPath':str(SAMPLE/'manifest.json'),
                                           'sampleManifestSha256':sha(SAMPLE/'manifest.json'),'candidates':candidates},
        'library-page-index.json': {'schema':'library-page-index/v1','physicalPages':page_index},
        'library-repair-queue.json': queue,
        'ecr-visual-extraction.json':ecr,
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    for name, value in build().items():
        data = json.dumps(value, ensure_ascii=False, indent=2)+'\n'
        p = HERE/name
        if args.write:
            p.write_text(data)
        elif not p.is_file() or p.read_text() != data:
            raise SystemExit('Stale output: '+name)
    print('392-row queue, four document candidates and 256 physical page bindings verified')
