![](https://github.com/bautt/splunk4champions2/blob/main/src/package/appserver/static/images/champignon_schwarz_trans_150x150.png#gh-light-mode-only) ![](https://github.com/bautt/splunk4champions2/blob/main/src/package/appserver/static/images/champignon_weiss_trans_150x150.png#gh-dark-mode-only)

# Welcome to the Splunk4Champions Workshop!

An interactive, hands-on Splunk workshop delivered as a Splunk app. Participants follow guided labs through a React UI embedded directly in Splunk — no slides, everything runs inside the platform.

Built for experienced Splunk users: admins, use case developers, and champions who want to go deeper.

## Who should attend

- Experienced and ambitious Splunk users
- Use case owners and developers
- Splunk admins

## What's covered

| Chapter | Topics |
|---------|--------|
| **0 · Setup** | Health Check — verify indexes and app/Splunk version at a glance |
| **1 · Settings** | GUI options, Search Assistant, SPL2, Stock Index Search & tstats |
| **2 · Data** | Indexes, buckets, data pipeline, distributed architecture, data aging |
| **3 · Search** | Search basics, command types, Job Inspector, terms/segmentation, tstats, tips & quiz |
| **4 · Metrics** | Log-to-metrics, mcollect, mcatalog, mstats, weather data reference, stock index metrics lab |
| **5 · XML Dashboards** | Base search, drilldown, annotations, colors, post-processing |
| **6 · Dashboard Studio** | Tutorial, data sources, interactivity, layout, custom visualizations, canvas viz library, sharing |
| **7 · Mobile** | Splunk Mobile overview and demo |

## Installation

Download the latest release from the [Releases page](https://github.com/bautt/splunk4champions2/releases/) and install as a standard Splunk app.

- Compatible with Splunk 8+
- Works on Splunk Cloud
- Not intended for production systems — no warranty

If you have access to **show.splunk.com**, the workshop is available on Splunk Show.

## Included datasets

The app ships with real historical data used across the labs:

- **`s4c_stock_indices`** — up to 10 years of daily OHLCV for **9** major indexes (DAX, Dow, EURO STOXX 50, FTSE 100, Hang Seng, Nasdaq, Nikkei, S&P 500, SMI). Ingested by `update_stock_indices.py` (Yahoo chart API, stdlib only; `_time` = Unix epoch). Join `exchange_city` to `s4c_meteo_historic` on `date` + `city`.
- **`s4c_meteo_historic`** — Daily historical weather for the **seven** index `exchange_city` values (2016 → rolling; Paris/CAC removed). Shipped `lookups/meteo_historic.csv` plus **`update_meteo_historic_csv.py`** (Open-Meteo archive, daily) to keep the calendar in step with new index data. Join on `date` and `city` = `exchange_city`.
- **`s4c_weather`** — Real-time OpenWeatherMap data for metrics labs.
- **`s4c_tutorial`** — Web server logs for search and dashboard exercises.

## Phyphox experiments

After creating a HEC for Phyphox data, add to the HEC config:

```
/etc/apps/splunk_httpinput/local/inputs.conf
[http://phyphox]
allowQueryStringAuth = true
```

---

## Screenshots

#### Setup — Health Check
Verify index status, event counts, and date ranges. Shows Splunk and app version at a glance.

![Health Check](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch0_setup_health_check.png)

#### Chapter 1 — Settings: Search Assistant
![Search Assistant](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch1_settings_search_assistant.png)

#### Chapter 1 — Settings: Stock Index Search (SPL & tstats)
![Stock Index SPL](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch1_settings_stock_index_spl.png)

#### Chapter 2 — Data: Index and Buckets
![Data Index Buckets](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch2_data_index_buckets.png)

#### Chapter 3 — Search: Search Basics
![Search Basics](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch3_search_basics.png)

#### Chapter 3 — Search: Job Inspector
![Inspector](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch3_search_inspector.png)

#### Chapter 3 — Search: Terms & Segmentation
![Segmentation](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch3_search_terms_segmentation.png)

#### Chapter 3 — Search: tstats
![tstats](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch3_search_tstats.png)

#### Chapter 4 — Metrics: Searching Metrics
![Metrics](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch4_metrics_searching.png)

#### Chapter 5 — XML Dashboards: Base Search
![XML Dashboards](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch5_xml_dashboards_base_search.png)

#### Chapter 6 — Dashboard Studio: Overview
![Dashboard Studio](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch6_dashboard_studio_overview.png)

#### Chapter 6 — Dashboard Studio: Canvas Visualizations by Robert Castley
Production-ready Splunk Canvas 2D API visualizations — cloned, built, and invoked directly with no Splunk experience required. No future development dependency or Claude Code needed.

![Canvas Viz](https://github.com/bautt/splunk4champions2/blob/main/screenshots/ch6_dashboard_studio_canvas_viz.png)

---

## Credits

Workshop content is collected, consolidated, and adapted from public .conf presentations, blog articles, and Splunk Docs. All information is provided "as is" with no guarantee of completeness, accuracy, or timeliness.

- Originally created by **Andreas Greeske** and **Tomas Baublys** in 2020
- Version 2.0 rebuilt by **Tomas Baublys** on the Splunk UI template by **Daniel Federschmidt**
- Suggestions and improvements welcome: [tbaublys@splunk.com](mailto:tbaublys@splunk.com)

**Canvas Visualizations** section powered by [splunk-custom-visualizations](https://github.com/rcastley/splunk-custom-visualizations) by **Robert Castley** — a library of production-ready Canvas 2D API visualizations for Dashboard Studio.

### Special thanks for public content
Martin Müller · Clara Merriman · Richard Morgan · and many others linked throughout the app

### Special thanks for improvements and problem solving
Dirk Nitschke · Holger Sesterhenn · Henri Mak · Lukas Utz
