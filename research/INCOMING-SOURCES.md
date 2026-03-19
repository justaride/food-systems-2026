# Incoming Sources Manifest

Single source of truth for pending ingestion work.
Updated: 2026-03-19

## Pending source families

| # | Path | Description | Files | Size | Status | Target step | Notes |
|---|------|-------------|-------|------|--------|-------------|-------|
| 1 | `research/landbrukarena_transcripts/` | YouTube transcripts from LandBruk Arena channel (12 .txt, 13 .json, manifest.csv, manifest.json, ALL_TRANSCRIPTS.md) | 28 | 368 KB | **parked** | step 10 | Auto-generated captions in Norwegian/English. Ingest only after full document pipeline is operational. |
| 2 | `scripts/fetch_youtube_channel_transcripts.py` | Python CLI tool that produced the transcripts above (yt-dlp + youtube-transcript-api) | 1 | 6 KB | **parked** | step 10 | Tooling for transcript ingestion. No action until step 10. |
| 3 | `scripts/transcribe_missing_youtube_videos.py` | Whisper-based local ASR for videos missing YouTube captions (faster-whisper + yt-dlp) | 1 | 5 KB | **parked** | step 10 | Companion to row 2. Downloads audio and transcribes locally. |

## Disposition key

- **parked** -- Acknowledged but not yet scheduled for ingestion. Do not import into the database.
- **ready** -- Cleared for ingestion in the current pipeline step.
- **ingested** -- Successfully imported; row kept for audit trail.

## Rules

1. Every untracked research artifact or fetch script must have a row here before it is committed.
2. Nothing moves to "ready" without an explicit decision tied to a pipeline step.
3. After ingestion, update the status to "ingested" and record the commit hash.
