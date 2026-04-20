#!/usr/bin/env python3
"""Extract PDF metadata with PyMuPDF (fitz) and emit markdown in the
pdf-gjennomgang-*.md format.

Replaces pdftotext-based extraction, which dropped glyphs (e.g. 'f', 'r')
in Elsevier/MDPI fonts.

Usage:
    python3 scripts/extract-pdf-metadata.py \
        --input-dir research/evidence-pack/akademia/perplexity-runde \
        --output research/analyse/pdf-gjennomgang-perplexity-runde.md \
        --title "Akademia -- Perplexity-runde"
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF


def _parse_pdf_date(raw: str | None) -> str:
    if not raw:
        return ""
    m = re.match(r"D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})", raw)
    if not m:
        return raw
    year, month, day, hh, mm, ss = m.groups()
    try:
        d = dt.datetime(int(year), int(month), int(day), int(hh), int(mm), int(ss))
    except ValueError:
        return raw
    return d.strftime("%Y-%m-%d %H:%M")


def _fmt(value: str | None, missing: str = "(ikke tilgjengelig i PDF-metadata)") -> str:
    if value is None:
        return missing
    v = value.replace("﻿", "").strip()
    return v if v else missing


def _first_text(page: fitz.Page, chars: int = 400) -> str:
    text = page.get_text("text") or ""
    text = re.sub(r"\s+", " ", text).strip()
    return text[:chars]


def describe(pdf_path: Path) -> dict:
    doc = fitz.open(pdf_path)
    meta = doc.metadata or {}
    first_text = _first_text(doc[0]) if doc.page_count else ""
    encrypted = "ja" if doc.is_encrypted else "nei"
    result = {
        "file": pdf_path.name,
        "title": _fmt(meta.get("title")),
        "author": _fmt(meta.get("author")),
        "subject": _fmt(meta.get("subject")),
        "keywords": _fmt(meta.get("keywords")),
        "creator": _fmt(meta.get("creator")),
        "producer": _fmt(meta.get("producer")),
        "created": _parse_pdf_date(meta.get("creationDate")) or "(ikke tilgjengelig)",
        "modified": _parse_pdf_date(meta.get("modDate")) or "(ikke tilgjengelig)",
        "pages": doc.page_count,
        "encrypted": encrypted,
        "first_text": first_text or "(tomt)",
    }
    doc.close()
    return result


def md_section(index: int, info: dict) -> str:
    year_match = re.search(r"(?<!\d)(19|20)\d{2}(?!\d)", info["file"])
    file_year = year_match.group(0) if year_match else "(ikke angitt i filnavn)"
    missing_fields = sum(
        1
        for key in ("title", "author", "subject", "keywords", "creator", "producer")
        if info[key].startswith("(ikke tilgjengelig")
    )
    quality = (
        "Komplett metadata."
        if missing_fields == 0
        else f"Mangler {missing_fields} felt i PDF-metadata."
    )
    return "\n".join(
        [
            f"## {index}. {info['file']}",
            "",
            "| Felt | Verdi |",
            "|------|-------|",
            f"| **Fil** | {info['file']} |",
            f"| **Tittel (metadata)** | {info['title']} |",
            f"| **Forfatter(e)** | {info['author']} |",
            f"| **Subject (metadata)** | {info['subject']} |",
            f"| **Nøkkelord** | {info['keywords']} |",
            f"| **Antall sider** | {info['pages']} |",
            f"| **År i filnavn** | {file_year} |",
            f"| **Skaper (Creator)** | {info['creator']} |",
            f"| **Produsent (Producer)** | {info['producer']} |",
            f"| **Created** | {info['created']} |",
            f"| **ModDate** | {info['modified']} |",
            f"| **Kryptering** | {info['encrypted']} |",
            f"| **Første sidetekst (PyMuPDF)** | {info['first_text']} |",
            "",
            f"**Datakvalitet:** {quality}",
            "",
            "---",
            "",
        ]
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--title", default="PDF-gjennomgang")
    args = parser.parse_args()

    if not args.input_dir.is_dir():
        print(f"input-dir does not exist: {args.input_dir}", file=sys.stderr)
        return 1

    pdfs = sorted(p for p in args.input_dir.iterdir() if p.suffix.lower() == ".pdf")
    if not pdfs:
        print(f"No PDFs in {args.input_dir}", file=sys.stderr)
        return 1

    today = dt.date.today().isoformat()
    header = [
        f"# PDF-gjennomgang: {args.title}",
        "",
        f"Generert: {today}",
        f"Kilde: `{args.input_dir}/`",
        f"Antall dokumenter: {len(pdfs)}",
        "Ekstraksjon: PyMuPDF (fitz). PDF-metadata og første sidetekst hentes direkte fra dokumentinformasjon — ingen ekstrapolering.",
        "",
        "---",
        "",
    ]

    sections = [md_section(i + 1, describe(p)) for i, p in enumerate(pdfs)]

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text("\n".join(header) + "\n".join(sections), encoding="utf-8")
    print(f"Wrote {args.output} ({len(pdfs)} PDFs)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
