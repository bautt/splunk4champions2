# What's New — Splunk4Champions Workshop

## Version 2.11.x

---

### 2.11.77 — workshop-wide colour schemes and trainer-friendly setup polish

- **Whole-workshop colour schemes:** the Setup colour picker now restyles the entire workshop (top chapter bar, subchapter bar, table headers, lab callouts and complete-lab cards, primary search button, Setup toggles) instead of just the lab blocks. Four schemes available:
  - **Blue / Navy** (default — steel-blue / deep-navy)
  - **Brown / Dark Red**
  - **Blue / Yellow** (Ukrainian flag intensity — `#005BBB` / `#FFE34D`)
  - **Pink / Orange** (Splunk.com brand intensity — `#E91565` / `#F89C32`)
- **Live preview in the picker:** switching schemes immediately previews a `LabBlock` callout and a complete-lab card so trainers see the effect before committing.
- **Picker tucked away by default:** the colour scheme panel is now collapsed behind a subtle "change colour scheme" link placed below the Setup health check, keeping the Setup page focused on readiness checks.
- **Lab icons clarified:** atomic hands-on `LabBlock` callouts keep the hammer icon, while the five complete-lab summary cards now use a flask icon to visually distinguish "single exercise" from "end-to-end lab".
- **Scheme-aware primary buttons:** the workshop search button and Setup toggle buttons (Standard / Large Room and the four scheme buttons) now match the active scheme instead of staying Splunk green, including hover and focus states.
- **Theme-aware navigation:** chapter bar and section bar default to a pale blue tint that matches the new Blue / Navy baseline, and each scheme overrides them so the workshop visually agrees with itself end-to-end.
- **Persistence unchanged:** the chosen scheme (and the trainer display mode) is still stored in browser local storage and broadcast via custom events so SPA navigation keeps the chosen theme.

### 2.11.75 — hands-on lab treatment, live dashboard embeds, Chapter 3 reorder

- **Lab treatment for hands-on exercises:** new `LabBlock` callout component (steel-blue, hammer icon) for atomic hands-on steps, plus a deep-navy *complete-lab card* treatment for the five end-to-end labs (Inspector Lab, Search Lab / Investigation, Metrics Lab, Stocks — Events to Metrics, Publish a dashboard without login). Each complete lab now opens with an upfront summary card. `workshop.js` tags these steps with `"type": "lab"` so the UI knows which treatment to render.
- **Chapter 3 reorder:** **SPL2** subchapter moved from the front of Chapter 3 to between **Search Quiz** and **MCP** so the search-performance arc (Basics → Command Types → Inspector → Terms → tstats → Bad Searches → Search Lab → Search Quiz) reads end-to-end before the SPL2/MCP appendix sections.
- **Live dashboard embeds in Chapter 5 Colors:** new `SplunkPanel` use embeds a live pie-chart panel via `/app/?hideChrome=true` (the Splunk 10.x replacement for the removed `/embed/` route). Static colour screenshots restored alongside the live panel for trainers running offline.
- **New Chapter 6 publish lab:** `chapter6/ds_publish.mdx` now has a hands-on lab walking through publishing a dashboard without login.
- **Canvas viz page trimmed:** removed the health-dashboard detour from `chapter6/ds_rcastley_vizs.mdx` so the page focuses on the Canvas 2D library itself.
- **Chapter 2 asset swaps:** `journal1.png` replaced by `journal_new.png` and `tsidx1.png` by `tsidx_new.png` (the redrawn assets from v2.11.62). The SmartStore "library" image now floats inline with the analogy text instead of sitting as a block.
- **Weather data refresh:** scheduled ingest update of `current_2026.log.gz` via the show-host pipeline.

### 2.11.62 — app size reduction, asset redesigns, city normalisation

- **App size dropped substantially:** lossless PNG compression across `appserver/static/images/` and `www.log` gzipped; `current_2026.log.gz` reduced by 37% (8.2 MB → 5.2 MB); `inspector-dall-e.png` dimensions halved (505 KB → 123 KB); unused `hot_warm1.png` / `hot_warm2.png` removed.
- **Image assets redrawn in the modern workshop style:** `tsidx1.png` and `journal1.png` re-rendered, the latter renamed in line with the on-disk `journal.zst` naming.
- **City names normalised** across the bundled `current_2026.log.gz`, with dashboard SPL updated to match the new canonical names.
- **Search basics diagrams clarified** in the Chapter 3 walkthroughs.
- **Further Splunk Cloud readiness pass** on the app package.

