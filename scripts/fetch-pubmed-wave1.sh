#!/bin/bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PUBMED_MD="$BASE_DIR/research/bibliotek/pubmed-soek-2026-03-19.md"
PDF_DIR="$BASE_DIR/research/evidence-pack/akademia/pubmed"
NOTES_DIR="$BASE_DIR/research/bibliotek/akademia/pubmed"
MANIFEST_JSONL="$BASE_DIR/research/evidence-pack/pubmed-wave1-manifest-2026-03-30.jsonl"
INDEX_MD="$BASE_DIR/research/bibliotek/pubmed-wave1-index-2026-03-30.md"

mkdir -p "$PDF_DIR" "$NOTES_DIR"
: > "$MANIFEST_JSONL"

META_TSV="$(mktemp)"

python3 - "$PUBMED_MD" <<'PY' > "$META_TSV"
import pathlib
import re
import sys
import unicodedata

pubmed_path = pathlib.Path(sys.argv[1])
text = pubmed_path.read_text(encoding="utf-8")

priority_dois = [
    "10.1177/14034948241269763",
    "10.1111/1541-4337.70431",
    "10.1038/s41538-024-00276-9",
    "10.1038/s41538-024-00265-y",
    "10.1016/j.biotechadv.2021.107857",
    "10.1016/j.wasman.2016.06.027",
    "10.1038/s41598-017-15784-w",
    "10.1016/j.scitotenv.2023.161656",
    "10.1016/j.appet.2017.05.013",
    "10.1016/j.wasman.2025.02.044",
    "10.1016/j.scitotenv.2022.155113",
    "10.1016/j.scitotenv.2020.139846",
    "10.1002/gch2.202300265",
    "10.1016/j.scitotenv.2018.10.377",
    "10.1016/bs.afnr.2025.08.001",
    "10.1038/s41586-024-07464-3",
]


