#!/usr/bin/env python3
"""
update_stock_indices.py — Splunk scripted input: major stock index daily OHLCV.

Fetches up to 10 years of history from Yahoo's chart API (stdlib only:
urllib, json, csv). Emits one JSON line per (day, index); _time is Unix
epoch seconds (UTC midnight per trading day) for reliable index-time
parsing. Appends a parallel CSV for incremental state (last date + replay).

Enrichment: every record includes index_name and exchange_city (for joins to
s4c_meteo_historic on date + city).

Requires outbound HTTPS to query1.finance.yahoo.com.
"""

import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

# symbol -> (index_name, exchange_city matching s4c_meteo_historic `city` where used)
SYMBOLS = {
    '^GDAXI':    ('DAX', 'Frankfurt'),
    '^DJI':      ('Dow Jones Industrial Average', 'New York'),
    '^STOXX50E': ('EURO STOXX 50', 'Brussels'),
    '^FTSE':     ('FTSE 100', 'London'),
    '^HSI':      ('Hang Seng', 'Hong Kong'),
    '^IXIC':     ('Nasdaq Composite', 'New York'),
    '^N225':     ('Nikkei 225', 'Tokyo'),
    '^GSPC':     ('S&P 500', 'New York'),
    '^SSMI':     ('Swiss Market Index', 'Zurich'),
}

YEARS_BACK = 10

LOG_PREFIX = 'update_stock_indices'

USER_AGENT = (
    'Mozilla/5.0 (compatible; splunk4champions2/2.0; +https://www.splunk.com) '
    'python-urllib/3'
)

SPLUNK_HOME = os.environ.get('SPLUNK_HOME', '')
STATE_CSV = os.path.join(
    SPLUNK_HOME, 'etc', 'apps', 'splunk4champions2', 'static', 'stock_indices_history.csv'
) if SPLUNK_HOME else os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'stock_indices_history.csv'
)
CSV_HEADER = 'date,symbol,index_name,exchange_city,open,high,low,close,volume\n'


def _http_get_json(url, timeout=60):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': USER_AGENT,
            'Accept': 'application/json,text/plain,*/*',
        },
        method='GET',
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
    return json.loads(raw.decode('utf-8'))


def fetch_yahoo_daily_bars(symbol, start_dt, end_dt):
    """Yields (date_str, open, high, low, close, volume|None) sorted by day."""
    p1 = int(start_dt.replace(tzinfo=timezone.utc).timestamp())
    p2 = int(end_dt.replace(tzinfo=timezone.utc).timestamp())
    path_sym = urllib.parse.quote(symbol, safe='')
    qs = urllib.parse.urlencode({
        'period1': p1,
        'period2': p2,
        'interval': '1d',
        'includePrePost': 'false',
        'events': 'div,splits',
    })
    url = f'https://query1.finance.yahoo.com/v8/finance/chart/{path_sym}?{qs}'

    data = _http_get_json(url)
    chart = data.get('chart') or {}
    err = chart.get('error')
    if err:
        raise RuntimeError(err.get('description') or str(err))
    result = (chart.get('result') or [None])[0]
    if not result:
        return
    times = result.get('timestamp') or []
    if not times:
        return
    q = (result.get('indicators', {}).get('quote') or [None])[0] or {}
    opens, highs, lows, closes = q.get('open') or [], q.get('high') or [], q.get('low') or [], q.get('close') or []
    vols = q.get('volume') or []

    n = len(times)
    for i in range(n):
        o = opens[i] if i < len(opens) else None
        h = highs[i] if i < len(highs) else None
        lo = lows[i] if i < len(lows) else None
        c = closes[i] if i < len(closes) else None
        v = vols[i] if i < len(vols) else None
        if o is None or h is None or lo is None or c is None:
            continue
        o, h, lo, c = float(o), float(h), float(lo), float(c)
        o, h, lo, c = round(o, 4), round(h, 4), round(lo, 4), round(c, 4)
        v_out = int(v) if v is not None and not (isinstance(v, float) and (v != v)) else None

        ts = int(times[i])
        d = datetime.fromtimestamp(ts, tz=timezone.utc).date()
        date_str = d.strftime('%Y-%m-%d')
        yield (date_str, o, h, lo, c, v_out)


