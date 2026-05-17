# Incoming Sources Manifest

Single source of truth for pending ingestion work.
Updated: 2026-03-19

## Pending source families

| # | Path | Description | Files | Size | Status | Target step | Notes |
|---|------|-------------|-------|------|--------|-------------|-------|
| 1 | `research/landbrukarena_transcripts/` | YouTube transcripts from LandBruk Arena channel (12 .txt, 13 .json, manifest.csv, manifest.json, ALL_TRANSCRIPTS.md) | 28 | 368 KB | **ingested** | step 10 | 17 transcripts imported (12 YouTube captions + 5 local ASR). Import script: `scripts/import-transcripts.ts`. 2 videos still missing (index 14: empty ASR, index 15: download error). |
| 2 | `scripts/fetch_youtube_channel_transcripts.py` | Python CLI tool that produced the transcripts above (yt-dlp + youtube-transcript-api) | 1 | 6 KB | **ingested** | step 10 | Tooling used for transcript fetch. Retained for future channel updates. |
| 3 | `scripts/transcribe_missing_youtube_videos.py` | Whisper-based local ASR for videos missing YouTube captions (faster-whisper + yt-dlp) | 1 | 5 KB | **ingested** | step 10 | Used to fill 5 transcripts where YouTube captions were disabled. Retained for future use. |
| 4 | `research/evidence-pack/akademia/wur-elbersen-agri-residues-2022.pdf` | Wageningen Food & Biobased Research report 2247 on circular applications of agri-residues, DOI 10.18174/563389 | 1 | 1.8 MB | **ingested** | B-sidestream / C-adoption | Moved from repo root and registered as `src-170` in `src/lib/data/sources.ts` on 2026-05-17. |

## Disposition key

- **parked** -- Acknowledged but not yet scheduled for ingestion. Do not import into the database.
- **ready** -- Cleared for ingestion in the current pipeline step.
- **ingested** -- Successfully imported; row kept for audit trail.

## Rules

1. Every untracked research artifact or fetch script must have a row here before it is committed.
2. Nothing moves to "ready" without an explicit decision tied to a pipeline step.
3. After ingestion, update the status to "ingested" and record the commit hash.
