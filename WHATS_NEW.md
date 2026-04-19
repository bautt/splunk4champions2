# What's New — Splunk4Champions Workshop

## Version 2.10.x

---

### Setup: Health Check

The **Setup** tab now opens with a **Health Check** table instead of a plain list of instructions.

At a glance you can see:

| Column | What it tells you |
|--------|-------------------|
| Index | The index name |
| Label | Human-readable purpose |
| Type | Event or Metric index |
| Status | OK (green) or No data / Missing (red) |
| Oldest event | Earliest record in the index |
| Latest event | Most recent record |
| Event count | Total events indexed |

The header also shows the current **Splunk version** and **App version**, plus an overall **ALL OK / NEEDS ATTENTION** badge.

If an index shows red, go to **Settings → Data → Indexes** to create it, then enable its data source under **Settings → Data Inputs → Files & Directories**.

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

Data is pre-loaded into the event index `s4c_stocks`. A scripted input updates it daily with the latest trading day.

**Fields:** `_time` `symbol` `index_name` `open` `high` `low` `close` `volume`

---

### New Dataset: Historical Weather for Exchange Cities (`s4c_meteo_historic`)

Daily weather records from **2016 to present** for the city hosting each stock exchange. Used for correlation exercises in Chapter 1.

**Cities covered:** Frankfurt, New York, London, Paris, Tokyo, Hong Kong, Zürich

**Fields:** `temperature_2m_mean` `temperature_2m_max` `temperature_2m_min` `precipitation_sum` `wind_speed_10m_max` `sunshine_duration` `weather_code` `city` `country` `exchange`

The `exchange` field matches `index_name` in `s4c_stocks` — use it as the join key.

---

### Chapter 1 — New: Stock Index Search

New sub-section in **Chapter 1 (Settings)** with practical SPL exercises on the stocks dataset:

- Basic table search filtered by symbol
- `timechart` of weekly closing prices across all indexes
- `stats latest()` to compare current closing prices
- Daily % move calculation to find biggest up/down days
- `tstats` for fast date-range and count summaries without field extraction

---

### Chapter 1 — New: Weather & Stock Correlation

New sub-section showing how to join `s4c_stocks` with `s4c_meteo_historic` using `date` and `exchange` as keys:

- Inventory of available weather data by city
- Full join: stocks + weather on date and exchange city
- DAX close vs Frankfurt temperature (monthly average)
- FTSE 100 volume on rainy vs dry London days
- Sunshine hours vs daily price change across all exchanges
- Extreme weather events (storm / heavy rain) and index performance

---

### Chapter 4 — New: Stock Index Metrics Lab

New sub-section showing students how to convert the stocks event data into metrics using `mcollect`:

1. Explore `s4c_stocks` events
2. Preview the data shape
3. Push to `s4c_student_metrics` with `| mcollect index=s4c_student_metrics prefix=stocks.`
4. Verify with `| mcatalog`
5. Query with `| mstats` and visualize in Analytics Workspace

> The `mcollect` command is intentionally commented out in the search — students uncomment and run it themselves as the exercise.

---

### Chapter 6 — New: Canvas Visualizations (rcastley)

New sub-section in **Chapter 6 (Dashboard Studio)** covering production-ready Canvas 2D API visualizations from the [splunk-custom-visualizations](https://github.com/rcastley/splunk-custom-visualizations) library by **Ryan Castley**.

Highlights:

| Visualization | Data source | Description |
|---|---|---|
| Data Pipeline | Any index | Animated Sankey-style flow |
| Index Universe | `index=*` | Circular bubble map of all indexes |
| Resource Gauge | `index=_introspection` | Triple-arc: CPU / Memory / Swap |
| Indexing Pipeline Flow | `index=_internal group=queue` | Animated queue fill |
| Forwarder Heatmap | `index=_internal group=tcpin_connections` | Staleness grid |
| Scheduler Health | `index=_internal sourcetype=scheduler` | Success rate and skip rate |

All examples can be cloned, built, and installed directly — no Splunk development experience required. A [live demo](https://rcastley.github.io/splunk-custom-visualizations/) is available without Splunk.

---

### Navigation: Browser Back/Forward + Prev/Next Buttons

The workshop URL now reflects your current position via a hash fragment:

```
/en-GB/app/splunk4champions2/lab#ch=three&sec=threeInspector
```

**What this means for participants:**

- **Browser back/forward** works — navigating between sections adds history entries
- **Bookmarks** work — you can bookmark any chapter/section and return directly to it
- **Shareable links** — send a colleague a direct link to a specific section
- **Page refresh** — restores your exact position instead of dropping you back to Setup

**Prev / Next buttons** appear at the right end of the section tab bar — two small arrow buttons (`‹` `›`) with a position counter (e.g. `4/1` = chapter 4, section 1). They navigate linearly through all sections across all chapters, so you can step through the entire workshop in order without touching the tab menus.
