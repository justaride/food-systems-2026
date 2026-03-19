#!/usr/bin/env python3

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
from pathlib import Path
from typing import Any

import yt_dlp

try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError as exc:  # pragma: no cover - runtime dependency message
    raise SystemExit(
        "Missing dependency: youtube-transcript-api. "
        "Install it with `python3 -m pip install youtube-transcript-api` "
        "or provide it via PYTHONPATH."
    ) from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch all available transcripts for videos from a YouTube channel."
    )
    parser.add_argument("--channel-url", required=True, help="YouTube channel /videos URL")
    parser.add_argument("--output-dir", required=True, help="Directory for transcript output")
    parser.add_argument(
        "--preferred-languages",
        default="no,nb,nn,en",
        help="Comma-separated language priority for transcript selection",
    )
    parser.add_argument(
        "--sleep-seconds",
        type=float,
        default=0.25,
        help="Delay between transcript requests",
    )
    return parser.parse_args()


def slugify(value: str, max_length: int = 80) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[-\s]+", "-", value).strip("-_")
    return (value or "video")[:max_length]


def format_timestamp(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hours, rem = divmod(millis, 3_600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, millis = divmod(rem, 1000)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"
    return f"{minutes:02d}:{secs:02d}.{millis:03d}"


def choose_transcript(transcript_list: Any, preferred_languages: list[str]) -> Any:
    transcripts = list(transcript_list)
    manual = [t for t in transcripts if not t.is_generated]
    generated = [t for t in transcripts if t.is_generated]

    for pool in (manual, generated):
        for lang in preferred_languages:
            for transcript in pool:
                if transcript.language_code == lang:
                    return transcript

    if manual:
        return manual[0]
    if generated:
        return generated[0]
    raise LookupError("No transcripts available")


def extract_channel_entries(channel_url: str) -> list[dict[str, Any]]:
    ydl_opts = {
        "extract_flat": True,
        "quiet": True,
        "skip_download": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(channel_url, download=False)
    return list(info.get("entries") or [])


def write_text_transcript(path: Path, snippets: list[dict[str, Any]]) -> None:
    lines = [f"[{format_timestamp(item['start'])}] {item['text']}" for item in snippets]
    path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    preferred_languages = [
        item.strip() for item in args.preferred_languages.split(",") if item.strip()
    ]

    entries = extract_channel_entries(args.channel_url)
    api = YouTubeTranscriptApi()
    manifest: list[dict[str, Any]] = []

    print(f"Found {len(entries)} videos on channel")

    for index, entry in enumerate(entries, start=1):
        video_id = entry.get("id")
        title = entry.get("title") or video_id or f"video-{index}"
        url = f"https://www.youtube.com/watch?v={video_id}"
        slug = slugify(title)
        base_name = f"{index:02d}-{slug}-{video_id}"
        txt_path = output_dir / f"{base_name}.txt"
        json_path = output_dir / f"{base_name}.json"

        row: dict[str, Any] = {
            "index": index,
            "video_id": video_id,
            "title": title,
            "url": url,
            "status": "ok",
            "language_code": None,
            "language": None,
            "is_generated": None,
            "is_translatable": None,
            "segment_count": 0,
            "txt_file": txt_path.name,
            "json_file": json_path.name,
            "error": None,
        }

        try:
            transcript_list = api.list(video_id)
            transcript = choose_transcript(transcript_list, preferred_languages)
            fetched = transcript.fetch()
            snippets = [
                {
                    "text": snippet.text,
                    "start": snippet.start,
                    "duration": snippet.duration,
                }
                for snippet in fetched
            ]

            row.update(
                {
                    "language_code": transcript.language_code,
                    "language": transcript.language,
                    "is_generated": transcript.is_generated,
                    "is_translatable": transcript.is_translatable,
                    "segment_count": len(snippets),
                }
            )

            write_text_transcript(txt_path, snippets)
            write_json(
                json_path,
                {
                    "video_id": video_id,
                    "title": title,
                    "url": url,
                    "language_code": transcript.language_code,
                    "language": transcript.language,
                    "is_generated": transcript.is_generated,
                    "is_translatable": transcript.is_translatable,
                    "segment_count": len(snippets),
                    "snippets": snippets,
                },
            )
            print(
                f"[{index:02d}/{len(entries):02d}] ok  {video_id}  "
                f"{transcript.language_code}  {len(snippets)} segments"
            )
        except Exception as exc:  # pragma: no cover - network dependent
            row["status"] = "error"
            row["error"] = f"{type(exc).__name__}: {exc}"
            print(f"[{index:02d}/{len(entries):02d}] err {video_id}  {row['error']}", file=sys.stderr)

        manifest.append(row)
        if args.sleep_seconds > 0:
            time.sleep(args.sleep_seconds)

    write_json(output_dir / "manifest.json", manifest)

    with (output_dir / "manifest.csv").open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "index",
                "video_id",
                "title",
                "url",
                "status",
                "language_code",
                "language",
                "is_generated",
                "is_translatable",
                "segment_count",
                "txt_file",
                "json_file",
                "error",
            ],
        )
        writer.writeheader()
        writer.writerows(manifest)

    ok_count = sum(1 for item in manifest if item["status"] == "ok")
    print(f"Completed: {ok_count}/{len(manifest)} transcripts fetched")
    return 0 if ok_count else 1


if __name__ == "__main__":
    raise SystemExit(main())
