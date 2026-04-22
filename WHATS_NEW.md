# What's New — Splunk4Champions Workshop

## Version 2.10.x

---

### s4c_stocks — fix wrong `_time` and drop DAX file ingest

- **DAX `static/gdax_download*`** file monitor, **`[s4c:quotes]`** props, and the **`s4c_quotes_drop_csv_header`** transform are **removed**. `s4c_stocks` OHLCV (including 10+ year index history) comes only from the **`update_stocks.py`** scripted input (and the optional one-shot **`stocks_history.csv`** monitor).
- **`[s4c:stocks:csv]`** (optional `stocks_history.csv` monitor): BOM strip, header `nullQueue`, and slightly longer timestamp lookahead.
- **`ch7_mobile_example`** still uses `coalesce(Close,close)` / `Open` / `open` / `Volume` / `volume` so any very old `s4c:quotes` rows left in the index (capitalized columns) and current JSON/CSV (lowercase) both resolve.
- **Removing already-indexed bad rows:** in Search (with `delete` capability), e.g. narrow to the bad window, then `| delete` (or a delete by query in a sandbox). Re-ingest is not automatic for old data; clear only if policy allows.

### Data inputs and lookups

- **Stocks — one-shot `stocks_history.csv` monitor** added in `default/inputs.conf` (sourcetype `s4c:stocks:csv`, **disabled = true** by default). Set `disabled = false`, restart once to index the shipped CSV baseline, then set back to `true` so the same days are not also doubled by `update_stocks.py` (JSON + file append).
- **Lookup:** removed `lookups/product_code.csv` (ambiguous name vs `product_codes.csv`); food-barcode data lives in `lookups/food_barcodes.csv` and food demo dashboards use `| inputlookup food_barcodes.csv`.

### Config audit (`default/*.conf`)

- Removed an invalid `app.conf` top-level stanza (not a valid Splunk `app.conf` key; risked ignore/warn on load) and kept maintainer as a file comment.
- `savedsearches.conf` alert deep-link: dashboard id updated from `7_Mobile_Example` to `ch7_mobile_example` to match the actual `data/ui/views/ch7_mobile_example.xml` object name.

### Index configuration (Splunk startup fix)

- `default/indexes.conf` now includes **homePath / coldPath / thawedPath** (and size limits) for all workshop indexes, not only `frozenTimePeriodInSecs`. Partial stanzas caused Splunk to fail parsing with: `Required parameter=homePath not configured` for `s4c_meteo_historic` (and would have affected `s4c_stocks` the same way).

---

### Scripted input: `update_stocks.py` (no PyPI dependencies)

- The daily stock index updater no longer requires **yfinance** or **pandas**. It uses Python 3’s standard library only (`urllib` + `json` + `csv`) and the same Yahoo **chart** JSON API the old flow relied on, so you do not need to `pip install` anything into the Splunk Python environment for this input.
- Outbound HTTPS to `query1.finance.yahoo.com` is still required when new data is fetched.

### Scripted input: `open_meteo_weather.py` (dependency cleanup)

- Removed optional `certifi` import path so the script now stays fully standard-library based in Splunk runtime.
- TLS trust handling now uses either explicit CA bundle env vars (`OPEN_METEO_CA_BUNDLE`, `SSL_CERT_FILE`, `REQUESTS_CA_BUNDLE`) or the platform/system CA store.
- Normalized error logging to avoid extra blank lines in scripted input stderr output.

---

### Workshop UI Readability + Trainer Display Mode + SPL Highlighting

The workshop UI has been tuned for live delivery quality and better readability in both desktop and projector settings.

**Search bar alignment fixes**

- Fixed vertical alignment of the time picker and search button so controls are visually aligned with the search editor.
- Scoped section-bar button CSS to avoid leaking style rules into embedded search controls.

**Typography improvements**

- Increased default workshop body/list/table text for better readability in labs.
- Harmonized explanatory text size with search editor text so examples and instructions feel consistent.

**Trainer-friendly display toggle (Setup section)**

- Added a new **Trainer Display Mode** toggle in **Setup → Setup Task**:
  - **Standard**
  - **Large Room**
- Mode is persisted in browser local storage.
- Mode can also be shared via URL: `?view=large`.
- Large Room mode now uses larger typography (18px body/search) for projector-friendly workshops.

**SPL syntax highlighting upgrade in workshop search examples**