### 2.11.54 — package validation notes

- **Local test package built:** refreshed `splunk4champions2.tar.gz` after the Cloud-readiness cleanup so trainers can test the current `2.11.53` app behavior locally.
- **Cloud-readiness status documented:** AppInspect Cloud checks are down to the known bundled-data blocker in root `static/`; HEC tokens, `limits.conf`, invalid index settings, XML parsing issues, and the outdated Splunk Python SDK blocker are resolved.
- **Bundled-data decision captured:** left the current bundled data layout unchanged for now to avoid disrupting Enterprise workshop installs; future Cloud-compatible single-package work should prefer documented Splunk locations such as `lookups/` for CSV-style seed/reference data rather than introducing a custom `seeddata/` folder.

### 2.11.53 — Cloud-safe configuration cleanup

- **HEC tokens removed from the app package:** removed the shipped Phyphox HEC stanzas from `inputs.conf`; the Phyphox chapter now explains how an administrator creates environment-specific HEC tokens for Splunk Enterprise or Splunk Cloud.
- **Cloud-compatible index definitions:** removed unsupported `indexes.conf` properties and corrected index path names while keeping all `s4c_*` index stanzas so standalone/on-prem installs still create the workshop indexes.
- **`limits.conf` removed from the app:** the previous `[subsearch] maxout` setting helped large stock/weather joins, but platform limits should be administrator-owned; workshop guidance now favors `inputlookup meteo_historic` for the historical weather side of those joins.
- **Sample HEC token removed from UI:** the Phyphox download dashboard no longer pre-fills a token-like value.

### 2.11.52 — Cloud readiness maintenance

- **XML validity fixes:** escaped dashboard labels that used bare ampersands so Cloud/AppInspect XML parsing succeeds without changing dashboard behavior.
- **Cloud metadata polish:** added `sc_admin` to app-level write permissions and switched Open-Meteo scripted input stanzas to the preferred absolute `$SPLUNK_HOME/etc/apps/.../bin` path form.
- **Splunk Python SDK refreshed:** updated the bundled `splunklib` runtime to Splunk SDK for Python `2.1.1` and included its runtime dependencies.
- **Cloud packaging review:** identified the remaining Cloud-only blockers that should be handled with a separate Cloud packaging profile rather than changing the default workshop package used by most non-cloud installs.

### 2.11.51 — release notes catch-up

- **`WHATS_NEW.md` refreshed:** added the missing post-`2.10.83` notes so the root release summary now reflects the in-app What's New page, recent tags, and current workshop collateral.
- **Version references aligned:** this documentation-only build bumps the app metadata after the README, handout, flyer, architecture diagram, and PowerPoint collateral updates.

### 2.11.50 — README expansion

- **README landing page expanded:** added a clearer workshop purpose, target audience, quick content overview, chapter-by-chapter lab descriptions, running guidance, and current data reference.
- **Workshop collateral linked:** README now points to editable Markdown sources for the participant handout and one-page flyer.
- **Audience and positioning clarified:** content now reflects the workshop purpose as hands-on enablement for experienced Splunk users, admins, dashboard builders, use case developers, trainers, and internal champions.

### 2.11.49 — editable handout and flyer

- **New participant handout:** added `SPLUNK4CHAMPIONS_HANDOUT_2026.md`, an editable Markdown handout covering the workshop flow, chapter guide, data reference, quick references, recent highlights, and PDF export guidance.
- **New one-page flyer:** added `SPLUNK4CHAMPIONS_FLYER_2026.md`, an editable Markdown flyer for workshop promotion and PDF conversion.
- **PDF-friendly format:** both files use simple Markdown and Pandoc-friendly front matter so they can be edited in Markdown tools, Word/Google Docs, or converted to PDF.

### 2.11.48 — Chapter 2 distributed search / MapReduce

- **Chapter 2 Data refresh:** added a distributed search / MapReduce section with a supporting SVG-style architecture diagram.
- **Learning goal:** connects indexers, search heads, map/reduce behavior, and distributed search architecture to the data-storage concepts already covered in Chapter 2.

### 2.11.47 — README chapter overview refresh

