#!/usr/bin/env python3
"""
update_stocks.py — Splunk scripted input: stock index OHLCV daily updater.

Replaces both download_stocks.py and the previous update_stocks.py.

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

Output fields (per JSON line)
------------------------------
    _time          YYYY-MM-DD  → parsed by TIME_FORMAT in props.conf
    symbol         ^GDAXI
    index_name     DAX                    (full display name)
    exchange_city  Frankfurt              (city of primary exchange)
    open / high / low / close / volume
"""

import json
import os
import sys
import time
from datetime import datetime, timedelta, timezone

try:
    import yfinance as yf
except ImportError:
    sys.stderr.write('update_stocks: yfinance not installed — pip install yfinance\n')
    sys.exit(0)

try:
    import pandas as pd
except ImportError:
    sys.stderr.write('update_stocks: pandas not installed\n')
    sys.exit(0)

# ── Symbol table with enrichment ──────────────────────────────────────────────

SYMBOLS = {
    '^DJI':      ('Dow Jones Industrial Average', 'New York City'),
    '^FCHI':     ('CAC 40',                       'Paris'),
    '^FTSE':     ('FTSE 100',                     'London'),
    '^GDAXI':    ('DAX',                          'Frankfurt'),
    '^GSPC':     ('S&P 500',                      'New York City'),
    '^HSI':      ('Hang Seng Index',              'Hong Kong'),
    '^IXIC':     ('Nasdaq Composite',             'New York City'),
    '^N225':     ('Nikkei 225',                   'Tokyo'),
    '^SSMI':     ('Swiss Market Index',           'Zurich'),
    '^STOXX50E': ('EURO STOXX 50',                'Brussels'),
}

YEARS_BACK = 10

SPLUNK_HOME = os.environ.get('SPLUNK_HOME', '')
STATIC_CSV  = os.path.join(
    SPLUNK_HOME, 'etc', 'apps', 'splunk4champions2', 'static', 'stocks_history.csv'
) if SPLUNK_HOME else os.path.join(
    os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'stocks_history.csv'
)
CSV_HEADER  = 'date,symbol,index_name,exchange_city,open,high,low,close,volume\n'

# ── State helpers ─────────────────────────────────────────────────────────────

def latest_date_in_csv():
    """Return the latest date in stocks_history.csv as a date object, or None."""
    if not os.path.exists(STATIC_CSV):
        return None
    try:
        df = pd.read_csv(STATIC_CSV, usecols=['date'])
        if df.empty:
            return None
        return pd.to_datetime(df['date']).max().date()
    except Exception:
        return None


def ensure_csv_header():
    """Create the CSV with header if it does not exist yet."""
    if not os.path.exists(STATIC_CSV):
        os.makedirs(os.path.dirname(STATIC_CSV), exist_ok=True)
        with open(STATIC_CSV, 'w') as f:
            f.write(CSV_HEADER)

# ── Download + emit ───────────────────────────────────────────────────────────

def fetch_and_emit(start_dt, end_dt):
    """
    Download daily OHLCV for all symbols in [start_dt, end_dt).
    Appends CSV rows to stocks_history.csv and prints JSON lines to stdout.
    Returns the number of rows emitted.
    """
    ensure_csv_header()
    emitted = 0

    with open(STATIC_CSV, 'a', newline='') as csv_fh:
        for sym, (index_name, city) in SYMBOLS.items():
            try:
                df = yf.download(
                    sym,
                    start=start_dt.strftime('%Y-%m-%d'),
                    end=end_dt.strftime('%Y-%m-%d'),
                    interval='1d',
                    auto_adjust=False,
                    progress=False,
                )
            except Exception as e:
                sys.stderr.write(f'update_stocks: download failed for {sym}: {e}\n')
                continue

            if df.empty:
                sys.stderr.write(f'update_stocks: no data for {sym}\n')
                continue

            # yfinance may return MultiIndex columns
            if isinstance(df.columns, pd.MultiIndex):
                df.columns = df.columns.get_level_values(0)

            df.index = pd.to_datetime(df.index).tz_localize(None)

            for ts, row in df.iterrows():
                def fv(v):
                    return round(float(v), 4) if pd.notna(v) else None

                date_str = ts.strftime('%Y-%m-%d')
                o = fv(row.get('Open'))
                h = fv(row.get('High'))
                l = fv(row.get('Low'))
                c = fv(row.get('Close'))
                v = int(row['Volume']) if pd.notna(row.get('Volume')) else None

                if None in (o, h, l, c):
                    continue

                # Append to CSV (date column parsed by TIME_PREFIX=^ in props.conf)
                csv_fh.write(
                    f'{date_str},{sym},{index_name},{city},'
                    f'{o},{h},{l},{c},{v if v is not None else ""}\n'
                )

                # Emit JSON to stdout for immediate Splunk ingestion
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
                print(json.dumps(rec))
                emitted += 1

            time.sleep(0.3)   # be polite to Yahoo Finance

    return emitted

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    latest = latest_date_in_csv()

    if latest is None:
        # First run — fetch full 10-year history
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

    # End at yesterday midnight UTC (today's session may still be open)
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
