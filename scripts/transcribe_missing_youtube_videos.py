#!/usr/bin/env python3

from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

try:
    from faster_whisper import WhisperModel
except ImportError as exc:  # pragma: no cover - runtime dependency message
    raise SystemExit(
        "Missing dependency: faster-whisper. "
        "Install it with `python3 -m pip install faster-whisper` "
        "or provide it via PYTHONPATH."
    ) from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download and locally transcribe YouTube videos missing captions."
    )
    parser.add_argument("--manifest", required=True, help="Path to existing transcript manifest.json")
    parser.add_argument("--output-dir", required=True, help="Directory for local ASR output")
    parser.add_argument(
        "--model",
        default="small",
        help="faster-whisper model name (default: small)",
    )
    parser.add_argument(
        "--temp-dir",
        default="/tmp/yt_local_asr",
        help="Temporary directory for downloaded audio",
    )
    return parser.parse_args()


def format_timestamp(seconds: float) -> str:
    millis = int(round(seconds * 1000))
    hours, rem = divmod(millis, 3_600_000)
    minutes, rem = divmod(rem, 60_000)
    secs, millis = divmod(rem, 1000)
    if hours:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"
    return f"{minutes:02d}:{secs:02d}.{millis:03d}"


def write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_text(path: Path, snippets: list[dict[str, Any]]) -> None:
    lines = [f"[{format_timestamp(item['start'])}] {item['text'].strip()}" for item in snippets]
    lines = [line for line in lines if not line.endswith("] ")]
    path.write_text("\n".join(lines) + ("\n" if lines else ""), encoding="utf-8")


def download_audio(url: str, target_stem: Path) -> Path:
    cmd = [
        "yt-dlp",
        "-f",
        "ba",
        "-o",
        str(target_stem) + ".%(ext)s",
        url,
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    matches = list(target_stem.parent.glob(target_stem.name + ".*"))
    if not matches:
        raise FileNotFoundError(f"No audio download found for {url}")
    return matches[0]


def main() -> int:
    args = parse_args()
    manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    temp_dir = Path(args.temp_dir).resolve()
    temp_dir.mkdir(parents=True, exist_ok=True)

    missing = [item for item in manifest if item.get("status") != "ok"]
    model = WhisperModel(args.model, device="cpu", compute_type="int8")

    rows: list[dict[str, Any]] = []
    print(f"Processing {len(missing)} videos with local ASR")

    for item in missing:
        index = item["index"]
        video_id = item["video_id"]
        title = item["title"]
        url = item["url"]
        audio_stem = temp_dir / f"{index:02d}-{video_id}"
        txt_path = output_dir / f"{index:02d}-{video_id}-local-asr-{args.model}.txt"
        json_path = output_dir / f"{index:02d}-{video_id}-local-asr-{args.model}.json"

        row: dict[str, Any] = {
            "index": index,
            "video_id": video_id,
            "title": title,
            "url": url,
            "status": "ok",
            "model": args.model,
            "language": "no",
            "segment_count": 0,
            "txt_file": txt_path.name,
            "json_file": json_path.name,
            "error": None,
        }

        try:
            audio_path = download_audio(url, audio_stem)
            segments, info = model.transcribe(
                str(audio_path),
                language="no",
                vad_filter=True,
                beam_size=3,
                condition_on_previous_text=False,
            )
            snippet_rows = [
                {
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text.strip(),
                }
                for segment in segments
                if segment.text.strip()
            ]
            row["segment_count"] = len(snippet_rows)
            row["language"] = info.language
            row["language_probability"] = info.language_probability

            write_text(txt_path, snippet_rows)
            write_json(
                json_path,
                {
                    "video_id": video_id,
                    "title": title,
                    "url": url,
                    "source": "local_asr",
                    "model": args.model,
                    "language": info.language,
                    "language_probability": info.language_probability,
                    "segment_count": len(snippet_rows),
                    "quality_note": "Locally generated transcript. Review before quoting.",
                    "snippets": snippet_rows,
                },
            )
            print(f"[{index:02d}] ok  {video_id}  {len(snippet_rows)} segments")
        except Exception as exc:  # pragma: no cover - network dependent
            row["status"] = "error"
            row["error"] = f"{type(exc).__name__}: {exc}"
            print(f"[{index:02d}] err {video_id}  {row['error']}", file=sys.stderr)

        rows.append(row)
        time.sleep(0.2)

    write_json(output_dir / "local_asr_manifest.json", rows)

    with (output_dir / "local_asr_manifest.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "index",
                "video_id",
                "title",
                "url",
                "status",
                "model",
                "language",
                "language_probability",
                "segment_count",
                "txt_file",
                "json_file",
                "error",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    ok_count = sum(1 for row in rows if row["status"] == "ok")
    print(f"Completed local ASR: {ok_count}/{len(rows)}")
    return 0 if ok_count else 1


if __name__ == "__main__":
    raise SystemExit(main())
