#!/usr/bin/env python3
"""
update_stocks.py — Splunk scripted input: stock index OHLCV daily updater.

Uses Yahoo Finance *chart* JSON (same source as the old yfinance flow) with only
the Python 3 standard library: urllib + json + csv. No yfinance or pandas
required in your Splunk runtime.

Behaviour
---------
First run (stocks_history.csv absent or empty):
    Fetches the last 10 years of daily OHLCV for all 10 index symbols,
    writes every row to stocks_history.csv, and emits each row as a
    JSON line to stdout so Splunk indexes them immediately.

Subsequent runs (stocks_history.csv exists):
    Reads the latest date already in the file, fetches only the gap
    (latest_date+1 … yesterday), appends new rows to the CSV, and
    emits them as JSON lines to stdout.

Network: outbound HTTPS to `query1.finance.yahoo.com` (port 443) is required
when the script fetches new data.
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

# ── Symbol table with enrichment ──────────────────────────────────────────────
# index_name: short display label (charts, tstats) — DAX, FTSE 100, S&P 500, …
# exchange_city: MUST match `city` in s4c_meteo_historic (date + city weather joins)

SYMBOLS = {
    '^DJI':      ('Dow Jones Industrial Average', 'New York'),
    '^FCHI':     ('CAC 40', 'Paris'),
    '^FTSE':     ('FTSE 100', 'London'),
    '^GDAXI':    ('DAX', 'Frankfurt'),
    '^GSPC':     ('S&P 500', 'New York'),
    '^HSI':      ('Hang Seng', 'Hong Kong'),
    '^IXIC':     ('Nasdaq Composite', 'New York'),
    '^N225':     ('Nikkei 225', 'Tokyo'),
    '^SSMI':     ('Swiss Market Index', 'Zurich'),
    '^STOXX50E': ('EURO STOXX 50', 'Brussels'),
}

YEARS_BACK = 10

USER_AGENT = (
    'Mozilla/5.0 (compatible; splunk4champions2/2.0; +https://www.splunk.com) '
    'python-urllib/3'
)

SPLUNK_HOME = os.environ.get('SPLUNK_HOME', '')
STATIC_CSV  = os.path.join(
    SPLUNK_HOME, 'etc', 'apps', 'splunk4champions2', 'static', 'stocks_history.csv'
) if SPLUNK_HOME else os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'stocks_history.csv'
)
CSV_HEADER  = 'date,symbol,index_name,exchange_city,open,high,low,close,volume\n'

# ── HTTP (stdlib) — Yahoo chart API ─────────────────────────────────────────

def _http_get_json(url, timeout=45):
    """GET JSON from URL. Raises on non-2xx or invalid JSON."""
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
    """
    Daily OHLCV for [start_dt, end_dt) in UTC, using v8 chart endpoint.
    Yields (date_str, open, high, low, close, volume_or_none) sorted by day.
    """
    # period1/period2 are Unix seconds; use UTC midnights to match yfinance day boundaries.
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
    opens = q.get('open') or []
    highs = q.get('high') or []
    lows = q.get('low') or []
    closes = q.get('close') or []
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

# ── State helpers (csv stdlib) ──────────────────────────────────────────────

def latest_date_in_csv():
    """Return the latest date in stocks_history.csv as a date object, or None."""
    if not os.path.exists(STATIC_CSV):
        return None
    try:
        max_d = None
        with open(STATIC_CSV, newline='', encoding='utf-8', errors='replace') as fh:
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
    except Exception:
        return None


def ensure_csv_header():
    """Create the CSV with header if it does not exist yet."""
    if not os.path.exists(STATIC_CSV):
        os.makedirs(os.path.dirname(STATIC_CSV), exist_ok=True)
        with open(STATIC_CSV, 'w', encoding='utf-8', newline='') as f:
            f.write(CSV_HEADER)


def migrate_stocks_csv_if_needed():
    """
    If stocks_history.csv predates the exchange_city column, rewrite it so column
    alignment and Splunk indexed CSV extraction stay correct, and backfill
    index_name + exchange_city from SYMBOLS.
    """
    if not os.path.exists(STATIC_CSV):
        return
    with open(STATIC_CSV, 'r', encoding='utf-8', errors='replace') as fh:
        first = fh.readline().strip()
    if 'exchange_city' in first:
        return

    try:
        with open(STATIC_CSV, newline='', encoding='utf-8', errors='replace') as fh:
            reader = csv.DictReader(fh)
            fieldnames = list(reader.fieldnames or [])
            if not fieldnames:
                return
            rows = list(reader)
    except OSError as e:
        sys.stderr.write(f'update_stocks: CSV migration read failed: {e}\n')
        return

    if not rows or 'symbol' not in fieldnames:
        return
    if 'index_name' not in fieldnames:
        sys.stderr.write('update_stocks: CSV migration: missing index_name column\n')
        return

    cols = ['date', 'symbol', 'index_name', 'exchange_city', 'open', 'high', 'low', 'close', 'volume']
    out_rows = []
    for row in rows:
        sym = (row.get('symbol') or '').strip()
        if sym in SYMBOLS:
            inm, cty = SYMBOLS[sym]
            row['index_name'] = inm
            row['exchange_city'] = cty
        else:
            row.setdefault('exchange_city', '')
        out_rows.append(row)

    tmp = STATIC_CSV + '.tmp'
    try:
        with open(tmp, 'w', encoding='utf-8', newline='') as fh:
            w = csv.DictWriter(fh, fieldnames=cols, extrasaction='ignore', lineterminator='\n')
            w.writeheader()
            for row in out_rows:
                w.writerow({c: row.get(c, '') for c in cols})
        os.replace(tmp, STATIC_CSV)
        sys.stderr.write('update_stocks: migrated stocks_history.csv (added exchange_city / aligned columns)\n')
    except OSError as e:
        sys.stderr.write(f'update_stocks: CSV migration write failed: {e}\n')
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except OSError:
                pass

# ── Download + emit ───────────────────────────────────────────────────────────

def fetch_and_emit(start_dt, end_dt):
    """
    Download daily OHLCV for all symbols in [start_dt, end_dt).
    Appends CSV rows to stocks_history.csv and prints JSON lines to stdout.
    Returns the number of rows emitted.
    """
    ensure_csv_header()
    emitted = 0

    with open(STATIC_CSV, 'a', encoding='utf-8', newline='') as csv_fh:
        for sym, (index_name, city) in SYMBOLS.items():
            try:
                bars = list(fetch_yahoo_daily_bars(sym, start_dt, end_dt))
            except (urllib.error.HTTPError, urllib.error.URLError, OSError) as e:
                sys.stderr.write(f'update_stocks: network error for {sym}: {e}\n')
                continue
            except (RuntimeError, json.JSONDecodeError, KeyError, TypeError) as e:
                sys.stderr.write(f'update_stocks: download failed for {sym}: {e}\n')
                continue

            if not bars:
                sys.stderr.write(f'update_stocks: no data for {sym}\n')
                continue

            for (date_str, o, h, l, c, v) in bars:
                if None in (o, h, l, c):
                    continue

                csv_fh.write(
                    f'{date_str},{sym},{index_name},{city},'
                    f'{o},{h},{l},{c},{v if v is not None else ""}\n'
                )

                rec = {
                    '_time':         date_str,
                    'symbol':        sym,
                    'index_name':    index_name,
                    'exchange_city': city,
                    'open':          o,
                    'high':          h,
                    'low':           l,
                    'close':         c,
                }
                if v is not None:
                    rec['volume'] = v
                print(json.dumps(rec, separators=(',', ':')))
                emitted += 1

            time.sleep(0.3)  # be polite to Yahoo

    return emitted

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    migrate_stocks_csv_if_needed()
    latest = latest_date_in_csv()

    if latest is None:
        start_dt = datetime.now(tz=timezone.utc) - timedelta(days=365 * YEARS_BACK)
        start_dt = start_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        sys.stderr.write(
            f'update_stocks: first run — fetching {YEARS_BACK} years '
            f'from {start_dt.date()}\n'
        )
    else:
        start_dt = datetime(
            latest.year, latest.month, latest.day, tzinfo=timezone.utc
        ) + timedelta(days=1)
        sys.stderr.write(
            f'update_stocks: incremental run — last date in CSV: {latest}\n'
        )

    end_dt = datetime.now(tz=timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    if start_dt >= end_dt:
        sys.stderr.write('update_stocks: already up to date\n')
        return

    days_gap = (end_dt - start_dt).days
    sys.stderr.write(
        f'update_stocks: fetching {start_dt.date()} → {end_dt.date()} '
        f'({days_gap} calendar days, {len(SYMBOLS)} symbols)\n'
    )

    n = fetch_and_emit(start_dt, end_dt)
    sys.stderr.write(f'update_stocks: done — {n} rows written\n')


if __name__ == '__main__':
    main()