def normalize_ascii(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value


entries = []
current_category = ""
lines = text.splitlines()
i = 0

while i < len(lines):
    line = lines[i]

    if line.startswith("## Kategori "):
        current_category = line.split(":", 1)[1].strip()
        i += 1
        continue

    if not line.startswith("### "):
        i += 1
        continue

    header = line[4:].strip()
    header_match = re.match(r"^\d+\.\d+\s+(.+?)\s+—\s+(.+?)\s+\((\d{4})\)$", header)
    if not header_match:
        i += 1
        continue

    authors, title, year = header_match.groups()

    i += 1
    block_lines = []
    while i < len(lines) and not lines[i].startswith("### ") and not lines[i].startswith("## Kategori "):
        block_lines.append(lines[i])
        i += 1

    block = "\n".join(block_lines)
    pmid = re.search(r"\*\*PMID:\*\*\s*(\d+)", block)
    doi = re.search(r"\*\*DOI:\*\*\s*\[([^\]]+)\]", block)
    findings = re.search(r"\*\*Nøkkelfunn:\*\*\s*(.+)", block)
    relevance = re.search(r"\*\*Relevans:\*\*\s*(.+)", block)

    if not doi:
        continue

    doi_value = doi.group(1).strip()
    if doi_value not in priority_dois:
        continue

    first_author = re.split(r",|&| et al\.", authors)[0].strip()
    short_title_tokens = [token for token in normalize_ascii(title).split("-") if token][:6]
    slug = "-".join([normalize_ascii(first_author), year] + short_title_tokens[:5]).strip("-")

    entries.append(
        {
            "doi": doi_value,
            "authors": authors.strip(),
            "title": title.strip(),
            "year": year.strip(),
            "pmid": pmid.group(1).strip() if pmid else "",
            "category": current_category,
            "findings": findings.group(1).strip() if findings else "",
            "relevance": relevance.group(1).strip() if relevance else "",
            "slug": slug,
        }
    )

for doi in priority_dois:
    entry = next((item for item in entries if item["doi"] == doi), None)
    if not entry:
        raise SystemExit(f"Mangler metadata for DOI: {doi}")
    fields = [
        entry["doi"],
        entry["authors"],
        entry["title"],
        entry["year"],
        entry["pmid"],
        entry["category"],
        entry["findings"].replace("\t", " ").replace("\n", " "),
        entry["relevance"].replace("\t", " ").replace("\n", " "),
        entry["slug"],
    ]
    print("\t".join(fields))
PY

download_count=0
metadata_only_count=0
failed_count=0

while IFS=$'\t' read -r doi authors title year pmid category findings relevance slug; do
  pdf_path="$PDF_DIR/${slug}.pdf"
  note_path="$NOTES_DIR/${slug}.md"
  openalex_json="$(mktemp)"

  curl -fsS "https://api.openalex.org/works/https://doi.org/${doi}" -o "$openalex_json"

  oa_status="$(jq -r '.open_access.oa_status // ""' "$openalex_json")"
  is_oa="$(jq -r '.open_access.is_oa // false' "$openalex_json")"
  landing_url="$(jq -r '.best_oa_location.landing_page_url // .open_access.oa_url // ""' "$openalex_json")"
  pdf_url="$(jq -r '.best_oa_location.pdf_url // .open_access.oa_url // ""' "$openalex_json")"
  pmcid_url="$(jq -r '.ids.pmcid // ""' "$openalex_json")"
  source_name="$(jq -r '.best_oa_location.source.display_name // ""' "$openalex_json")"
  resolved_title="$(jq -r '.title // ""' "$openalex_json")"
  manual_note=""

  case "$doi" in
    "10.1016/j.biotechadv.2021.107857")
      pdf_url="https://www.sciencedirect.com/science/article/am/pii/S0734975021001634"
      manual_note="Accepted manuscript PDF hentet manuelt via ScienceDirect 'View Open Manuscript'."
      ;;
    "10.1016/j.wasman.2025.02.044")
      pdf_url="https://www.sciencedirect.com/science/article/pii/S0956053X25001072/pdfft?md5=e42990a90ccb410a7ed6878246bdc36d&pid=1-s2.0-S0956053X25001072-main.pdf"
      manual_note="PDF hentet manuelt via browser fra ScienceDirect 'View PDF'."
      ;;
    "10.1016/j.scitotenv.2020.139846")
      pdf_url="https://www.sciencedirect.com/science/article/pii/S0048969720333660/pdfft?md5=c11431ed418e59416154495d6fe1f2d8&pid=1-s2.0-S0048969720333660-main.pdf"
      manual_note="PDF hentet manuelt via browser fra ScienceDirect 'View PDF'."
      ;;
    "10.1002/gch2.202300265")
      pdf_url="https://pmc.ncbi.nlm.nih.gov/articles/PMC11557508/pdf/GCH2-8-2300265.pdf"
      manual_note="PDF hentet via PMC etter cookie-/POW-challenge i browser."
      ;;
    "10.1016/j.scitotenv.2018.10.377")
      pdf_url="https://www.sciencedirect.com/science/article/pii/S0048969718342773/pdfft?md5=a7224dd9d524642828ae5581a8736e59&pid=1-s2.0-S0048969718342773-main.pdf"
      manual_note="PDF hentet manuelt via browser fra ScienceDirect 'View PDF'."
      ;;
  esac

  download_status="metadata_only"
  local_file_rel=""
  download_error=""

  if [ -z "$pdf_url" ] && [ -n "$pmcid_url" ]; then
    pdf_url="${pmcid_url%/}/pdf/"
  fi

  if [ -f "$pdf_path" ] && head -c 4 "$pdf_path" | grep -q '%PDF'; then
    download_status="downloaded_pdf"
    local_file_rel="research/evidence-pack/akademia/pubmed/${slug}.pdf"
    download_error="$manual_note"
    download_count=$((download_count + 1))
  elif [ -n "$pdf_url" ]; then
    tmp_pdf="${pdf_path}.download"
    rm -f "$tmp_pdf"

    if curl -fL --retry 2 --retry-all-errors --connect-timeout 20 --max-time 180 -o "$tmp_pdf" "$pdf_url"; then
      if head -c 4 "$tmp_pdf" | grep -q '%PDF'; then
        mv "$tmp_pdf" "$pdf_path"
        download_status="downloaded_pdf"
        local_file_rel="research/evidence-pack/akademia/pubmed/${slug}.pdf"
        download_count=$((download_count + 1))
      else
        rm -f "$tmp_pdf"
        download_status="download_non_pdf"
        download_error="URL returned non-PDF content"
        failed_count=$((failed_count + 1))
      fi
    else
      rm -f "$tmp_pdf"
      download_status="download_failed"
      download_error="curl download failed"
      failed_count=$((failed_count + 1))
    fi
  fi

  if [ "$download_status" = "metadata_only" ]; then
    metadata_only_count=$((metadata_only_count + 1))
  fi

  NOTE_PATH="$note_path" \
  DOI="$doi" \
  AUTHORS="$authors" \
  TITLE="$title" \
  RESOLVED_TITLE="$resolved_title" \
  YEAR="$year" \
  PMID="$pmid" \
  CATEGORY="$category" \
  FINDINGS="$findings" \
  RELEVANCE="$relevance" \
  OA_STATUS="$oa_status" \
  IS_OA="$is_oa" \
  LANDING_URL="$landing_url" \
  PDF_URL="$pdf_url" \
  SOURCE_NAME="$source_name" \
  DOWNLOAD_STATUS="$download_status" \
  LOCAL_FILE_REL="$local_file_rel" \
  DOWNLOAD_ERROR="$download_error" \
  python3 - <<'PY'
import os
import pathlib

note_path = pathlib.Path(os.environ["NOTE_PATH"])
display_title = os.environ["TITLE"]
resolved_title = os.environ["RESOLVED_TITLE"].strip()
if resolved_title:
    display_title = resolved_title

