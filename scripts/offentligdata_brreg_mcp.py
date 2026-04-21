#!/usr/bin/env python3
"""Small MCP stdio shim for Norwegian company lookups via Brønnøysundregistrene.

This intentionally exposes a subset of the old OffentligData-style tool names so
existing Codex workflows can keep working while the upstream MCP endpoint is
misconfigured.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Iterable


PROTOCOL_VERSION = "2025-03-26"
SERVER_INFO = {"name": "offentligdata-brreg-shim", "version": "0.1.0"}
BASE_URL = "https://data.brreg.no/enhetsregisteret/api"
JSON_HEADERS = {
    "Accept": "application/json",
    "User-Agent": "offentligdata-brreg-shim/0.1.0",
}
LOG_PATH = "/tmp/offentligdata_brreg_mcp.log"


class ToolError(Exception):
    pass


def _log(message: str) -> None:
    try:
        with open(LOG_PATH, "a", encoding="utf-8") as handle:
            handle.write(message + "\n")
    except OSError:
        pass


def _send(message: Dict[str, Any]) -> None:
    _log(f"OUT {json.dumps(message, ensure_ascii=False)}")
    sys.stdout.write(json.dumps(message, ensure_ascii=False) + "\n")
    sys.stdout.flush()


def _success(request_id: Any, result: Dict[str, Any]) -> None:
    _send({"jsonrpc": "2.0", "id": request_id, "result": result})


def _error(request_id: Any, code: int, message: str, data: Any | None = None) -> None:
    payload: Dict[str, Any] = {"jsonrpc": "2.0", "id": request_id, "error": {"code": code, "message": message}}
    if data is not None:
        payload["error"]["data"] = data
    _send(payload)


def _tool_result(payload: Dict[str, Any], *, note: str | None = None) -> Dict[str, Any]:
    text = json.dumps(payload, ensure_ascii=False, indent=2)
    if note:
        text = f"{note}\n\n{text}"
    return {
        "content": [{"type": "text", "text": text}],
        "structuredContent": payload,
    }


def _tool_error(message: str) -> Dict[str, Any]:
    return {
        "isError": True,
        "content": [{"type": "text", "text": message}],
    }


def _require_string(arguments: Dict[str, Any], key: str) -> str:
    value = arguments.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ToolError(f"Parameter '{key}' må være en ikke-tom streng.")
    return value.strip()


def _optional_int(arguments: Dict[str, Any], key: str, default: int, minimum: int, maximum: int) -> int:
    value = arguments.get(key, default)
    if not isinstance(value, int):
        raise ToolError(f"Parameter '{key}' må være et heltall.")
    if value < minimum or value > maximum:
        raise ToolError(f"Parameter '{key}' må være mellom {minimum} og {maximum}.")
    return value


def _fetch_json(path: str, query: Dict[str, Any] | None = None) -> Dict[str, Any]:
    url = f"{BASE_URL}{path}"
    if query:
        encoded = urllib.parse.urlencode({k: v for k, v in query.items() if v is not None}, doseq=True)
        url = f"{url}?{encoded}"

    request = urllib.request.Request(url, headers=JSON_HEADERS, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            return json.loads(response.read().decode(charset))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise ToolError(f"BRREG svarte HTTP {exc.code} for {url}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise ToolError(f"Nettverksfeil mot BRREG for {url}: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise ToolError(f"Ugyldig JSON fra BRREG for {url}: {exc}") from exc


def _name_score(company_name: str, candidate_name: str) -> tuple[int, int]:
    wanted = "".join(company_name.upper().split())
    candidate = "".join(candidate_name.upper().split())
    if candidate == wanted:
        return (0, 0)
    if wanted in candidate:
        return (1, abs(len(candidate) - len(wanted)))
    return (2, abs(len(candidate) - len(wanted)))


def _search_entities(company_name: str, *, size: int = 10) -> Dict[str, Any]:
    return _fetch_json(
        "/enheter",
        {
            "navn": company_name,
            "navnMetodeForSoek": "FORTLOEPENDE",
            "size": size,
        },
    )


def _simplify_entity(entity: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "organisasjonsnummer": entity.get("organisasjonsnummer"),
        "navn": entity.get("navn"),
        "organisasjonsform": entity.get("organisasjonsform"),
        "naeringskode1": entity.get("naeringskode1"),
        "antallAnsatte": entity.get("antallAnsatte"),
        "harRegistrertAntallAnsatte": entity.get("harRegistrertAntallAnsatte"),
        "forretningsadresse": entity.get("forretningsadresse"),
        "postadresse": entity.get("postadresse"),
        "epostadresse": entity.get("epostadresse"),
        "telefon": entity.get("telefon"),
        "mobil": entity.get("mobil"),
        "hjemmeside": entity.get("hjemmeside"),
        "stiftelsesdato": entity.get("stiftelsesdato"),
        "registreringsdatoEnhetsregisteret": entity.get("registreringsdatoEnhetsregisteret"),
        "registrertIMvaregisteret": entity.get("registrertIMvaregisteret"),
        "registrertIForetaksregisteret": entity.get("registrertIForetaksregisteret"),
        "sisteInnsendteAarsregnskap": entity.get("sisteInnsendteAarsregnskap"),
        "konkurs": entity.get("konkurs"),
        "underAvvikling": entity.get("underAvvikling"),
        "underTvangsavviklingEllerTvangsopplosning": entity.get("underTvangsavviklingEllerTvangsopplosning"),
        "erIKonsern": entity.get("erIKonsern"),
        "kapital": entity.get("kapital"),
        "aktivitet": entity.get("aktivitet"),
        "vedtektsfestetFormaal": entity.get("vedtektsfestetFormaal"),
        "raw": entity,
    }


def _simplify_role_groups(data: Dict[str, Any]) -> list[Dict[str, Any]]:
    groups: list[Dict[str, Any]] = []
    for group in data.get("rollegrupper", []):
        group_type = group.get("type", {})
        entries = []
        for role in group.get("roller", []):
            person = role.get("person")
            entity = role.get("enhet")
            entries.append(
                {
                    "rollekode": role.get("type", {}).get("kode"),
                    "rollebeskrivelse": role.get("type", {}).get("beskrivelse"),
                    "fratraadt": role.get("fratraadt"),
                    "avregistrert": role.get("avregistrert"),
                    "rekkefolge": role.get("rekkefolge"),
                    "person": person,
                    "enhet": entity,
                }
            )
        groups.append(
            {
                "gruppekode": group_type.get("kode"),
                "gruppebeskrivelse": group_type.get("beskrivelse"),
                "sistEndret": group.get("sistEndret"),
                "roller": entries,
            }
        )
    return groups


def _tool_organisasjonsnummer_for_selskap(arguments: Dict[str, Any]) -> Dict[str, Any]:
    company_name = _require_string(arguments, "company_name")
    data = _search_entities(company_name, size=10)
    entities = data.get("_embedded", {}).get("enheter", [])
    if not entities:
        return _tool_result(
            {
                "query": company_name,
                "match_found": False,
                "best_match": None,
                "candidates": [],
            }
        )

    ranked = sorted(entities, key=lambda entity: _name_score(company_name, entity.get("navn", "")))
    best = ranked[0]
    payload = {
        "query": company_name,
        "match_found": True,
        "best_match": {
            "organisasjonsnummer": best.get("organisasjonsnummer"),
            "navn": best.get("navn"),
            "organisasjonsform": best.get("organisasjonsform"),
            "forretningsadresse": best.get("forretningsadresse"),
        },
        "candidates": [
            {
                "organisasjonsnummer": entity.get("organisasjonsnummer"),
                "navn": entity.get("navn"),
                "organisasjonsform": entity.get("organisasjonsform"),
                "forretningsadresse": entity.get("forretningsadresse"),
            }
            for entity in ranked[:5]
        ],
        "source": "Brønnøysundregistrene Enhetsregisteret",
    }
    return _tool_result(payload)


def _tool_selskapsdetaljer(arguments: Dict[str, Any]) -> Dict[str, Any]:
    org_nr = _require_string(arguments, "org_nr")
    entity = _fetch_json(f"/enheter/{org_nr}")
    payload = {
        "org_nr": org_nr,
        "source": "Brønnøysundregistrene Enhetsregisteret",
        "company": _simplify_entity(entity),
    }
    return _tool_result(payload)


def _tool_roller_i_enhet(arguments: Dict[str, Any]) -> Dict[str, Any]:
    org_number = _require_string(arguments, "org_number")
    data = _fetch_json(f"/enheter/{org_number}/roller")
    payload = {
        "org_number": org_number,
        "source": "Brønnøysundregistrene Roller i virksomheten",
        "rollegrupper": _simplify_role_groups(data),
    }
    return _tool_result(payload)


def _tool_underenheter_for_selskap(arguments: Dict[str, Any]) -> Dict[str, Any]:
    overordnet = _require_string(arguments, "overordnet_enhet")
    size = _optional_int(arguments, "size", default=20, minimum=1, maximum=100)
    data = _fetch_json("/underenheter", {"overordnetEnhet": overordnet, "size": size})
    units = data.get("_embedded", {}).get("underenheter", [])
    payload = {
        "overordnet_enhet": overordnet,
        "count": len(units),
        "total_elements": data.get("page", {}).get("totalElements"),
        "underenheter": [
            {
                "organisasjonsnummer": unit.get("organisasjonsnummer"),
                "navn": unit.get("navn"),
                "organisasjonsform": unit.get("organisasjonsform"),
                "naeringskode1": unit.get("naeringskode1"),
                "antallAnsatte": unit.get("antallAnsatte"),
                "beliggenhetsadresse": unit.get("beliggenhetsadresse"),
                "postadresse": unit.get("postadresse"),
                "telefon": unit.get("telefon"),
            }
            for unit in units
        ],
        "source": "Brønnøysundregistrene Enhetsregisteret",
    }
    return _tool_result(payload)


def _tool_get_company_last_financial_statement(arguments: Dict[str, Any]) -> Dict[str, Any]:
    org_number = _require_string(arguments, "org_number")
    entity = _fetch_json(f"/enheter/{org_number}")
    payload = {
        "org_number": org_number,
        "available": True,
        "source": "Brønnøysundregistrene Enhetsregisteret",
        "latest_annual_accounts_year": entity.get("sisteInnsendteAarsregnskap"),
        "employee_count": entity.get("antallAnsatte"),
        "share_capital": entity.get("kapital"),
        "registered_in_business_register": entity.get("registrertIForetaksregisteret"),
        "registered_in_vat_register": entity.get("registrertIMvaregisteret"),
        "note": (
            "BRREG sine åpne data eksponerer ikke fullstendige regnskapslinjer i dette endepunktet. "
            "Denne shim-en returnerer siste innsendte årsregnskap-år og relaterte registermetadata."
        ),
    }
    return _tool_result(payload)


TOOLS: Dict[str, Dict[str, Any]] = {
    "organisasjonsnummer_for_selskap": {
        "description": "Finn organisasjonsnummer for et selskap basert på navn via Brønnøysundregistrene.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "company_name": {"type": "string", "description": "Selskapsnavn som skal søkes opp."}
            },
            "required": ["company_name"],
        },
        "handler": _tool_organisasjonsnummer_for_selskap,
    },
    "selskapsdetaljer": {
        "description": "Hent selskapsdetaljer for et organisasjonsnummer via Brønnøysundregistrene.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "org_nr": {"type": "string", "description": "Organisasjonsnummer med 9 siffer."}
            },
            "required": ["org_nr"],
        },
        "handler": _tool_selskapsdetaljer,
    },
    "roller_i_enhet": {
        "description": "Hent roller for en virksomhet via Brønnøysundregistrene.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "org_number": {"type": "string", "description": "Organisasjonsnummer med 9 siffer."}
            },
            "required": ["org_number"],
        },
        "handler": _tool_roller_i_enhet,
    },
    "underenheter_for_selskap": {
        "description": "Hent underenheter for en overordnet enhet via Brønnøysundregistrene.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "overordnet_enhet": {"type": "string", "description": "Overordnet organisasjonsnummer."},
                "size": {"type": "integer", "description": "Antall resultater som skal hentes.", "default": 20},
            },
            "required": ["overordnet_enhet"],
        },
        "handler": _tool_underenheter_for_selskap,
    },
    "get_company_last_financial_statement": {
        "description": "Returner BRREG-metadata om siste innsendte årsregnskap for selskapet.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "org_number": {"type": "string", "description": "Organisasjonsnummer med 9 siffer."}
            },
            "required": ["org_number"],
        },
        "handler": _tool_get_company_last_financial_statement,
    },
}


def _handle_initialize(request_id: Any, params: Dict[str, Any]) -> None:
    protocol = params.get("protocolVersion") or PROTOCOL_VERSION
    _success(
        request_id,
        {
            "protocolVersion": protocol,
            "capabilities": {"tools": {}},
            "serverInfo": SERVER_INFO,
        },
    )


def _handle_tools_list(request_id: Any) -> None:
    tools = [
        {
            "name": name,
            "description": spec["description"],
            "inputSchema": spec["inputSchema"],
        }
        for name, spec in TOOLS.items()
    ]
    _success(request_id, {"tools": tools})


def _handle_resources_list(request_id: Any) -> None:
    _success(request_id, {"resources": []})


def _handle_resource_templates_list(request_id: Any) -> None:
    _success(request_id, {"resourceTemplates": []})


def _handle_tools_call(request_id: Any, params: Dict[str, Any]) -> None:
    name = params.get("name")
    arguments = params.get("arguments") or {}
    _log(f"CALL name={name} arguments={json.dumps(arguments, ensure_ascii=False)}")
    if name not in TOOLS:
        _success(request_id, _tool_error(f"Verktøy '{name}' finnes ikke i offentligdata-brreg-shim."))
        return

    if not isinstance(arguments, dict):
        _success(request_id, _tool_error("arguments må være et objekt."))
        return

    try:
        result = TOOLS[name]["handler"](arguments)
        _success(request_id, result)
    except ToolError as exc:
        _success(request_id, _tool_error(str(exc)))
    except Exception as exc:  # pragma: no cover - defensive server boundary
        _success(request_id, _tool_error(f"Uventet feil i verktøy '{name}': {exc}"))


def _read_messages() -> Iterable[Dict[str, Any]]:
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        try:
            message = json.loads(line)
            _log(f"IN {json.dumps(message, ensure_ascii=False)}")
            yield message
        except json.JSONDecodeError as exc:
            _error(None, -32700, f"Invalid JSON: {exc}")


def main() -> int:
    _log("SERVER START")
    for message in _read_messages():
        request_id = message.get("id")
        method = message.get("method")
        params = message.get("params") or {}

        if method == "initialize":
            _handle_initialize(request_id, params if isinstance(params, dict) else {})
        elif method == "notifications/initialized":
            continue
        elif method == "ping":
            _success(request_id, {})
        elif method == "tools/list":
            _handle_tools_list(request_id)
        elif method == "tools/call":
            _handle_tools_call(request_id, params if isinstance(params, dict) else {})
        elif method == "resources/list":
            _handle_resources_list(request_id)
        elif method == "resources/templates/list":
            _handle_resource_templates_list(request_id)
        elif request_id is not None:
            _error(request_id, -32601, f"Method not found: {method}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
