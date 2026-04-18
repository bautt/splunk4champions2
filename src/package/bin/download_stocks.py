#!/usr/bin/env python3
"""
download_stocks.py — Download historical daily OHLCV data via yfinance.

Saves one CSV per symbol: Date, Open, High, Low, Close, Adj Close, Volume.

Note: SPLK (Splunk) was acquired by Cisco on 2024-03-18 — its history ends
      there but the full archive is still available on Yahoo Finance.
"""

import os
import sys

try:
    import yfinance as yf
except ImportError:
    print('ERROR: yfinance is not installed. Run: pip install yfinance', file=sys.stderr)
    sys.exit(1)

# ── Configuration ─────────────────────────────────────────────────────────────

SYMBOLS    = ['CSCO', 'SPLK']
YEARS_BACK = 10
OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))

# Tickers acquired/delisted: cap end date so Yahoo can resolve timezone metadata
END_OVERRIDE = {
    'SPLK': '2024-03-18',   # acquired by Cisco
}

# ── Download ──────────────────────────────────────────────────────────────────

def download_symbol(symbol):
    from datetime import datetime, timedelta
    end   = datetime.utcnow()
    start = end - timedelta(days=365 * YEARS_BACK)
    end_str = END_OVERRIDE.get(symbol, end.strftime('%Y-%m-%d'))

    df = yf.download(
        symbol,
        start=start.strftime('%Y-%m-%d'),
        end=end_str,
        interval='1d',
        auto_adjust=False,
        progress=False,
    )

    if df.empty:
        raise RuntimeError(f'No data returned for {symbol}')

    # Flatten multi-level columns yfinance may produce, keep standard set
    if isinstance(df.columns, __import__('pandas').MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
    df.index = df.index.strftime('%Y-%m-%d')
    df.index.name = 'Date'

    out_path = os.path.join(OUTPUT_DIR, f'{symbol}_history.csv')
    df.to_csv(out_path)
    return out_path, len(df)

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print(f'Symbols : {", ".join(SYMBOLS)}')
    print(f'Range   : last {YEARS_BACK} years (daily)')
    print(f'Output  : {OUTPUT_DIR}')
    print()

    errors = []
    for symbol in SYMBOLS:
        try:
            path, rows = download_symbol(symbol)
            print(f'  {symbol:6s}  {rows:>6,} trading days  →  {path}')
        except Exception as e:
            print(f'  {symbol:6s}  ERROR: {e}', file=sys.stderr)
            errors.append(symbol)

    print()
    if errors:
        print(f'Failed: {", ".join(errors)}', file=sys.stderr)
        sys.exit(1)
    else:
        print('Done.')

if __name__ == '__main__':
    main()
