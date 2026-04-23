# Splunk4Champions — Quick Reference Handout

**Workshop:** https://github.com/bautt/splunk4champions2  
**Contact:** tbaublys@splunk.com  
**App URL:** `https://<your-splunk>/en-GB/app/splunk4champions2/lab`

---

## 1 · Settings & Preferences

### Keyboard Shortcuts

| Action | Windows / Linux | macOS |
|--------|----------------|-------|
| Reformat / auto-indent search | `Ctrl+Shift+F` | `⌘+Shift+F` |
| Expand macro inline | `Ctrl+Shift+E` | `⌘+Shift+E` |
| Run search | `Enter` | `Enter` |
| New line without running | `Shift+Enter` | `Shift+Enter` |

### Inline Comments

```spl
index=s4c_www status=200
```  the code is documentation enough  ```
| stats count by host
```

### Search Mode Quick Guide

| Mode | When to use |
|------|-------------|
| **Fast** | Count/aggregate searches — no field extraction needed |
| **Smart** | Default — Splunk decides what to extract |
| **Verbose** | Debugging only — sends all raw data to search head, expensive |

> ⚠ Never use Verbose mode on large datasets or in production dashboards.

### Language & Locale

Change URL language segment: `.../en-GB/app/...` → `.../de-DE/app/...`

