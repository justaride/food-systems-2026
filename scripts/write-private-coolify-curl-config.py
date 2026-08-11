#!/usr/bin/env python3
"""Write a mode-0600 curl config without putting Coolify secrets in argv."""

from __future__ import annotations

import os
import stat
import sys
from pathlib import Path
from typing import NoReturn
from urllib.parse import urlsplit


def fail(message: str) -> NoReturn:
    raise SystemExit(message)


def curl_quote(value: str) -> str:
    if any(ord(character) < 0x20 or ord(character) == 0x7F for character in value):
        fail("curl config values must not contain control characters")
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: write-private-coolify-curl-config.py OUTPUT_FILE")

    output_path = Path(sys.argv[1])
    api_path = os.environ.get("COOLIFY_API_PATH", "")
    base_url = os.environ.get("COOLIFY_BASE_URL", "").rstrip("/")
    token = os.environ.get("COOLIFY_API_TOKEN", "")
    access_client_id = os.environ.get("CF_ACCESS_CLIENT_ID", "")
    access_client_secret = os.environ.get("CF_ACCESS_CLIENT_SECRET", "")

    parsed = urlsplit(base_url)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or parsed.query
        or parsed.fragment
    ):
        fail("COOLIFY_BASE_URL must be a credential-free HTTPS base URL")
    if not api_path.startswith("/") or api_path.startswith("//"):
        fail("Coolify API path must be a single-root relative path")
    if not token:
        fail("COOLIFY_API_TOKEN is required")
    if bool(access_client_id) != bool(access_client_secret):
        fail("CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET must be provided together")

    try:
        file_stat = output_path.lstat()
    except FileNotFoundError:
        fail("output file must already exist")
    if not stat.S_ISREG(file_stat.st_mode) or output_path.is_symlink():
        fail("output path must be an existing regular file, not a symlink")

    lines = [
        f"url = {curl_quote(base_url + api_path)}",
        f"header = {curl_quote('Authorization: Bearer ' + token)}",
    ]
    if access_client_id:
        lines.extend(
            [
                f"header = {curl_quote('CF-Access-Client-Id: ' + access_client_id)}",
                f"header = {curl_quote('CF-Access-Client-Secret: ' + access_client_secret)}",
            ]
        )
    content = "\n".join([*lines, ""])
    descriptor = os.open(
        output_path,
        os.O_WRONLY | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0),
    )
    with os.fdopen(descriptor, "w", encoding="utf-8") as handle:
        os.fchmod(descriptor, 0o600)
        handle.write(content)


if __name__ == "__main__":
    main()