def date_to_utc_epoch_midnight(date_str: str) -> int:
    """Trading day as UTC midnight seconds (Splunk strptime %s)."""
    d = datetime.strptime(date_str, '%Y-%m-%d')
    return int(d.replace(tzinfo=timezone.utc).timestamp())


def latest_date_in_csv():
    if not os.path.exists(STATE_CSV):
        return None
    try:
        max_d = None
        with open(STATE_CSV, newline='', encoding='utf-8', errors='replace') as fh:
            reader = csv.DictReader(fh)
            for row in reader:
                d = (row.get('date') or '').strip()
                if not d:
                    continue
                try:
                    t = datetime.strptime(d, '%Y-%m-%d').date()
                except ValueError:
                    continue
                if max_d is None or t > max_d:
                    max_d = t
        return max_d
    except OSError:
        return None


def ensure_csv_header():
    if not os.path.exists(STATE_CSV):
        os.makedirs(os.path.dirname(STATE_CSV), exist_ok=True)
        with open(STATE_CSV, 'w', encoding='utf-8', newline='') as f:
            f.write(CSV_HEADER)


def fetch_and_emit(start_dt, end_dt):
    ensure_csv_header()
    emitted = 0
    with open(STATE_CSV, 'a', encoding='utf-8', newline='') as csv_fh:
        for sym, (index_name, city) in SYMBOLS.items():
            try:
                bars = list(fetch_yahoo_daily_bars(sym, start_dt, end_dt))
            except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
                sys.stderr.write(f'{LOG_PREFIX}: network error for {sym}: {e}\n')
                continue
            except (RuntimeError, json.JSONDecodeError, KeyError, TypeError) as e:
                sys.stderr.write(f'{LOG_PREFIX}: download failed for {sym}: {e}\n')
                continue

            if not bars:
                sys.stderr.write(f'{LOG_PREFIX}: no data for {sym}\n')
                continue

            for (date_str, o, h, lo, c, v) in bars:
                csv_fh.write(
                    f'{date_str},{sym},{index_name},{city},'
                    f'{o},{h},{lo},{c},{v if v is not None else ""}\n'
                )
                _time = date_to_utc_epoch_midnight(date_str)
                rec = {
                    '_time':         _time,
                    'date':          date_str,
                    'symbol':        sym,
                    'index_name':    index_name,
                    'exchange_city': city,
                    'open':          o,
                    'high':          h,
                    'low':           lo,
                    'close':         c,
                }
                if v is not None:
                    rec['volume'] = v
                print(json.dumps(rec, separators=(',', ':')))
                emitted += 1

            time.sleep(0.3)

    return emitted


def main():
    latest = latest_date_in_csv()
    if latest is None:
        start_dt = datetime.now(tz=timezone.utc) - timedelta(days=365 * YEARS_BACK)
        start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        sys.stderr.write(
            f'{LOG_PREFIX}: first run — fetching ~{YEARS_BACK} years from {start_dt.date()}\n'
        )
    else:
        start_dt = datetime(
            latest.year, latest.month, latest.day, tzinfo=timezone.utc
        ) + timedelta(days=1)
        sys.stderr.write(f'{LOG_PREFIX}: incremental — last date in state CSV: {latest}\n')

    end_dt = datetime.now(tz=timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    if start_dt >= end_dt:
        sys.stderr.write(f'{LOG_PREFIX}: already up to date\n')
        return

    n = fetch_and_emit(start_dt, end_dt)
    sys.stderr.write(f'{LOG_PREFIX}: done — {n} events emitted\n')


if __name__ == '__main__':
    main()
