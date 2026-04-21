"""Validate URLs in r9-matrix.json and r9-kpi-catalog.json primary_sources.

Marks each citation with status (ok/dead/redirect) and last_checked timestamp.
Uses HEAD requests with 15s timeout. Treats 200/301/302/304/307/308 as ok.
"""
from __future__ import annotations

import datetime as dt
import json
import urllib.request
from pathlib import Path
from urllib.error import HTTPError, URLError
import socket

PATHS = [
    Path("public/data/food-systems/r9-matrix.json"),
    Path("public/data/food-systems/r9-kpi-catalog.json"),
]


BROWSER_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"


def _attempt(url: str, method: str, timeout: int) -> tuple[str, int | None]:
    request = urllib.request.Request(url, method=method, headers={"User-Agent": BROWSER_UA})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return ("ok", response.status)
    except HTTPError as e:
        if e.code in (301, 302, 304, 307, 308):
            return ("redirect", e.code)
        if e.code in (401, 403):
            return ("blocked", e.code)
        return ("dead", e.code)
    except (URLError, socket.timeout, ConnectionError):
        return ("dead", None)
    except Exception:
        return ("dead", None)


def check_url(url: str, timeout: int = 15) -> tuple[str, int | None]:
    if not url.startswith(("http://", "https://")):
        return ("invalid_scheme", None)
    head = _attempt(url, "HEAD", timeout)
    if head[0] in ("ok", "redirect"):
        return head
    # HEAD failed — many sites disallow HEAD or return 403 to bots; retry with GET
    get = _attempt(url, "GET", timeout)
    if get[0] in ("ok", "redirect"):
        return get
    if get[0] == "blocked" or head[0] == "blocked":
        return ("blocked", get[1] or head[1])
    return get


def main() -> int:
    today = dt.date.today().isoformat()
    for path in PATHS:
        data = json.loads(path.read_text(encoding="utf-8"))
        primary = data.get("primary_sources", {})
        citations = primary.get("citations", [])
        counts = {"ok": 0, "redirect": 0, "blocked": 0, "dead": 0}
        for cite in citations:
            url = cite.get("url", "")
            status, code = check_url(url)
            cite["status"] = status
            cite["http_status"] = code
            counts[status] = counts.get(status, 0) + 1
        primary["last_checked"] = today
        primary["link_check_summary"] = {"total": len(citations), **counts}
        reachable = counts["ok"] + counts["redirect"] + counts["blocked"]
        if counts["dead"] == 0:
            primary["verification_status"] = (
                f"alle {len(citations)} URL-er er reachable per {today} "
                f"({counts['blocked']} returnerer 401/403 ved HEAD/GET fra bot — "
                "verifiser i nettleser); innholdet må fortsatt verifiseres uavhengig før sitering"
            )
        else:
            primary["verification_status"] = (
                f"{counts['dead']} av {len(citations)} URL-er er døde per {today}; "
                f"{reachable} levende ({counts['blocked']} bot-blokkert). "
                "Innhold må verifiseres uavhengig før sitering"
            )
        data["primary_sources"] = primary
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(
            f"{path}: {counts['ok']} ok / {counts['redirect']} redirect / "
            f"{counts['blocked']} blocked / {counts['dead']} dead (of {len(citations)})"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