- Restored and improved token-based syntax highlighting in embedded search bars.
- Wired `react-search` syntax parsing to Search BNF (`configs/conf-searchbnf`) for richer command/function/modifier tokenization.
- Added workshop-scoped token color tuning for closer visual parity with native Splunk Search.

---

### Setup — Health Check (Improved)

The **Setup** tab opens with a redesigned **Health Check** table that now performs two independent checks per index and provides actionable hints when something is wrong.

**Two status columns per index:**

| Column | Green | Orange | Red |
|--------|-------|--------|-----|
| **Index exists** | Yes — index is present in Splunk | — | No — index has not been created |
| **Has data** | Yes — events or metrics found | Empty — index exists but contains no data | — |

**Additional columns:**

| Column | What it shows |
|--------|---------------|
| Oldest event | Date of the earliest record in the index |
| Latest event | Relative time of the most recent record (e.g. `2d ago`, `5h ago`) |
| Count | Total number of events or metric data points |

The header also shows the current **Splunk version** and **App version**, plus an overall **ALL OK / NEEDS ATTENTION** badge.

**Context-sensitive hints** appear below the table when issues are detected:

- **Index missing (red)** → lists the exact index names and types to create under Settings → Data → Indexes
- **Index empty (orange)** → lists the correct data input per index (monitor path or script name) so you know exactly where to look:
  - `s4c_weather` → monitor: `.../static/current*`
  - `s4c_stocks` → monitor: `.../static/stocks_history.csv` + Scripts: `update_stocks.py` (daily)
  - `s4c_www` → monitor: `.../static/www*`
  - `s4c_tutorial` → monitor: `.../static/tutorialdata.zip`
  - `s4c_meteo` → Scripts: `open_meteo_weather.py events` (every 5 min)
  - `s4c_meteo_metrics` → run the `mcollect` search in Chapter 4 → Metrics Lab
  - `s4c_meteo_historic` → monitor: `.../static/meteo_historic.csv`

---

### New Dataset: Stock Index Data (`s4c_stocks`)

10 years of daily OHLCV (open / high / low / close / volume) for **10 global stock indexes**:

| Index | Symbol |
|-------|--------|
| DAX | ^GDAXI |
| S&P 500 | ^GSPC |
| NASDAQ | ^IXIC |
| Dow Jones | ^DJI |
| FTSE 100 | ^FTSE |
| CAC 40 | ^FCHI |
| Euro Stoxx 50 | ^STOXX50E |
| Nikkei 225 | ^N225 |
| Hang Seng | ^HSI |
| SMI | ^SSMI |

Data is pre-loaded into the event index `s4c_stocks`. A scripted input (`update_stocks.py`) updates it daily with the latest trading day automatically.

**Fields:** `_time` `symbol` `index_name` `open` `high` `low` `close` `volume`

---

### New Dataset: Historical Weather for Exchange Cities (`s4c_meteo_historic`)

Daily weather records from **2016 to present** for the city hosting each stock exchange. Used for weather/market correlation exercises in Chapter 3.

**Cities covered:** Frankfurt, New York, London, Paris, Tokyo, Hong Kong, Zürich

**Fields:** `temperature_2m_mean` `temperature_2m_max` `temperature_2m_min` `precipitation_sum` `wind_speed_10m_max` `sunshine_duration` `weather_code` `city` `country` `exchange`

The `exchange` field matches `index_name` in `s4c_stocks` — use it as the join key for correlation searches.

---

### Chapter 3 — New: Stock Index Search

New sub-section in **Chapter 3 (Search)**, placed right after the tstats section, with practical SPL exercises on the stocks dataset:

- Basic `table` search filtered by symbol and time range
- `timechart` of weekly closing prices across all 10 indexes
- `stats latest()` to compare current closing prices side by side
- Daily % move calculation to find the biggest up and down days
- `tstats` for fast date-range and count summaries without loading raw events

---

### Chapter 3 — New: Weather & Stock Correlation

New sub-section showing how to join `s4c_stocks` with `s4c_meteo_historic` using `date` and `exchange` as keys:

- Inventory of available weather data by city
- Full join: stocks + weather on date and exchange city
- DAX closing price vs. Frankfurt temperature (monthly average)
- FTSE 100 trading volume on rainy vs. dry London days
- Sunshine hours vs. daily price change across all exchanges
- Extreme weather events (storm / heavy rain) and index performance

---

### Chapter 3 — Improved: Interactive Quiz

The Chapter 3 quiz has been completely rebuilt as an interactive React component — no more static text questions.

**Each of the 9 questions includes:**