local_file = os.environ["LOCAL_FILE_REL"]
download_status = os.environ["DOWNLOAD_STATUS"]
download_error = os.environ["DOWNLOAD_ERROR"]

lines = [
    f"# {display_title}",
    "",
    f"**Forfatter(e):** {os.environ['AUTHORS']}",
    f"**År:** {os.environ['YEAR']}",
    f"**Kategori:** {os.environ['CATEGORY']}",
    f"**PMID:** {os.environ['PMID']}",
    f"**DOI:** https://doi.org/{os.environ['DOI']}",
    f"**OA-status:** {os.environ['OA_STATUS'] or 'ukjent'}",
    f"**Kilde / journal:** {os.environ['SOURCE_NAME'] or 'ukjent'}",
    f"**Landing page:** {os.environ['LANDING_URL'] or 'ikke funnet'}",
    f"**PDF-URL:** {os.environ['PDF_URL'] or 'ikke funnet'}",
    f"**Lokal fil:** {local_file or 'ikke lastet ned'}",
    f"**Status:** {download_status}",
    "",
    "## Nøkkelfunn",
    "",
    os.environ["FINDINGS"] or "Ikke fylt ut.",
    "",
    "## Relevans for Food Systems 2026",
    "",
    os.environ["RELEVANCE"] or "Ikke fylt ut.",
    "",
    "## Neste analysepunkt",
    "",
    "- Verifiser metode, datagrunnlag og geografisk overførbarhet til nordisk kontekst.",
    "- Koble artikkelen til eksisterende prosjektspor i whitepaper, verdikjeder eller policy-notater.",
    "- Noter eventuelle regulatoriske eller kommersielle implikasjoner som går utover PubMed-sammendraget.",
]

if download_error:
    lines.extend(["", "## Nedlastingsmerknad", "", download_error])

note_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY

  jq -cn \
    --arg doi "$doi" \
    --arg authors "$authors" \
    --arg title "$title" \
    --arg year "$year" \
    --arg pmid "$pmid" \
    --arg category "$category" \
    --arg findings "$findings" \
    --arg relevance "$relevance" \
    --arg slug "$slug" \
    --arg oa_status "$oa_status" \
    --arg is_oa "$is_oa" \
    --arg landing_url "$landing_url" \
    --arg pdf_url "$pdf_url" \
    --arg source_name "$source_name" \
    --arg download_status "$download_status" \
    --arg local_file_rel "$local_file_rel" \
    --arg note_file_rel "research/bibliotek/akademia/pubmed/${slug}.md" \
    --arg download_error "$download_error" \
    '{
      doi: $doi,
      authors: $authors,
      title: $title,
      year: $year,
      pmid: $pmid,
      category: $category,
      findings: $findings,
      relevance: $relevance,
      slug: $slug,
      oa_status: $oa_status,
      is_oa: ($is_oa == "true"),
      landing_url: $landing_url,
      pdf_url: $pdf_url,
      source_name: $source_name,
      download_status: $download_status,
      local_file_rel: $local_file_rel,
      note_file_rel: $note_file_rel,
      download_error: $download_error
    }' >> "$MANIFEST_JSONL"

  rm -f "$openalex_json"
done < "$META_TSV"

rm -f "$META_TSV"

python3 - "$MANIFEST_JSONL" "$INDEX_MD" <<'PY'
import json
import pathlib
import sys

manifest_path = pathlib.Path(sys.argv[1])
index_path = pathlib.Path(sys.argv[2])

rows = [json.loads(line) for line in manifest_path.read_text(encoding="utf-8").splitlines() if line.strip()]

downloaded = [row for row in rows if row["download_status"] == "downloaded_pdf"]
metadata_only = [row for row in rows if row["download_status"] == "metadata_only"]
failed = [row for row in rows if row["download_status"] not in {"downloaded_pdf", "metadata_only"}]

lines = [
    "# PubMed wave 1 index",
    "",
    f"**Dato:** 30. mars 2026",
    f"**Totalt:** {len(rows)} artikler",
    f"**Nedlastet PDF:** {len(downloaded)}",
    f"**Metadata-only:** {len(metadata_only)}",
    f"**Feilet / krever manuell sjekk:** {len(failed)}",
    "",
    "## Artikler",
    "",
    "| Status | År | Tittel | Note | PDF |",
    "|---|---:|---|---|---|",
]

for row in rows:
    note = row["note_file_rel"]
    pdf = row["local_file_rel"] or ""
    pdf_label = pdf if pdf else "-"
    lines.append(
        f"| {row['download_status']} | {row['year']} | {row['title']} | `{note}` | `{pdf_label}` |"
    )

index_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
PY

echo "Done."
echo "Downloaded PDFs: $download_count"
echo "Metadata only: $metadata_only_count"
echo "Failed/non-PDF: $failed_count"
echo "Manifest: $MANIFEST_JSONL"
echo "Index: $INDEX_MD"