- **README cleanup:** refreshed the chapter overview to better match the current workshop structure.
- **Repository presentation:** removed oversized lab images from the README flow so the public landing page is easier to scan.

### 2.11.40 — tstats tip and README updates

- **Search chapter polish:** simplified `tstats` tip text and related examples for easier delivery.
- **Documentation:** refreshed README content around the current chapter flow and search examples.

### 2.11.39 — index discovery search simplification

- **Search basics:** simplified index discovery with `tstats` into a compact one-liner.
- **Trainer use:** keeps the example easy to explain while still showing how to discover accessible indexes efficiently.

### 2.11.26 / 2.11.27 — links, SmartStore, display mode, and quizzes

- **Chapter links:** each training chapter (**2–8**) now ends with its own **Useful Links** subchapter. Link lists are no longer repeated after every topic step.
- **Bookmark compatibility:** legacy Chapter 7 bookmarks such as `#sec=sevenMobile Links` redirect to the new **Useful Links** section.
- **SmartStore / data aging:** Chapter 2 labs refreshed with Splunk Lantern alignment, classic vs SmartStore-capable indexer diagrams, and updated captions/copy for indexing and search architecture.
- **Embedded search bars:** workshop preview line numbers are off for cleaner layout; participants can enable native Splunk line numbers under **Settings → Search Preferences**.
- **Workshop UI:** Large Room display mode improves readability for projected delivery.
- **Quizzes:** Chapter 3 **Search recap** and Chapter 8 **Champion Quiz / Buzz** received presentation and content polish.
- **Packaging:** tagged builds attach `splunk4champions2.tar.gz` on GitHub Releases; `make package` creates a matching local package.

### 2.11.2 — Champion Quiz

- **Chapter 8 · Champion Quiz:** added a Kahoot-style final quiz with timed questions, instant feedback, time-decayed scoring, single-choice, true/false, and multi-answer patterns.
- **Authoring model:** quiz content is authored in `web/workshop/chapter8/quiz.mdx` using `<Question>`, `<TrueFalse>`, and `multi` for multi-answer questions.
- **No leaderboard dependency:** final score is shown after the last question; no KV store is required.

## Version 2.10.x

---

### 2.10.89 — MCP lab checklist

- **MCP lab:** added a **Key points at a glance** checklist at the top of the Splunk MCP page covering install, token, endpoints, tool toggles, dedicated `username_mcp` user, TLS, and non-production guidance.

### 2.10.88 — SPL2 and MCP chapter restructure

- **Chapter 3 Search:** moved **SPL2** from Settings to the Search chapter after Search basics.
- **New MCP section:** added an optional **Splunk MCP Server** section after Search Tips, covering Splunkbase installation, tokens, dedicated `username_mcp` user, and app UI screenshots.
- **Images:** added `mcp_server_config.png` and `mcp_server_tools.png` under `appserver/static/images/`.

### 2.10.87 — `s4c_*` data reference

- **Readme expansion:** added an **Example data: `s4c_*` workshop indexes** section describing each workshop index, what it contains, how it is ingested, and which chapters use it.

### 2.10.86 — Setup-first chapter order

- **Setup chapter:** Health Check (`IndexHealth`) is now the first sub-section in the Setup chapter, before Readme and What's New.
- **In-app docs:** Readme and What's New pages were expanded to align with the repository README and GitHub Releases.

### 2.10.85 — in-app Readme and What's New

- **Setup chapter:** added in-app **Readme** and **What's New** steps with links to the full GitHub README and release history.

### 2.10.84 — stock/weather join reliability

- **Chapter 3 stock/weather correlation:** join examples that merge index data with historical meteo now use `inputlookup meteo_historic`.
- **Subsearch support:** app configuration includes a higher `[subsearch] maxout` plus `[meteo_historic]` in `transforms.conf`, so the default 10,000-row subsearch cap does not drop weather matches.

### 2.10.83 — `meteo_historic` path + `demo_metrics` lookup

- **`meteo_historic.csv`** moved from `static/` to **`lookups/`** (file monitor in `default/inputs.conf` and `update_meteo_historic_csv.py` updated). If you overrode the monitor path in `local/inputs.conf`, point it at `.../lookups/meteo_historic.csv`.
- **`demo_metrics`**: new **`[demo_metrics]`** stanza in `default/transforms.conf` (`filename = demo_metrics.csv`). Chapter 6 Data Source views (`ch6_ds_tabbed` and related) and `ds_trellis.mdx` use `| inputlookup demo_metrics` so the lookup is explicit and works with the shipped CSV in `lookups/`.

