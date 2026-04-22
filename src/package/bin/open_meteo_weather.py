#!/usr/bin/env python3
"""
Open-Meteo scripted input for Splunk.

Usage (set automatically by inputs.conf stanzas):
  open_meteo_weather.py metrics   -> flat JSON with metric_name:meteo.* keys
                                     for a Splunk metrics index
  open_meteo_weather.py events    -> flat JSON with plain field names
                                     for a Splunk events index

Geocoding results are cached in:
  <app_home>/local/.geocache.json

Schedule recommendation:
  300 s (5 min) to 3600 s (60 min)
"""

import json
import os
import socket
import ssl
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
TIMEOUT = 30
USER_AGENT = "splunk-open-meteo-scripted-input/2.5"
HOSTNAME = socket.gethostname()

MODE_METRICS = "metrics"
MODE_EVENTS = "events"

APP_HOME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCAL_DIR = os.path.join(APP_HOME, "local")
GEOCACHE_FILE = os.path.join(LOCAL_DIR, ".geocache.json")

CITIES = [
    {"name": "New York",      "country_code": "US"},
    {"name": "San Francisco", "country_code": "US"},
    {"name": "Sydney",        "country_code": "AU"},
    {"name": "Berlin",        "country_code": "DE"},
    {"name": "Frankfurt",     "country_code": "DE"},
    {"name": "Warsaw",        "country_code": "PL"},
    {"name": "Krakow",        "country_code": "PL"},
    {"name": "Vilnius",       "country_code": "LT"},
    {"name": "Riga",          "country_code": "LV"},
    {"name": "Tallinn",       "country_code": "EE"},
]

METRIC_FIELDS = [
    "temperature_2m",
    "relative_humidity_2m",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "apparent_temperature",
    "is_day",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "weather_code",
    "pressure_msl",
    "cloud_cover",
    "surface_pressure",
]

INT_FIELDS = {"is_day", "weather_code"}
FLOAT_FIELDS = set(METRIC_FIELDS) - INT_FIELDS

_SSL_CONTEXT = None


# ---------------------------------------------------------------------------
# SSL
# ---------------------------------------------------------------------------
def build_ssl_context():
    for env_var in ("OPEN_METEO_CA_BUNDLE", "SSL_CERT_FILE", "REQUESTS_CA_BUNDLE"):
        cafile = os.environ.get(env_var)
        if cafile and os.path.isfile(cafile):
            return ssl.create_default_context(cafile=cafile)
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def get_ssl_context():
    global _SSL_CONTEXT
    if _SSL_CONTEXT is None:
        _SSL_CONTEXT = build_ssl_context()
    return _SSL_CONTEXT


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
def http_get_json(base_url, params):
    url = f"{base_url}?{urlencode(params)}"
    req = Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urlopen(req, timeout=TIMEOUT, context=get_ssl_context()) as resp:
            return json.load(resp)

    except HTTPError as exc:
        body = ""
        try:
            raw = exc.read()
            if raw:
                body = raw.decode("utf-8", errors="replace")
        except Exception:
            pass
        raise RuntimeError(
            f"HTTP {exc.code} from {base_url}: {body or exc.reason}"
        ) from exc

    except URLError as exc:
        raise RuntimeError(f"URL error for {base_url}: {exc.reason}") from exc

    except Exception as exc:
        raise RuntimeError(f"Request failed for {base_url}: {exc}") from exc


# ---------------------------------------------------------------------------
# Geocoding cache
# ---------------------------------------------------------------------------
def ensure_local_dir():
    os.makedirs(LOCAL_DIR, exist_ok=True)


def load_geocache():
    try:
        with open(GEOCACHE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_geocache(cache):
    ensure_local_dir()
    tmp_file = GEOCACHE_FILE + ".tmp"
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, sort_keys=True)
    os.replace(tmp_file, GEOCACHE_FILE)