### Links
- [Using the Search Assistant](https://docs.splunk.com/Documentation/Splunk/latest/Search/Usethesearchassistant)
- [Searchbar Keyboard Shortcuts](https://docs.splunk.com/Documentation/Splunk/latest/Search/Usethesearchbar#Keyboard_shortcuts_for_the_search_bar)
- [Search Modes](https://docs.splunk.com/Documentation/Splunk/latest/Search/Changethesearchmode)
- [User Language and Locale](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configureuserlanguageandlocale)

---

## 2 · Data — Indexes, Buckets & Pipeline

### How Data is Stored

```
Forwarders → Indexers → Index (e.g. index=XYZ)
                              └─ /opt/splunk/var/lib/splunk/XYZ/db/
                                    ├─ hot/    ← actively written
                                    ├─ warm/   ← recently rolled
                                    ├─ cold/   ← older data
                                    └─ frozen/ ← archived / deleted
```

Each **bucket** contains:
- `journal.gz` — compressed raw event data
- `*.tsidx` — time-series index files used by `tstats`
- `bloomfilter` — probabilistic filter for fast term lookup

### Data Pipeline Stages

```
Input → Parsing → Indexing → Search
```

| Stage | What happens |
|-------|-------------|
| **Input** | Data collected from forwarders, files, HEC, scripts |
| **Parsing** | Line breaking, timestamp extraction, charset handling |
| **Indexing** | Segmentation, bloom filter creation, tsidx generation |
| **Search** | Bloom filter check → tsidx scan → rawdata read |

### Links
- [Docs: How the Indexer Stores Indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/HowSplunkstoresindexes)
- [.conf2017 — Data Life Cycle: When and Where to Roll Data](https://conf.splunk.com/files/2017/slides/splunk-data-life-cycle-determining-when-and-where-to-roll-data.pdf)
- [Interactive Bloom Filter Demo](https://llimllib.github.io/bloomfilter-tutorial/)
- [TSIDX in Splexicon](https://docs.splunk.com/Splexicon:Tsidx)
- [Splunk Validated Architectures](https://www.splunk.com/en_us/form/splunk-validated-architectures.html)

---

## 3 · Search — Performance & Best Practices

### The Golden Rules

1. **Always specify an index** — `index=myindex` not `index=*`
2. **Narrow the time range** — the tighter the window, the fewer buckets scanned
3. **Filter before the first pipe** — put all conditions in the search string
4. **Use streaming commands early** — they run on indexers in parallel
5. **Reduce fields in the pipeline** — use `| fields field1 field2` early

### Streaming vs. Transforming Commands

| Type | Runs on | Examples |
|------|---------|---------|
| **Streaming** | Indexers (parallel) | `eval`, `fields`, `rename`, `where`, `rex`, `spath`, `makemv` |
| **Transforming** | Search head (sequential) | `stats`, `chart`, `timechart`, `top`, `rare`, `addtotals` |

> Put streaming commands **before** transforming commands wherever possible.

### Wildcards — Levels of Pain

| Pattern | Impact |
|---------|--------|
| `myterm*` | Not great — trailing wildcard, uses lexicon prefix |
| `my*erm` | Bad — mid-term wildcard, full scan |
| `*myterm` | Bad — leading wildcard, bypasses bloom filter |
| `*myterm*` | Death — full scan of every event |

> Never use wildcards to replace minor breakers: use `TERM(autoconfig.bat)` not `autoconfig*bat`

### TERM Directive

Splunk tokenises on **major breakers** — meaning `127.0.0.1` is split into `127`, `0`, `0`, `1`.  
`TERM()` forces an exact token lookup, bypassing segmentation:

```spl
index=_internal 127.0.0.1          ← slow: 4 token lookups
index=_internal TERM(127.0.0.1)    ← fast: 1 exact token lookup
```

**Minor breakers** (stay within a token): `. / : = @ - $ % \ _`  
**Major breakers** (split tokens): `[ ] < > ( ) | ! ; , ' " * \n \r \s \t & ?`

### WALKLEX

Inspect the actual terms in the index — useful for understanding what's indexed and diagnosing search performance:

```spl
| walklex index=s4c_tutorial type=fieldvalue
| stats sum(count) by term
```

> ⚠ Only works on **warm and cold** buckets. Requires `run_walklex` or `admin_all_objects` capability. Does not work with role-level search filters.

### tstats

`tstats` reads pre-built `.tsidx` files — it **never touches raw event data**, making it orders of magnitude faster for aggregations:

```spl
| tstats count WHERE index=s4c_www BY host, status, _time span=1h

| tstats avg(temperature_2m) max(temperature_2m)
  WHERE index=s4c_weather BY city, _time span=1d
```

> Requires `INDEXED_EXTRACTIONS = json` (or equivalent) in `props.conf` — `KV_MODE = json` (search-time only) does **not** work with tstats.

**PREFIX trick** — search for a specific field value at index time:

```spl
| tstats count WHERE index=s4c_www PREFIX(status=200) BY host
```

### Common Anti-Patterns

| Anti-pattern | Better alternative |
|---|---|
| `NOT field=x` / `field!=x` | `field=a OR field=b` (bloom-friendly) |
| `\| search bar` after first pipe | Put `bar` before the `\|` |
| `transaction` for grouping | `stats` with `by` fields |
| `join` for enrichment | `eventstats`, `appendcols`, or lookup |
| `savedsearch` to reuse results | `loadjob` to replay existing job |
| Real-time search running continuously | Scheduled search (1min/5min) + panel refresh |

### Job Inspector — What to Look For

Open with the **Job** menu → **Inspect Job** after running a search.

**Summary line:**
```
Completed: 2,169 results by scanning 1,355,725 events in 6.535 seconds
```
→ Calculate events/second to compare searches.

**Execution Costs — key components:**

| Component | What it measures |
|-----------|-----------------|
| `command.search.index` | Time reading `.tsidx` files |
| `command.search.rawdata` | Time reading `journal.gz` raw events |
| `command.search.filter` | Time filtering non-matching events |
| `command.search.kv` | Field extractions (also lookups, tags) |
| `command.search.typer` | Event type processing |

**Search Job Properties (lower section):**
- `optimizedSearch` — did Splunk rewrite your search? Compare with original.
- `diskUsage` — how much temp disk the job is using.
- Search for `lispy` in `search.log` to see the internal index query representation.

### Links
- [Docs: Job Inspector Execution Costs](https://docs.splunk.com/Documentation/Splunk/latest/Search/ViewsearchjobpropertieswiththeJobInspector#Execution_costs)
- [Clara-fication: Job Inspector (conf20)](https://conf.splunk.com/files/2020/slides/TRU1143C.pdf)
- [Martin Müller — Suchen verstehen mit dem Job Inspector](https://www.youtube.com/watch?v=3vDn5IHiMbs)
- [TSTATS and PREFIX — Richard Morgan (.conf20)](https://conf.splunk.com/files/2020/slides/PLA1089C.pdf)
- [tstats and PREFIX — Tyler Quinlivan blog](https://www.tylerquinlivan.com/posts/exploring_splunk_prefix/)
- [Docs: Write Better Searches](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebettersearches)
- [Docs: TERM directive](https://docs.splunk.com/Documentation/Splunk/latest/Search/UseCASEandTERMtomatchphrases)
- [Fields, Indexed Tokens and You — Martin Müller (.conf19 recap)](https://idelta.co.uk/splunk-conf-2019-fields-indexed-tokens-and-you/)
- [Clara-fication: Finding Expensive Searches (Clara Merriman)](https://www.splunk.com/en_us/blog/tips-and-tricks/splunk-clara-fication-job-inspector.html)

---

## 4 · Metrics

### Key Concepts

- Metrics use **measure** (numeric value) + **dimensions** (string metadata)
- Stored in metric indexes — cannot be searched with regular SPL, use `mstats`
- Much more efficient than events for time-series numeric data

### Essential Commands

```spl
| mcollect index=s4c_student_metrics prefix=stocks. 
  [ search index=s4c_stock_indices | table _time, symbol, open, high, low, close, volume ]

| mcatalog values(metric_name) WHERE index=s4c_meteo_metrics

| mstats avg(temperature_2m) WHERE index=s4c_meteo_metrics BY city span=1d
```

### Links
- [Docs: Get Started with Metrics](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/GetStarted)
- [Docs: Search and Monitor Metrics](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/Search)
- [Sending Metrics with OpenTelemetry Collector](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/SendMetrics)
- [Analytics Workspace](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/NavigateWorkspace)

---

## 5 · XML Dashboards

### Base Searches — Avoid Duplicate Queries

Define once, reference many times — all panels sharing the same base search run **one** underlying query:

```xml
<search id="base_web">
  <query>
    | tstats count WHERE index=s4c_www BY sourcetype, host, status, _time span=5m
  </query>
  <earliest>$time.earliest$</earliest>
  <latest>$time.latest$</latest>
</search>

<!-- Reference in any panel -->
<search base="base_web">
  <query>| timechart sum(count) BY status</query>
</search>
```

### Token Switches (Show/Hide Panels)

```xml
<panel depends="$show_details$">
  ...
</panel>

<!-- Button to set the token -->
<input type="link" token="show_details">
  <choice value="yes">Show Details</choice>
</input>
```

### Custom Field Colors

```xml
<option name="charting.fieldColors">
  {"COMPLETE":"#358856","CANCELED":"#ED8440","FAILED":"#B90E0A","PENDING":"#7EA77B"}
</option>
```

### Annotations

```spl
index=_internal sourcetype=scheduler
| eval annotation_label = "Scheduler: " + savedsearch_name
| table _time, annotation_label, annotation_color
```

- [Docs: Chart Event Annotations](https://docs.splunk.com/Documentation/Splunk/latest/Viz/ChartEventAnnotations)
- [Docs: Pan and Zoom Chart Controls](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Chartcontrols#Pan_and_zoom_chart_controls)

---

## 6 · Dashboard Studio

### Key Concepts vs. Classic XML

| Feature | Classic XML | Dashboard Studio |
|---------|------------|-----------------|
| Format | XML | JSON |
| Layout | Row/column grid | Free-form canvas |
| Tokens | `$token$` | `> tokens.token` |
| Base searches | `<search id=...>` | Named data sources |
| Custom viz | Splunkbase apps | React/D3 framework |
| Publish without login | ✗ | ✓ |

### Base & Chain Searches (DS)

```json
"dataSources": {
  "base_web": {
    "type": "ds.search",
    "options": {
      "query": "| tstats count WHERE index=s4c_www BY status, _time span=5m",
      "queryParameters": { "earliest": "$time.earliest$", "latest": "$time.latest$" }
    }
  },
  "chain_by_status": {
    "type": "ds.chain",
    "options": {
      "extend": "base_web",
      "query": "| timechart sum(count) BY status"
    }
  }
}
```

### Inline SVG Visualization

Bind search results directly to SVG attributes — no external images, fully packaged in JSON:

```json
{
  "type": "viz.svg",
  "options": {
    "svg": "<svg>...<rect fill='> primary | formatByType'/>...</svg>"
  }
}
```

### Publish without Login

1. Open a Dashboard Studio dashboard
2. **Edit → Publish** → set expiry
3. Share the generated URL — no Splunk account needed

> Searches run under the publishing user's permissions — RBAC remains in effect.

### Links
- [Dashboard Studio Tutorial](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/Tutorial)
- [Chain Searches](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/chainSearch)
- [Tokens, Conditional Panels](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/conditionallyVisiblePanels)
- [Tabbed Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/tabsDashboard)
- [Trellis Layout](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/trellisLayout)
- [Publish Dashboards](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/publishDashboard)
- [Canvas Visualizations by Robert Castley](https://github.com/rcastley/splunk-custom-visualizations) · [Live Demo](https://rcastley.github.io/splunk-custom-visualizations/)
- [Blog: Dashboard Studio — More Maps & More Interactivity](https://www.splunk.com/en_us/blog/platform/dashboard-studio-more-maps-more-interactivity.html)

---

## 7 · Splunk Mobile & AR

### Setup Steps

1. **Download the app**
   - iOS: [App Store](https://apps.apple.com/us/app/splunk-mobile/id1420299852)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=com.splunk.android.alerts)
   - iPad: [App Store](https://apps.apple.com/us/app/splunk-for-ipad/id1568523145)

2. **Enable Splunk Secure Gateway (SSG)** — included with Splunk Enterprise 8.1+
   - [Get Started with SSG](https://docs.splunk.com/Documentation/SecureGateway/latest/Admin/Requirements)

3. **Log your device in** — scan QR code from SSG app on Splunk Web
   - [Register a Device](https://docs.splunk.com/Documentation/SecureGateway/latest/User/RegisterorUnregisteraDevice)

4. **For AR** — install [Splunk App for Edge Hub](https://splunkbase.splunk.com/app/4513) on the search head
   - [Splunk AR for iOS](https://docs.splunk.com/Documentation/AR/latest/User/AboutSplunkAR)
   - [Splunk AR for Android](https://play.google.com/store/apps/details?id=com.splunk.android.ar)

### Phyphox HEC Config

After creating a HEC token for Phyphox data, add to `/etc/apps/splunk_httpinput/local/inputs.conf`:

```ini
[http://phyphox]
allowQueryStringAuth = true
```

---

## Useful SPL Snippets

```spl
-- Find the most expensive searches
index=_audit action=search info=completed
| eval duration=round(total_run_time,2)
| stats avg(duration) max(duration) count by user, search
| sort -max(duration)

-- Health check: index event counts
| tstats count WHERE index=* BY index
| sort -count

-- Convert events to metrics
index=s4c_stock_indices
| mcollect index=s4c_student_metrics prefix=stocks.

-- Walklex: what's in my index?
| walklex index=s4c_tutorial type=fieldvalue
| stats sum(count) by term

-- Weather + stocks correlation
index=s4c_stock_indices symbol="^GDAXI"
| eval date=strftime(_time,"%Y-%m-%d")
| join date [
    search index=s4c_meteo_historic exchange="DAX"
    | eval date=strftime(_time,"%Y-%m-%d")
    | fields date, temperature_2m_mean, precipitation_sum
  ]
| timechart span=1mon avg(close) avg(temperature_2m_mean)
```

---

## Quick Reference Card

| Goal | SPL pattern |
|------|------------|
| Fast count by field | `\| tstats count WHERE index=X BY field` |
| Exact token match | `TERM(127.0.0.1)` |
| Group events (not sessions) | `\| stats ... BY field` |
| Enrich without join | `\| eventstats` or `\| lookup` |
| Replay previous search | `\| loadjob savedsearch="app:name"` |
| Inspect index terms | `\| walklex index=X type=fieldvalue` |
| List all metrics | `\| mcatalog values(metric_name) WHERE index=X` |
| Push events to metrics | `\| mcollect index=X prefix=p.` |

---

*Workshop Repository: https://github.com/bautt/splunk4champions2*  
*Contact: tbaublys@splunk.com*