### 2.10.79 — `s4c_meteo_historic` alignment with index cities

- **`static/meteo_historic.csv`**: removed legacy **Paris** (CAC) rows; **7 cities** match `exchange_city` in `s4c_stock_indices` (Frankfurt, New York, London, Tokyo, Hong Kong, Zurich, Brussels).
- **New** scripted input **`update_meteo_historic_csv.py`** (Open-Meteo Archive API) appends daily weather through **yesterday UTC** so the calendar can track rolling index history; ship updated CSV + enable script on the indexer. Stdout is one JSON line to `_internal` (`splunk4champions2:setup`).

### 2.10.77 — `s4c_stock_indices` + `update_stock_indices.py`

- **Replaced** event index `s4c_stocks` with **`s4c_stock_indices`**. The old `update_stocks.py`, one-shot `stocks_history.csv` monitor, and shipped `stocks_history.csv` / `stocks_symbols.csv` are **removed**.
- **New** scripted input: **`update_stock_indices.py`**. Fetches the **last 10 years** of daily open/high/low/close/volume for **9** major indices (DAX, Dow, EURO STOXX 50, FTSE 100, Hang Seng, Nasdaq, Nikkei, S&P 500, SMI) via the Yahoo **chart** API (Python 3 stdlib only). State for incremental runs: `static/stock_indices_history.csv` (appended alongside stdout JSON).
- **Timestamp:** events use **Unix epoch seconds** in JSON `_time` with sourcetype **`s4c:stock_indices:json`**, `TIME_FORMAT = %s`, and `MAX_DAYS_AGO` so indextime does not clobber trading days.
- **Enrichment:** each line includes `index_name`, `exchange_city` (for joins to `s4c_meteo_historic`), and human **`date`** (`YYYY-MM-DD`). Lookup: `lookups/stock_indices_symbols.csv` (replaces `stocks_symbols.csv`).
- **On upgrade:** remove the old `s4c_stocks` index and data paths if you no longer need them; re-run the scripted input or let the first schedule populate `s4c_stock_indices` (can take a while for the 10y backfill).

### s4c_stocks (historical) — fix wrong `_time` and drop DAX file ingest

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

### Scripted input: `update_stock_indices.py` (replaces `update_stocks.py`; no PyPI dependencies)

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
  - `s4c_stock_indices` → Script: `update_stock_indices.py` (daily)
  - `s4c_www` → monitor: `.../static/www*`
  - `s4c_tutorial` → monitor: `.../static/tutorialdata.zip`
  - `s4c_meteo` → Scripts: `open_meteo_weather.py events` (every 5 min)
  - `s4c_meteo_metrics` → run the `mcollect` search in Chapter 4 → Metrics Lab
  - `s4c_meteo_historic` → monitor: `.../lookups/meteo_historic.csv`

---

### New Dataset: Stock Index Data (`s4c_stock_indices`, replaces former `s4c_stocks`)

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

Data is written to the event index `s4c_stock_indices`. A scripted input (`update_stock_indices.py`) updates it daily; first run backfills up to 10 years.

**Fields:** `_time` `symbol` `index_name` `open` `high` `low` `close` `volume`

---

### New Dataset: Historical Weather for Exchange Cities (`s4c_meteo_historic`)

Daily weather records from **2016 to present** for the city hosting each stock exchange. Used for weather/market correlation exercises in Chapter 3.

**Cities covered:** Frankfurt, New York, London, Paris, Tokyo, Hong Kong, Zürich

**Fields:** `temperature_2m_mean` `temperature_2m_max` `temperature_2m_min` `precipitation_sum` `wind_speed_10m_max` `sunshine_duration` `weather_code` `city` `country` `exchange`

The `exchange` / `index_name` fields match `s4c_stock_indices` — use with `date` and `city` for correlation searches.

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

Sub-section: join `s4c_stock_indices` with `s4c_meteo_historic` using `date` and `city` / `exchange_city` as keys:

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

1. Explore `s4c_stock_indices` events and understand the data shape
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
