#!/usr/bin/env python3
"""
update_stocks.py — Splunk scripted input: stock index metrics daily updater.

On first run (or after a gap) fetches all missing trading days up to yesterday.
Configured with interval=86400 in inputs.conf so it also runs once per day.

Metric names:  stocks.open  stocks.high  stocks.low  stocks.close  stocks.volume
Dimensions:    symbol (e.g. ^GDAXI)   index_name (e.g. DAX)
Target index:  s4c_student_metrics
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

# ── Configuration ─────────────────────────────────────────────────────────────

SYMBOLS = {
    '^GDAXI':    'DAX',
    '^GSPC':     'SP500',
    '^IXIC':     'NASDAQ',
    '^DJI':      'DowJones',
    '^FTSE':     'FTSE100',
    '^FCHI':     'CAC40',
    '^STOXX50E': 'EuroStoxx50',
    '^N225':     'Nikkei225',
    '^HSI':      'HangSeng',
    '^SSMI':     'SMI',
}

SPLUNK_HOME = os.environ.get('SPLUNK_HOME', '')
STATIC_CSV  = os.path.join(SPLUNK_HOME, 'etc', 'apps', 'splunk4champions2',
                           'static', 'stocks_history.csv')

# Fallback lookback if static CSV is missing (days)
DEFAULT_LOOKBACK_DAYS = 365 * 10

# ── Helpers ───────────────────────────────────────────────────────────────────

def latest_timestamp_in_csv():
    """Return the max _time (epoch) already present in the static CSV, or 0."""
    if not os.path.exists(STATIC_CSV):
        return 0
    try:
        df = pd.read_csv(STATIC_CSV, usecols=['_time'])
        return int(df['_time'].max())
    except Exception:
        return 0


def fetch_and_emit(start_dt, end_dt):
    """
    Download daily OHLCV for all symbols between start_dt and end_dt.
    Print each record as a JSON line to stdout (Splunk indexes it as a metric).
    Returns the number of records emitted.
    """
    emitted = 0
    for sym, name in SYMBOLS.items():
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
            continue

        df.columns = df.columns.get_level_values(0)
        df.index   = pd.to_datetime(df.index).tz_localize(None)

        for ts, row in df.iterrows():
            def fv(v):
                return round(float(v), 4) if pd.notna(v) else None
            rec = {
                '_time':      ts.strftime('%Y-%m-%d'),
                'symbol':     sym,
                'index_name': name,
                'open':       fv(row['Open']),
                'high':       fv(row['High']),
                'low':        fv(row['Low']),
                'close':      fv(row['Close']),
                'volume':     int(row['Volume']) if pd.notna(row['Volume']) else None,
            }
            # Drop None values — Splunk metrics pipeline rejects null measures
            print(json.dumps({k: v for k, v in rec.items() if v is not None}))
            emitted += 1

        time.sleep(0.3)

    return emitted

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    latest_ts = latest_timestamp_in_csv()

    if latest_ts:
        latest_dt = datetime.fromtimestamp(latest_ts, tz=timezone.utc)
    else:
        latest_dt = datetime.now(tz=timezone.utc) - timedelta(days=DEFAULT_LOOKBACK_DAYS)

    # Start from the day after the last known record
    start_dt = (latest_dt + timedelta(days=1)).replace(
        hour=0, minute=0, second=0, microsecond=0)

    # End at yesterday midnight UTC (today's session may still be open)
    end_dt = datetime.now(tz=timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0)

    if start_dt >= end_dt:
        sys.stderr.write('update_stocks: already up to date\n')
        return

    days_gap = (end_dt - start_dt).days
    sys.stderr.write(
        f'update_stocks: fetching {start_dt.date()} → {end_dt.date()} '
        f'({days_gap} calendar days)\n'
    )

    n = fetch_and_emit(start_dt, end_dt)
    sys.stderr.write(f'update_stocks: emitted {n} records\n')


if __name__ == '__main__':
    main()
