#!/usr/bin/env python3
"""
Keep lookups/meteo_historic.csv aligned with s4c_stock_indices:

* **Seven** cities (exchange locations) — legacy Paris / CAC rows are removed.
* **Daily append** of missing dates through **yesterday (UTC)** via
  Open-Meteo Archive API (outbound: archive-api.open-meteo.com).
* CSV layout: one block per city, order Frankfurt → New York → London →
  Tokyo → Hong Kong → Zurich → Brussels (unchanged for Splunk re-ingest).

Run daily via Splunk scheduled scripted input, or by hand. Stdout: one JSON status line.
"""

import csv
import json
import os
import sys
import time
import ssl
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

LOG_PREFIX = 'update_meteo_historic_csv'
ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'
USER_AGENT = 'splunk4champions2-meteo-historic/1.0 (stdlib urllib)'

SPLUNK_HOME = os.environ.get('SPLUNK_HOME', '')
if SPLUNK_HOME:
    METEO_CSV = os.path.join(
        SPLUNK_HOME, 'etc', 'apps', 'splunk4champions2', 'lookups', 'meteo_historic.csv'
    )
else:
    METEO_CSV = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', 'lookups', 'meteo_historic.csv'
    )

# Blocks on disk: matches historical file order, minus Paris
CITIES = [
    {'city': 'Frankfurt',  'country': 'Germany',       'exchange': 'DAX',         'timezone': 'Europe/Berlin',     'lat': 50.1109,  'lon': 8.6821},
    {'city': 'New York',   'country': 'United States', 'exchange': 'SP500',       'timezone': 'America/New_York',  'lat': 40.7128,  'lon': -74.0060},
    {'city': 'London',     'country': 'United Kingdom', 'exchange': 'FTSE100',  'timezone': 'Europe/London',     'lat': 51.5074,  'lon': -0.1278},
    {'city': 'Tokyo',      'country': 'Japan',         'exchange': 'Nikkei225',  'timezone': 'Asia/Tokyo',        'lat': 35.6762,  'lon': 139.6503},
    {'city': 'Hong Kong',  'country': 'China',         'exchange': 'HangSeng',   'timezone': 'Asia/Hong_Kong',    'lat': 22.3193,  'lon': 114.1694},
    {'city': 'Zurich',     'country': 'Switzerland',   'exchange': 'SMI',        'timezone': 'Europe/Zurich',     'lat': 47.3769,  'lon': 8.5417},
    {'city': 'Brussels',   'country': 'Belgium',      'exchange': 'EuroStoxx50', 'timezone': 'Europe/Brussels',  'lat': 50.8503,  'lon': 4.3517},
]
CSV_FIELDNAMES = [
    'date', 'city', 'country', 'exchange', 'timezone',
    'temperature_2m_max', 'temperature_2m_min', 'temperature_2m_mean',
    'precipitation_sum', 'wind_speed_10m_max', 'sunshine_duration', 'weather_code',
]
DAILY_VARS = (
    'temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,'
    'wind_speed_10m_max,sunshine_duration,weather_code'
)
_SKIP = {'Paris'}


def _ssl_ctx():
    for env in ('OPEN_METEO_CA_BUNDLE', 'SSL_CERT_FILE', 'REQUESTS_CA_BUNDLE'):
        p = os.environ.get(env)
        if p and os.path.isfile(p):
            return ssl.create_default_context(cafile=p)
    return ssl.create_default_context()


def _http_get_json(url):
    req = urllib.request.Request(
        url, headers={'User-Agent': USER_AGENT}, method='GET'
    )
    with urllib.request.urlopen(req, timeout=60, context=_ssl_ctx()) as r:
        return json.loads(r.read().decode('utf-8'))