- **Two live search bars (A and B)** — participants can run both searches directly in Splunk and compare results before deciding which is better
- **Reveal Answer button** — shows the correct answer immediately with a colour-coded explanation panel
- **A/B badges** turn green (correct) or red (wrong) on reveal, making the answer obvious at a glance
- **Trick question callout** — Q7 (tstats on a search-time-only index) is flagged in orange with an explanation of why tstats fails without `INDEXED_EXTRACTIONS`

**Quiz controls:**

- Progress counter at the top: `3 / 9 revealed`
- **Reset Quiz** button clears all answers — instructors can reuse the quiz with different groups without a page reload

---

### Chapter 4 — New: Stock Index Metrics Lab

New sub-section showing students how to convert the stocks event data into metrics using `mcollect`:

1. Explore `s4c_stocks` events and understand the data shape
2. Preview how fields will map to metric dimensions
3. Push to `s4c_student_metrics` with `| mcollect index=s4c_student_metrics prefix=stocks.`
4. Verify ingestion with `| mcatalog`
5. Query with `| mstats` and visualize in Analytics Workspace

> The `mcollect` command is intentionally commented out — students uncomment and run it themselves as the hands-on exercise.

---

### Chapter 6 — New: Inline SVG in Dashboard Studio

New section in **Chapter 6 → Working with Images** explaining how to embed raw SVG markup directly as a Dashboard Studio visualization type (`viz.svg`).

Key points covered:
- SVG elements can be bound to search results via token expressions (`fill`, `stroke`, `width`, `transform`)
- Fully self-contained in the dashboard JSON — no external image files or dependencies
- Ideal for floor plans, network diagrams, instrument panels, and domain-specific graphics
- Scales perfectly at any resolution

The **[Piano Generator dashboard](ch6_ds_piano_gen)** is used as a live example: a full piano keyboard rendered in SVG where each key's fill color is driven by MIDI note search results in real time.

---

### Chapter 6 — New: Canvas Visualizations (Robert Castley)

New sub-section in **Chapter 6 (Dashboard Studio)** covering production-ready Canvas 2D API visualizations from the [splunk-custom-visualizations](https://github.com/rcastley/splunk-custom-visualizations) library by **Robert Castley**.

All examples can be cloned, built, and installed directly — no Splunk development experience required. A [live demo](https://rcastley.github.io/splunk-custom-visualizations/) is available without a Splunk instance.

| Visualization | Data source | Description |
|---|---|---|
| Data Pipeline | Any index | Animated Sankey-style flow diagram |
| Index Universe | `index=*` | Circular bubble map of all indexes and their sizes |
| Resource Gauge | `index=_introspection` | Triple-arc gauge: CPU / Memory / Swap |
| Indexing Pipeline Flow | `index=_internal group=queue` | Animated queue fill visualization |
| Forwarder Heatmap | `index=_internal group=tcpin_connections` | Forwarder staleness grid |
| Scheduler Health | `index=_internal sourcetype=scheduler` | Saved search success and skip rates |

---

### Dashboard Naming Convention

All dashboard XML files have been renamed to follow a consistent `chN_type_description` scheme and their internal labels updated to match. Old files have been removed from the app.

| Prefix | Chapter | Dashboard type |
|--------|---------|----------------|
| `ch3_` | 3 · Search | Search optimization examples |
| `ch4_` | 4 · Metrics | Metrics and Phyphox dashboards |
| `ch5_xml_` | 5 · XML Dashboards | Classic SimpleXML dashboards |
| `ch6_ds_` | 6 · Dashboard Studio | Dashboard Studio (JSON) dashboards |
| `ch7_` | 7 · Mobile | Mobile examples |
| `demo_` | — | Standalone demo dashboards |

---

### Navigation: Browser Back/Forward + Prev/Next Buttons

The workshop URL now reflects your current position via a hash fragment:

```
/en-GB/app/splunk4champions2/lab#ch=three&sec=threeInspector
```

**What this means for participants:**

- **Browser back/forward** works — every section navigation adds a history entry so the back button takes you to the previous section
- **Bookmarks** work — bookmark any chapter/section and return directly to it
- **Shareable links** — paste a URL into Slack to send a colleague directly to a specific section
- **Page refresh** — restores your exact position instead of dropping you back to Setup

**Prev / Next buttons** appear at the right end of the section tab bar — two small arrow buttons (`‹` `›`) with a position counter showing `chapter/section` (e.g. `3/5` = Chapter 3, section 5). They navigate linearly through all sections across all chapters so you can step through the entire workshop in order without using the tab menus.