def geocode_city(city_name, country_code, cache):
    cache_key = f"{city_name}|{country_code}"
    if cache_key in cache:
        return cache[cache_key]

    payload = http_get_json(
        GEOCODING_URL,
        {
            "name": city_name,
            "count": 10,
            "language": "en",
            "format": "json",
        },
    )

    results = payload.get("results") or []
    match = next((r for r in results if r.get("country_code") == country_code), None)

    if match is None and results:
        match = results[0]

    if match is None:
        raise RuntimeError(f"No geocoding result for '{city_name}' ({country_code})")

    geo = {
        "latitude": match["latitude"],
        "longitude": match["longitude"],
        "timezone": match.get("timezone", "UTC"),
        "country_name": match.get("country", country_code),
    }
    cache[cache_key] = geo
    return geo


def resolve_all_cities():
    cache = load_geocache()
    cache_updated = False
    resolved = []

    for city in CITIES:
        key = f"{city['name']}|{city['country_code']}"
        if key not in cache:
            geo = geocode_city(city["name"], city["country_code"], cache)
            cache_updated = True
        else:
            geo = cache[key]
        resolved.append({**city, **geo})

    if cache_updated:
        save_geocache(cache)

    return resolved


# ---------------------------------------------------------------------------
# Weather fetch
# ---------------------------------------------------------------------------
def fetch_weather_batch(resolved):
    params = {
        "latitude": ",".join(str(c["latitude"]) for c in resolved),
        "longitude": ",".join(str(c["longitude"]) for c in resolved),
        "timezone": ",".join(c["timezone"] for c in resolved),
        "current": ",".join(METRIC_FIELDS),
        "temperature_unit": "celsius",
        "wind_speed_unit": "kmh",
        "precipitation_unit": "mm",
        "timeformat": "unixtime",
    }
    return http_get_json(FORECAST_URL, params)


def normalize_batch_response(payload):
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        return [payload]
    raise RuntimeError("Unexpected API response format")


# ---------------------------------------------------------------------------
# Event builders
# ---------------------------------------------------------------------------
def _base_fields(city, response):
    current = response.get("current", {})
    event_time = current.get("time")

    if not isinstance(event_time, (int, float)):
        raise RuntimeError(f"Unexpected current.time value: {event_time!r}")

    event = {
        "_time": int(event_time),
        "host": HOSTNAME,
        "city": city["name"],
        "country": city.get("country_name", city["country_code"]),
        "country_code": city["country_code"],
        "timezone": response.get("timezone", city["timezone"]),
        "latitude": float(city["latitude"]),
        "longitude": float(city["longitude"]),
    }
    return current, event


def _assign_weather_fields(event, current, metric_mode=False):
    for field in METRIC_FIELDS:
        value = current.get(field)
        if value is None:
            continue

        out_key = f"metric_name:meteo.{field}" if metric_mode else field

        if field in INT_FIELDS:
            event[out_key] = int(value)
        else:
            event[out_key] = float(value)

    return event


def build_metric_event(city, response):
    current, event = _base_fields(city, response)
    return _assign_weather_fields(event, current, metric_mode=True)


def build_event_event(city, response):
    current, event = _base_fields(city, response)
    return _assign_weather_fields(event, current, metric_mode=False)


def build_error_event(message, mode):
    event = {
        "_time": int(time.time()),
        "host": HOSTNAME,
        "error": str(message),
        "mode": mode,
        "script": os.path.basename(__file__),
    }
    return event


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else MODE_METRICS
    if mode not in (MODE_METRICS, MODE_EVENTS):
        sys.stderr.write(f"Unknown mode '{mode}'. Use 'metrics' or 'events'.\n")
        return 2

    build_fn = build_metric_event if mode == MODE_METRICS else build_event_event

    try:
        ensure_local_dir()
        resolved = resolve_all_cities()
        payload = fetch_weather_batch(resolved)
        responses = normalize_batch_response(payload)

        if len(responses) != len(resolved):
            raise RuntimeError(
                f"Expected {len(resolved)} locations, got {len(responses)}"
            )

        for city, response in zip(resolved, responses):
            event = build_fn(city, response)
            sys.stdout.write(json.dumps(event, separators=(",", ":")) + "\n")

        return 0

    except Exception as exc:
        error_event = build_error_event(exc, mode)

        if mode == MODE_EVENTS:
            sys.stdout.write(json.dumps(error_event, separators=(",", ":")) + "\n")
        else:
            sys.stderr.write(json.dumps(error_event, separators=(",", ":")) + "\n" + "\n")

        return 1


if __name__ == "__main__":
    raise SystemExit(main())