def fetch_archive(meta, d0, d1):
    if d0 > d1:
        return []
    qs = urllib.parse.urlencode({
        'latitude':   meta['lat'],
        'longitude':  meta['lon'],
        'start_date': d0.isoformat(),
        'end_date':   d1.isoformat(),
        'daily':      DAILY_VARS,
        'timezone':   meta['timezone'],
    })
    url = f'{ARCHIVE_URL}?{qs}'
    data = _http_get_json(url)
    dly = data.get('daily') or {}
    out = []
    for i, day in enumerate(dly.get('time') or []):
        row = {k: '' for k in CSV_FIELDNAMES}
        row['date'] = day
        row['city'] = meta['city']
        row['country'] = meta['country']
        row['exchange'] = meta['exchange']
        row['timezone'] = meta['timezone']
        for k in (
            'temperature_2m_max', 'temperature_2m_min', 'temperature_2m_mean',
            'precipitation_sum', 'wind_speed_10m_max', 'sunshine_duration', 'weather_code',
        ):
            arr = dly.get(k) or []
            v = arr[i] if i < len(arr) else None
            if v is not None and v == v:
                if k == 'weather_code':
                    row[k] = str(int(float(v)))
                else:
                    row[k] = str(v)
        out.append(row)
    return out


def read_all_by_city():
    by = {m['city']: [] for m in CITIES}
    if not os.path.isfile(METEO_CSV):
        return by, False
    has_paris = False
    with open(METEO_CSV, newline='', encoding='utf-8', errors='replace') as f:
        for row in csv.DictReader(f):
            c = (row.get('city') or '').strip()
            if c in _SKIP:
                has_paris = True
                continue
            if c in by:
                by[c].append(row)
    for c in by:
        by[c].sort(key=lambda r: r.get('date', ''))
    return by, has_paris


def write_block_order(by):
    d = os.path.dirname(METEO_CSV)
    if d:
        os.makedirs(d, exist_ok=True)
    tmp = METEO_CSV + '.tmp'
    with open(tmp, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, fieldnames=CSV_FIELDNAMES, lineterminator='\n')
        w.writeheader()
        for meta in CITIES:
            for row in by[meta['city']]:
                w.writerow({k: row.get(k, '') for k in CSV_FIELDNAMES})
    os.replace(tmp, METEO_CSV)


def main():
    yday = (datetime.now(timezone.utc) - timedelta(days=1)).date()
    by, has_paris = read_all_by_city()
    stripped = 0
    if has_paris:
        write_block_order(by)
        stripped = 1
        sys.stderr.write(
            f'{LOG_PREFIX}: removed Paris (legacy CAC) — rows now only index cities\n'
        )
    appended = 0
    for meta in CITIES:
        c = meta['city']
        rows = by[c]
        if not rows:
            sys.stderr.write(
                f'{LOG_PREFIX}: skip {c} — no rows in {METEO_CSV} (ship baseline in app)\n'
            )
            continue
        try:
            dts = [
                datetime.strptime((r.get('date') or '')[:10], '%Y-%m-%d').date()
                for r in rows if (r.get('date') or '').strip()
            ]
        except ValueError as e:
            sys.stderr.write(f'{LOG_PREFIX}: bad date in {c}: {e}\n')
            continue
        if not dts:
            continue
        hi = max(dts)
        start = hi + timedelta(days=1)
        if start > yday:
            continue
        try:
            new = fetch_archive(meta, start, yday)
        except Exception as e:
            sys.stderr.write(f'{LOG_PREFIX}: API error {c} {start}..{yday}: {e}\n')
            continue
        have = {(r.get('date') or '')[:10] for r in rows}
        for r in new:
            d = (r.get('date') or '')[:10]
            if d and d not in have:
                rows.append(r)
                have.add(d)
                appended += 1
        rows.sort(key=lambda r: r.get('date', ''))
        by[c] = rows
        time.sleep(0.35)

    if appended or has_paris:
        write_block_order(by)
    if appended:
        sys.stderr.write(f'{LOG_PREFIX}: appended {appended} day rows → {METEO_CSV}\n')
    elif not has_paris:
        sys.stderr.write(
            f'{LOG_PREFIX}: weather CSV current through {yday} (or skip/no fetch)\n'
        )

    print(json.dumps({
        'source': 'update_meteo_historic_csv',
        'stripped_paris': bool(stripped),
        'appended': appended,
        'target_through': yday.isoformat(),
    }))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
