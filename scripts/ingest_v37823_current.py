#!/usr/bin/env python3
"""
Merge and grow src/package/static/current_2026.log.gz from v37823.1blu.de:/var/log/current.

* Lines are OpenWeather-style JSON with top-level "dt" (see props s4c:weather).
* Legacy static/current_update.log.gz (plain gzip of JSON, or tar-in-gz + WeatherAPI array)
  is merged once, then removed after a successful write.
* After a successful local write, the remote /var/log/current is removed so the next run
  only fetches new content (rotate-by-delete on the host).
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import os
import shutil
import subprocess
import sys
import tarfile
import tempfile
from pathlib import Path
from typing import Dict, Iterator, List, Optional, Set, Tuple

REPO = Path(__file__).resolve().parents[1]
STATIC = REPO / "src" / "package" / "static"
OUT_GZ = STATIC / "current_2026.log.gz"
LEGACY_GZ = STATIC / "current_update.log.gz"

REMOTE = os.environ.get("REMOTE_USER_HOST", "tbaublys@v37823.1blu.de")
REMOTE_PATH = os.environ.get("REMOTE_PATH", "/var/log/current")


def _is_ustar(data: bytes) -> bool:
    return len(data) > 300 and data[257:262] == b"ustar"


def _decompress_gz(path: Path) -> bytes:
    with gzip.open(path, "rb") as f:
        return f.read()


def _extract_text_from_mixed_gz(path: Path) -> str:
    """Plain gzip of text, or gzip of ustar with a member named 'current'."""
    raw = _decompress_gz(path)
    if not _is_ustar(raw):
        return raw.decode("utf-8", errors="replace")
    with tarfile.open(fileobj=io.BytesIO(raw), mode="r:") as tf:
        for m in tf.getmembers():
            if not m.isfile():
                continue
            if "PaxHeader" in m.name or "._" in m.name:
                continue
            if m.name == "current" or m.name.endswith("/current"):
                ex = tf.extractfile(m)
                if ex:
                    return ex.read().decode("utf-8", errors="replace")
    raise ValueError("tar archive: no usable 'current' file found")


def _parse_json_lines_or_array(text: str) -> List[dict]:
    text = text.strip()
    if not text:
        return []
    if text.startswith("["):
        data = json.loads(text)
        if isinstance(data, list):
            return [x for x in data if isinstance(x, dict)]
        return [data] if isinstance(data, dict) else []
    out: List[dict] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            o = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(o, dict):
            out.append(o)
    return out


def _weatherapi_item_to_owm(item: dict) -> dict:
    loc = item.get("location") or {}
    cur = item.get("current") or {}
    cond = (cur.get("condition") or {}) if isinstance(cur.get("condition"), dict) else {}
    name = str(loc.get("name") or "")
    country = str(loc.get("country") or "")
    lat, lon = loc.get("lat"), loc.get("lon")
    dt = loc.get("localtime_epoch")
    if dt is None:
        dt = cur.get("last_updated_epoch")
    if dt is None:
        raise ValueError("weatherapi: no localtime_epoch/last_updated_epoch")
    dt = int(dt)
    owm: dict = {
        "dt": dt,
        "name": name,
        "sys": {"country": country},
        "main": {
            "temp": cur.get("temp_c"),
            "humidity": cur.get("humidity"),
        },
        "weather": [{"main": cond.get("text") or "Custom", "description": (cond.get("text") or "")[:200]}],
        "wind": {
            "speed": cur.get("wind_kph"),
            "deg": cur.get("wind_degree"),
        },
        "clouds": {"all": cur.get("cloud")},
        "_merged_from": "weatherapi",
    }
    if lat is not None and lon is not None:
        owm["coord"] = {"lat": float(lat), "lon": float(lon)}
    pm = cur.get("pressure_mb")
    if pm is not None:
        owm["main"]["pressure"] = int(round(float(pm)))
    return owm


def _dict_to_owm(o: dict) -> Optional[dict]:
    """OWM line as-is, or WeatherAPI {location,current} -> OWM shape."""
    if o.get("dt") is not None and "location" not in o:
        return o
    if o.get("location") and o.get("current"):
        try:
            return _weatherapi_item_to_owm(o)
        except (ValueError, TypeError, KeyError):
            return None
    return None


def _line_key(d: dict) -> Tuple[int, str, str]:
    name = str(d.get("name") or d.get("city") or "")
    dt = d.get("dt")
    if dt is None:
        return (0, name, "")
    body = json.dumps(d, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    h = hashlib.sha256(body.encode("utf-8")).hexdigest()[:16]
    return (int(dt), name, h)


def _line_from_dict(d: dict) -> str:
    return json.dumps(d, ensure_ascii=False, separators=(",", ":"))


def _iter_owm_lines_from_gz(path: Path) -> Iterator[dict]:
    with gzip.open(path, "rt", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                o = json.loads(line)
            except json.JSONDecodeError:
                continue
            if isinstance(o, dict) and "dt" in o:
                yield o


def _read_remote(ssh: str) -> bytes:
    r = subprocess.run(
        [
            "ssh",
            "-o",
            "BatchMode=yes",
            "-o",
            "StrictHostKeyChecking=accept-new",
            ssh,
            f"test -f {REMOTE_PATH} && cat -- {REMOTE_PATH} || true",
        ],
        capture_output=True,
    )
    if r.returncode != 0:
        print(
            f"ingest: ssh: {r.stderr.decode('utf-8', errors='replace')[:500]}",
            file=sys.stderr,
        )
        return b""
    return r.stdout or b""


def _clear_remote(ssh: str) -> bool:
    inner = os.environ.get("REMOTE_CLEAR_CMD", "").strip()
    if not inner:
        inner = f"rm -f {REMOTE_PATH} 2>/dev/null || sudo -n rm -f {REMOTE_PATH} 2>/dev/null; exit 0"
    r = subprocess.run(
        [
            "ssh",
            "-o",
            "BatchMode=yes",
            "-o",
            "StrictHostKeyChecking=accept-new",
            ssh,
            inner,
        ],
        shell=False,
    )
    if r.returncode != 0:
        print("ingest: remote clear: non-zero exit (check sudo rm for /var/log/current)", file=sys.stderr)
        return False
    return True


def run(*, do_fetch: bool, do_legacy: bool) -> int:
    STATIC.mkdir(parents=True, exist_ok=True)
    if not OUT_GZ.is_file():
        with gzip.open(OUT_GZ, "wt", encoding="utf-8") as _f:
            pass

    keys: Set[Tuple[int, str, str]] = set()
    out_lines: List[str] = []
    for o in _iter_owm_lines_from_gz(OUT_GZ):
        k = _line_key(o)
        keys.add(k)
        out_lines.append(_line_from_dict(o))

    legacy_added = 0
    had_legacy = bool(do_legacy and LEGACY_GZ.is_file())
    legacy_read_ok = False
    if had_legacy:
        try:
            text = _extract_text_from_mixed_gz(LEGACY_GZ)
            legacy_read_ok = True
        except (OSError, ValueError) as e:
            print(f"ingest: legacy {LEGACY_GZ}: {e}", file=sys.stderr)
            text = ""
        for o in _parse_json_lines_or_array(text):
            d = _dict_to_owm(o)
            if d is None:
                continue
            k = _line_key(d)
            if k in keys:
                continue
            keys.add(k)
            out_lines.append(_line_from_dict(d))
            legacy_added += 1

    remote_added = 0
    had_remote = False
    if do_fetch:
        data = _read_remote(REMOTE)
        had_remote = bool(data and data.strip())
        if had_remote:
            text = data.decode("utf-8", errors="replace")
            for o in _parse_json_lines_or_array(text):
                d = _dict_to_owm(o)
                if d is None:
                    continue
                k = _line_key(d)
                if k in keys:
                    continue
                keys.add(k)
                out_lines.append(_line_from_dict(d))
                remote_added += 1
        if not had_remote and do_fetch:
            print("ingest: remote /var/log/current leer oder nicht lesbar", file=sys.stderr)

    def sort_key(line: str) -> int:
        try:
            return int(json.loads(line).get("dt", 0))
        except (json.JSONDecodeError, TypeError, ValueError):
            return 0

    out_lines.sort(key=sort_key)

    new_path = OUT_GZ.with_suffix(OUT_GZ.suffix + ".new")
    with tempfile.NamedTemporaryFile("w", delete=False, encoding="utf-8", newline="\n") as tmp:
        for ln in out_lines:
            tmp.write(ln + "\n")
        tmp_path = tmp.name
    try:
        with open(tmp_path, "rb") as f_in, gzip.open(new_path, "wb", compresslevel=9) as f_out:
            shutil.copyfileobj(f_in, f_out)
        os.replace(new_path, OUT_GZ)
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    print(
        f"ingest: wrote {OUT_GZ} ({len(out_lines)} lines; +{remote_added} remote, +{legacy_added} legacy)",
        file=sys.stderr,
    )

    if legacy_read_ok and LEGACY_GZ.is_file():
        try:
            LEGACY_GZ.unlink()
            print(f"ingest: removed legacy {LEGACY_GZ} after merge", file=sys.stderr)
        except OSError as e:
            print(f"ingest: could not remove legacy: {e}", file=sys.stderr)

    if do_fetch and had_remote and _clear_remote(REMOTE):
        print("ingest: remote /var/log/current cleared", file=sys.stderr)
    elif do_fetch and had_remote:
        print("ingest: warn: remote clear failed; next run may duplicate", file=sys.stderr)
    elif do_fetch and not had_remote:
        _clear_remote(REMOTE)

    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-fetch", action="store_true", help="nur lokal (legacy + bestehende 2026), kein ssh")
    ap.add_argument("--no-legacy", action="store_true", help="current_update.log.gz nicht einlesen")
    args = ap.parse_args()
    do_fetch = not args.no_fetch and os.environ.get("SKIP_FETCH_CURRENT", "") != "1"
    do_legacy = not args.no_legacy
    return run(do_fetch=do_fetch, do_legacy=do_legacy)


if __name__ == "__main__":
    raise SystemExit(main())
