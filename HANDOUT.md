# Splunk4Champions — Workshop Handout

**Repository:** [github.com/bautt/splunk4champions2](https://github.com/bautt/splunk4champions2)  
**Contact:** tbaublys@splunk.com  
**App URL (workshop UI):** `https://<your-splunk>/en-GB/app/splunk4champions2/lab` (locale segment may differ, e.g. `en-US`)

> **Tip — bookmarks:** The lab records your place in the URL **hash** (e.g. `#ch=three&sec=...`). Use browser back/forward, book chapter/section steps, and the **‹ ›** controls to move linearly through all sections.

**Figure base (GitHub `main`):**  
`https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/`  
— below, images are named `ch0_...` through `ch6_...` for use in Slides or offline copies.

---

## 0 · Setup, health, and data

The **Setup** chapter includes a **health check** (indexes, event counts, time range, **Splunk** and **app** version) plus **Readme**, **What’s new**, follow-up links, and **credits**. If an index is red, create it under **Settings → Data → Indexes** and enable the matching **Data inputs** in the app.

| Index (examples) | Role |
|------------------|------|
| `s4c_tutorial` | Web-style tutorial logs for search and dashboards |
| `s4c_www` | Access-combined demo web traffic |
| `s4c_weather` | OpenWeatherMap-style JSON for metrics/weather labs |
| `s4c_meteo` / `s4c_meteo_metrics` | Open-Meteo event + metric series |
| `s4c_meteo_historic` | Daily weather by **city** (join to stocks on **date** + **city** = `exchange_city`) |
| `s4c_stock_indices` | Daily OHLCV for major indexes (`exchange_city` for weather joins) |
| `s4c_student_metrics` | Practice **metric** index for `mcollect` labs (filled by you) |
| `s4c_phyphox` / `s4c_phyphox_metrics` | HEC Phyphox event + metrics |

![Setup — health check](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch0_setup_health_check.png)

---

## 1 · Settings & preferences

Topics in the app: **Search Assistant**, line numbers, **themes**, **search modes** (fast / smart / verbose), **auto-format** and **keyboard shortcuts**, **inline comments**, **user language & locale**, **Splunk AI Assistant**, and **useful links**.

### Search Assistant & stock index lab (examples from the UI)

![Search Assistant](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch1_settings_search_assistant.png)

![Stock index search — SPL and tstats](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch1_settings_stock_index_spl.png)

### Keyboard shortcuts (search bar)

| Action | Windows / Linux | macOS |
|--------|-----------------|-------|
| Reformat / auto-indent | `Ctrl+Shift+F` | `⌘+Shift+F` |
| Expand macro inline | `Ctrl+Shift+E` | `⌘+Shift+E` |
| Run search | `Enter` | `Enter` |
| New line without running | `Shift+Enter` | `Shift+Enter` |

### Inline comments

Enclose comment text in **backticks** inside the search string (see [Comments](https://docs.splunk.com/Documentation/Splunk/latest/Search/Comments) in Docs). The workshop step shows a before/after screenshot (`comments.png` in the app static folder).

### Search mode quick guide

| Mode | When to use |
|------|-------------|
| **Fast** | Counts/aggregates when you do not need all fields extracted |
| **Smart** | Default — Splunk chooses field discovery |
| **Verbose** | Debugging only — more data on the search head, **expensive** on large data |

> Do **not** use Verbose on huge windows or production dashboards.

### Language & locale

You can switch the UI language via **user preferences**; URLs may use a locale segment such as `en-GB` or `de-DE`.

### Links (Settings chapter)

- [Search Assistant](https://docs.splunk.com/Documentation/Splunk/latest/Search/Usethesearchassistant)
- [Keyboard shortcuts (search bar)](https://docs.splunk.com/Documentation/Splunk/latest/Search/Usethesearchbar#Keyboard_shortcuts_for_the_search_bar)
- [Search modes](https://docs.splunk.com/Documentation/Splunk/latest/Search/Changethesearchmode)
- [User language and locale](https://docs.splunk.com/Documentation/Splunk/latest/Admin/Configureuserlanguageandlocale)
- [SPL2 overview](https://help.splunk.com/en/splunk-enterprise/search/spl2-overview/where-can-i-use-spl2) (SPL2 content lives under **Chapter 3 — Search** in the app)

---

## 2 · Data — indexes, buckets, and pipeline

### How data is stored (conceptual)

```
Forwarders / inputs → Indexers → Index (e.g. index=myapp)
                        └── $SPLUNK_DB/<index>/db/
                              ├── hot/   ← actively written
                              ├── warm/  ← rolled, searchable
                              ├── cold/  ← older, still searchable
                              └── frozen/← policy-dependent
```

Each **bucket** holds `journal.gz` (raw), `*.tsidx` (for fast scans and `tstats`), and **bloom filters** for terms.

### Data pipeline

```
Input → Parsing → Indexing → Search
```

| Stage | Role |
|-------|------|
| **Input** | HEC, files, forwarders, scripts |
| **Parsing** | Line breaking, time, host, sourcetype |
| **Indexing** | Segmentation, tsidx, bloom |
| **Search** | Bloom → tsidx → raw as needed |

![Data — index and buckets (UI)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch2_data_index_buckets.png)

### Links (Data chapter)

- [How the indexer stores indexes](https://docs.splunk.com/Documentation/Splunk/latest/Indexer/HowSplunkstoresindexes)
- [Splunk Validated Architectures](https://www.splunk.com/en_us/form/splunk-validated-architectures.html)
- [TSIDX (Splexicon)](https://docs.splunk.com/Splexicon:Tsidx)
- [Bloom filter tutorial (interactive)](https://llimllib.github.io/bloomfilter-tutorial/)

---

## 3 · Search — basics, SPL2, inspector, terms, tstats, stocks, tips, MCP, quiz

### Search basics & golden rules

1. **Specify index(es)** — avoid `index=*` in real use.  
2. **Tighten time** — fewer buckets.  
3. **Filter in the first search** — before the first `|`.  
4. **Streaming commands first** where possible.  
5. **Drop fields early** — `| fields` or `| eval` + narrow columns.

![Search basics](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch3_search_basics.png)

### SPL2 (Module Editor, next-gen language)

- **SPL2** is Splunk’s unified language for search and stream (see platform version matrix in the **SPL2 Overview** lab).  
- Use the **language picker** on the search bar and/or the **Modules** tab (**Module Editor**) for multi-search “notebook” workflows.  
- Docs: [Where can I use SPL2?](https://help.splunk.com/en/splunk-enterprise/search/spl2-overview/where-can-i-use-spl2) · [Module editor](https://help.splunk.com/en/splunk-enterprise/search/spl2-search-manual/getting-started/spl2-module-editor-overview)

### Command types (streaming vs transforming)

| Kind | Where it runs | Examples |
|------|---------------|----------|
| **Streaming** | Indexers in parallel (often) | `eval`, `where`, `fields`, `rex`, `spath` |
| **Transforming** | After reduction | `stats`, `chart`, `timechart`, `top`, `dedup` |

### Job Inspector

Use **Job → Inspect Job** to see **event counts scanned**, **duration**, **execution costs** (`command.search.index`, `rawdata`, `filter`, `kv`, …), and **optimized** search. Compare two runs to tune expensive searches.

![Job Inspector](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch3_search_inspector.png)

### Segmentation, TERM, walklex, wildcards

- **Major breakers** split tokens (e.g. `127.0.0.1` → many tokens) — use **`TERM(127.0.0.1)`** for one indexed term where appropriate.  
- **Wildcards:** avoid leading `*`; mid-field `*` is costly.  
- **`walklex`:** list indexed terms in warm/cold (needs capability).  
- [TERM](https://docs.splunk.com/Documentation/Splunk/latest/Search/UseCASEandTERMtomatchphrases) · [walklex](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Walklex)

![Terms / segmentation](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch3_search_terms_segmentation.png)

### tstats and PREFIX

`tstats` reads **tsidx** only (not raw) — very fast for counts and stats if fields are indexed as expected. Use **`PREFIX(field=value)`** when you need a literal prefix in the tstats filter (see **PREFIX** in Docs and the **tstats** workshop step).

```spl
| tstats count WHERE index=s4c_www BY host, status, _time span=1h

| tstats count WHERE index=s4c_www PREFIX(status=200) BY host
```

![tstats (workshop UI)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch3_search_tstats.png)

### Stock index search and weather correlation

- **Index:** `s4c_stock_indices` — daily bars; fields include `date`, `symbol`, `index_name`, `exchange_city`, OHLCV.  
- **Weather:** `s4c_meteo_historic` — `city` matches `exchange_city`; **date** alignment via calendar day.  
- Large **`join` subsearches** can hit the default subsearch limit — the workshop uses **`inputlookup meteo_historic`** and app **`limits.conf` / `transforms.conf`** for reliable joins. Example pattern:

```spl
index=s4c_stock_indices
| eval date=coalesce(date, strftime(_time,"%Y-%m-%d"))
| join type=left date exchange_city [
    | inputlookup meteo_historic
    | rename city as exchange_city
    | fields date exchange_city temperature_2m_mean precipitation_sum sunshine_duration
]
| table date exchange_city close temperature_2m_mean precipitation_sum sunshine_duration
| sort -date
```

### Search tips (performance)

Prefer alternatives to **expensive** patterns: avoid unnecessary **leading wildcards**, push filters left, use **`stats`/`timechart`** instead of **`transaction`** when possible, consider **`lookup`** / **`eventstats`** instead of heavy **joins**, and use **saved/scheduled** searches instead of unbounded real-time in dashboards.

### Splunk MCP Server (optional)

Install the [**Splunk MCP Server** on Splunkbase](https://splunkbase.splunk.com/app/7931) (app **7931**), create an **encrypted MCP token** before clients connect, copy the **HTTPS** endpoint (e.g. `.../services/mcp`), and use **`Authorization: Bearer`**. In **Tools**, enable only the capabilities you need. Prefer a **dedicated** Splunk user (e.g. `username_mcp`) for **audit** and **least privilege**.  
Context: [Unlock the power of Splunk Cloud Platform with the MCP server](https://www.splunk.com/en_us/blog/artificial-intelligence/unlock-the-power-of-splunk-cloud-platform-with-the-mcp-server.html) (Splunk blog)  
Docs: [Configure the Splunk MCP Server](https://help.splunk.com/en/splunk-enterprise/mcp-server-for-splunk-platform/configure-the-splunk-mcp-server) · [Connect and use an MCP client](https://help.splunk.com/en/splunk-enterprise/mcp-server-for-splunk-platform/connect-and-use-an-mcp-client)

![MCP — server and token / endpoints (example)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/src/package/appserver/static/images/mcp_server_config.png)

![MCP — tools list (example)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/src/package/appserver/static/images/mcp_server_tools.png)

### Quiz (Chapter 3)

The **interactive quiz** tests search behaviour (including **tstats** and edge cases). Use **Reveal** to show answers in class.

### Search chapter — more links

- [Write better searches](https://docs.splunk.com/Documentation/Splunk/latest/Search/Writebettersearches)
- [Job Inspector — execution costs](https://docs.splunk.com/Documentation/Splunk/latest/Search/ViewsearchjobpropertieswiththeJobInspector#Execution_costs)
- [TSTATS and PREFIX (Richard Morgan, .conf20 slides)](https://conf.splunk.com/files/2020/slides/PLA1089C.pdf)
- [PREFIX — blog (Tyler Quinlivan)](https://www.tylerquinlivan.com/posts/exploring_splunk_prefix/)
- [Fields, indexed tokens — Martin Müller (recap)](https://idelta.co.uk/splunk-conf-2019-fields-indexed-tokens-and-you/)

---

## 4 · Metrics

**Concepts:** measures + dimensions, **metric** indexes, **`mstats`** / **`mcatalog`**, `mcollect` from events, **Analytics Workspace**.

```spl
| mcollect index=s4c_student_metrics prefix=stocks.
  [ search index=s4c_stock_indices | table _time, symbol, open, high, low, close, volume ]

| mcatalog values(metric_name) WHERE index=s4c_meteo_metrics

| mstats avg(temperature_2m) WHERE index=s4c_meteo_metrics BY city span=1d
```

- **Chapters in app:** Metrics intro, onboarding, **Searching Metrics**, **Weather data reference (Open-Meteo schema)**, **Metrics lab** (e.g. weather → `mcollect`), **Stock index metrics** (stocks → metrics), **Phyphox** experiments.  
- Index **`s4c_student_metrics`** is a safe practice target for **`mcollect`**.

![Metrics — searching (workshop UI)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch4_metrics_searching.png)

### Links (Metrics) — full reference

- [Get started with metrics](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/GetStarted)
- [Overview of metrics](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/Overviewofmetrics)
- [Search and monitor metrics](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/Search)
- [Convert logs to metrics (metadata)](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/Convertlogstometadata) · [Best practices for metrics](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/Bestpracticesformetrics)
- [Manage metric index limits](https://docs.splunk.com/Documentation/Splunk/latest/Metrics/Manage-metric-index-limits)
- [Analytics / Analytics Workspace](https://docs.splunk.com/Documentation/Splunk/latest/Analytics/Analyze)
- Command reference: [`mstats`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Mstats) · [`mcatalog`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Mcatalog) · [`mcollect`](https://docs.splunk.com/Documentation/Splunk/latest/SearchReference/Mcollect)
- [Metrics in Splunk Cloud](https://docs.splunk.com/Documentation/SplunkCloud/latest/Metrics/GetMetricsInOther) — platform-specific notes where applicable
- [OpenTelemetry → Splunk (Community blog)](https://community.splunk.com/t5/Community-Blog/Sending-Metrics-to-Splunk-Enterprise-With-the-OpenTelemetry/ba-p/613991) · [Open-Meteo API](https://open-meteo.com/) · [Open-Meteo docs](https://open-meteo.com/en/docs) (workshop weather data source context)

---

## 5 · Classic (Simple XML) dashboards

**Workshop subtopics:** [Base search](#51-base-search-and-post-process) · [Drilldown & time tokens](#52-drilldown) · [Token switches](#53-tokens) · [Annotations](#54-annotations) · [Colors](#55-field-and-series-colors) · [Pseudonymization / field protection](#56-pseudonymization)

Classic dashboards use **Simple XML** (or advanced XML in older content). The Search & Reporting **Visualization Editor** and **Source** view help you wire searches to panels. Official hub: [Build and edit dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Buildandeditdashboards) · [Simplified XML reference](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PanelreferenceforSimplifiedXML) · [Drilldown in Simple XML](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Drilldown) · [Tokens in dashboards](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Token) · [Event handlers](https://docs.splunk.com/Documentation/Splunk/latest/Viz/EventHandler).

![XML dashboards — base search (workshop UI)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch5_xml_dashboards_base_search.png)

### 5.1 Base search and post-process

A **base search** runs once and must produce a **transforming** result (e.g. `| stats`, `| timechart`, `| chart`, `| top` …) that downstream **post-process** searches refine. Post-process can only use **fields that exist in the base result table**. One base can feed many panels, which avoids repeating heavy searches.

**Define a named search** and bind time range to the dashboard’s time picker (`$time.earliest$` / `$time.latest$`):

```xml
<search id="base_www_tstats">
  <query>
| tstats count WHERE index=s4c_www BY status, host, _time span=5m
  </query>
  <earliest>$time.earliest$</earliest>
  <latest>$time.latest$</latest>
  <sampleRatio>1</sampleRatio>
</search>
```

**Reference it from a panel**; add a `query` for post-process only (no new index read):

```xml
<search base="base_www_tstats">
  <query> | timechart useother=f sum(count) by status </query>
</search>
```

**Second panel — different post-process, same base:**

```xml
<search base="base_www_tstats">
  <query> | top limit=5 host </query>
</search>
```

- [Post-process searches](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Post-process)
- [Limits for post-process searches (required fields, etc.)](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Postprocesssearchlimitations)

A **Trellis** visualization can also split one search across a dimension. For Dashboard Studio performance patterns, see [Video: Improving dashboard performance and resource usage](https://www.youtube.com/watch?v=LsTalEYwGsk) (also linked from the **Base & chain** lab).

### 5.2 Drilldown

**Drilldown** passes user interaction (chart zoom, click) into **tokens**, often `selection.earliest` and `selection.latest` for a time range. Other panels subscribe to those tokens in `<earliest>`/`<latest>` to stay in sync.

- [Set tokens in the drilldown `option` in Simple XML](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Drilldown#Define_drilldown_behavior_with_the__option__element)
- [Drilldown time range in charts](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Drilldown#Set_tokens_for_a_chart_element)

Conceptual pattern:

```xml
<drilldown>
  <set token="sel_earliest">$earliest$</set>
  <set token="sel_latest">$latest$</set>
</drilldown>
<!-- In another search: <earliest>$sel_earliest$</earliest> <latest>$sel_latest$</latest> -->
```

Workshop: compare **Drilldown** and **Token switches** example dashboards in the app.

### 5.3 Token switches

Use **tokens** to show or hide panels (`depends`) or to switch which visualization is visible. Tokens can be set from **user input** (dropdown, radio, time picker) or **drilldown / click** actions. See: [Form inputs and tokens](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Forminput).

```xml
<panel depends="$showTable$">
  <title>Table view</title>
  <table> ... </table>
</panel>
<input type="link" token="showTable">
  <choice value="*">All</choice>
  <choice value="yes">Show table</choice>
</input>
```

(Exact attribute names follow your Splunk version; the workshop **Tokens** step includes animated examples.)

### 5.4 Annotations

**Event annotations** overlay another search’s results on a time series (charts: line, area, column). The annotation search runs in parallel; map fields to label/color per [Chart event annotations](https://docs.splunk.com/Documentation/Splunk/latest/Viz/ChartEventAnnotations) · [Use annotations in the Simple XML chart configuration](https://docs.splunk.com/Documentation/Splunk/latest/Viz/Chartconfigurationreference).

SPL in the app often `eval`’s `annotation_label` / `annotation_color` to align with the chart. Dashboard Studio uses a different shape (e.g. `annotationLabel`, time column); see [Dashboard Studio chart annotations (security/structure)](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/dsSec) if you use DS.

### 5.5 Field and series colors

**Per-field** colors: `charting.fieldColors` with a JSON object of field name → color (hex). **Series** order: `charting.seriesColors` when you do not want to key by field name. Defaults changed around Splunk 9.x; explicit options keep branding stable.

```xml
<option name="charting.fieldColors">{"200":"0x5cb85c","404":"0xf0ad4e","500":"0xd9534f"}</option>
```

- [Chart configuration reference (charting.* options)](https://docs.splunk.com/Documentation/Splunk/latest/Viz/ChartConfigurationReference) · [Pie chart](https://docs.splunk.com/Documentation/Splunk/latest/Viz/PieChart)

### 5.6 Pseudonymization

Hiding or replacing sensitive fields in dashboards (e.g. usernames, IPs) is covered in the workshop; see also: [.conf 2017 — Data obfuscation and field protection in Splunk (PDF)](https://conf.splunk.com/files/2017/slides/data-obfuscation-and-field-protection-in-splunk.pdf).

---

## 6 · Dashboard Studio

**Workshop subtopics:** [Concepts & layout](#60-concepts) · [Base & chain data sources](#61-base-and-chain-searches-json) · [Tokens & interactivity](#62-tokens-and-interactivity) · [Tabs, trellis, images, custom viz, Canvas, publish](#63-layout-sharing-and-canvas) · [Documentation links](#64-dashboard-studio-documents)

![Dashboard Studio — overview (workshop UI)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch6_dashboard_studio_overview.png)

### 6.0 Concepts

| Area | Classic Simple XML | Dashboard Studio |
|------|-------------------|------------------|
| Definition | `.xml` dashboard | JSON (definition) + **canvas** or grid |
| Query reuse | `base` + post-process on `<search>` | `ds.search` (base) + `ds.chain` (children) |
| Interactivity | Tokens + `depends` | `tokens` block, `inputs`, `eventHandlers` |
| Sharing to anonymous viewers | **Not** via Publish in DS pre–10.0; classic embed differs | **Publish (10.0+)** — [Publish dashboard](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/publishDashboard) |

Entry points: [Dashboard Studio overview](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/Overview) · [Tutorial (Docs)](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/dashStudioTutorial) · [Alternative tutorial](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/Tutorial) · [What’s new in Dashboard Studio (10.2+)](https://help.splunk.com/en/splunk-enterprise/create-dashboards-and-reports/dashboard-studio/10.2/whats-new-in-dashboard-studio/whats-new-in-dashboard-studio) (pick your exact version in Help as URL patterns vary).

### 6.1 Base and chain searches (JSON)

A **data source** of type `ds.search` runs a SPL query. A **`ds.chain`** reuses another source’s result set and adds SPL **without** re-querying the index. The base query should be **transforming**; if not, declare fields so chain searches see them (workshop: `| fields` pattern).

**Concept:**

```
ds.search "base_www"  →  table: _time, host, status, count…
  ├── ds.chain "by_status"   → timechart
  ├── ds.chain "by_host"     → top hosts
  └── ds.chain "errors"      → where status >= 400 | stats
```

**Minimal `ds.search` + `ds.chain` sketch** (illustrative — your IDs and options match the visual editor or exported JSON):

```json
"dataSources": {
  "ds_base_www": {
    "type": "ds.search",
    "options": {
      "query": "| tstats count WHERE index=s4c_www BY host, status, _time span=5m",
      "queryParameters": {
        "earliest": "$global_time.earliest$",
        "latest": "$global_time.latest$"
      }
    }
  },
  "ds_chain_status": {
    "type": "ds.chain",
    "options": {
      "extend": "ds_base_www",
      "query": "| timechart useother=f sum(count) by status"
    }
  }
}
```

- [Chain search](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/chainSearch) (official syntax and limits)
- Video (performance, DS): [Improving dashboard performance and resource usage](https://www.youtube.com/watch?v=LsTalEYwGsk) — linked from the **Base & Chain** workshop step

**Non-transforming base + fields** (if you must start from raw scannable rows):

```spl
index=s4c_www
| fields _time, host, status, bytes, response_time
```

Then chain: `| stats count by host`, etc.

### 6.2 Tokens and interactivity

- **Inputs** (dropdown, text, time range): [Add and configure inputs (Dashboard Studio)](https://docs.splunk.com/Documentation/SplunkCloud/latest/DashStudio/inputConfig) (Cloud doc; **Enterprise** often mirrors — search Docs for *Dashboard Studio* + *input* in your version).
- **Set tokens from search** (`$datasource:result.field$` or job metadata): [Search tokens in Dashboard Studio](https://docs.splunk.com/Documentation/SplunkCloud/latest/DashStudio/searchTokens) (enable *Access search results or metadata* on the data source; see workshop screenshot `ds_metadata.png` reference).
- **Show/hide and `token` eval** (9.1+ / Cloud builds): [Blog — Configure show/hide and token eval in Dashboard Studio](https://www.splunk.com/en_us/blog/tips-and-tricks/dashboard-studio-how-to-configure-show-hide-and-token-eval-in-dashboard-studio.html)
- **Button input (Splunk 10.0+)** — native `input.button` sets tokens via `drilldown.setToken` (workshop: **Tokens, Buttons** step). [Conditional panels (Docs)](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/conditionallyVisiblePanels) · [Tabs in Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/tabsDashboard) · [Trellis](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/trellisLayout)

**Example: button sets a token (JSON fragment from workshop):**

```json
"input_btn_web": {
  "type": "input.button",
  "options": { "label": "Filter Web" },
  "eventHandlers": [
    { "type": "drilldown.setToken", "options": { "tokens": [ { "token": "category_filter", "value": "web" } ] } }
  ]
}
```

Default values live under `tokens.defaultTokenValues` so the first load is deterministic.

### 6.3 Layout, sharing, and Canvas

- **Custom React/D3** extensions require build pipeline; the workshop **Custom visualization** and **Canvas** steps describe three approaches.  
- **Canvas 2D library (Robert Castley):** [splunk-custom-visualizations (GitHub)](https://github.com/rcastley/splunk-custom-visualizations) — clone, `npm` build, install; [live static demo (no Splunk required)](https://rcastley.github.io/splunk-custom-visualizations/).  
- **Publish without login (Enterprise 10.0+ / supported Cloud):** from **Edit → Publish** set refresh + expiry, share URL; data runs as **publishing user**. [Publish dashboards](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/publishDashboard)  
- [Maps and interactivity (blog)](https://www.splunk.com/en_us/blog/platform/dashboard-studio-more-maps-more-interactivity.html)  
- Education: [Introduction to dashboards (Splunk Education)](https://education.splunk.com/course/introduction-to-dashboards) · [Dynamic dashboards](https://education.splunk.com/course/dynamic-dashboards)

**Inline SVG in DS:** bind fields to `viz.svg` options for lightweight custom graphics (workshop: **Layout** / images).

### 6.4 Dashboard Studio — document index

- [Dashboard Studio user manual / landing (navigate by topic)](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/Overview)  
- [Add data sources to Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/addDataSources)  
- [Data source options: `ds.search` / `ds.chain`](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/chainSearch) (same as chain)  
- [Add visualizations to Dashboard Studio](https://docs.splunk.com/Documentation/Splunk/latest/DashStudio/Visualization) (topic hub)

![Dashboard Studio — Canvas library (workshop UI)](https://raw.githubusercontent.com/bautt/splunk4champions2/main/screenshots/ch6_dashboard_studio_canvas_viz.png)

---

## 7 · Splunk Mobile (and AR)

1. Install **Splunk Mobile** — [iOS (iPhone)](https://apps.apple.com/us/app/splunk-mobile/id1420299852) · [Android](https://play.google.com/store/apps/details?id=com.splunk.android.alerts) · [iPad](https://apps.apple.com/us/app/splunk-for-ipad/id1568523145)  
2. **Splunk Secure Gateway (SSG):** [Requirements / administer](https://docs.splunk.com/Documentation/SecureGateway/latest/Admin/Requirements) · [SSG security](https://docs.splunk.com/Documentation/SecureGateway/3.4.251/Admin/Security) · [Register a device (User)](https://docs.splunk.com/Documentation/SecureGateway/latest/User/RegisterorUnregisteraDevice)  
3. **Connected experiences / blogs:** [Get started with connected experiences](https://www.splunk.com/en_us/blog/platform/get-started-with-connected-experiences.html) · [SSG 3.0](https://www.splunk.com/en_us/blog/platform/welcome-to-splunk-secure-gateway-3-0.html) · [What’s new in Mobile](https://www.splunk.com/en_us/blog/platform/reports-sharing-and-more-whats-new-in-splunk-mobile-this-summer.html) · [Mobile, iPad, AR & private networks](https://www.splunk.com/en_us/blog/platform/splunk-mobile-ipad-ar-and-tv-in-private-networks.html)  
4. **AR / Edge Hub (optional):** [Edge Hub & AR on Splunkbase](https://splunkbase.splunk.com/app/5180) — install on the search head when using AR. [AR for iOS (Docs)](https://docs.splunk.com/Documentation/AR/5.0.3/UseSplunkARinTheField/Installation) · [AR for Android (Docs)](https://docs.splunk.com/Documentation/ARAndroid/latest/UseSplunkARinTheField/Installation) · [Splunk AR blog tag](https://www.splunk.com/en_us/blog/tag/splunk-ar.html)

### ITSI on mobile (optional)

[Splunk IT Service Intelligence on Mobile and TV](https://www.splunk.com/en_us/blog/it/it-service-intelligence-itsi-comes-to-splunk-mobile-and-tv.html)

---

## Follow-up: .conf search sessions & extra reading

Selected sessions referenced in the workshop **Follow up** chapter (PDF + recording when available):

| Topic | Slides / resource |
|-------|-------------------|
| tstats and PREFIX | [PLA1089C PDF](https://conf.splunk.com/files/2020/slides/PLA1089C.pdf) · [Recording](https://conf.splunk.com/files/2020/recordings/PLA1089C.mp4) |
| Clara-fication: expensive searches | [PLA1162B PDF](https://conf.splunk.com/files/2022/slides/PLA1162B.pdf) · [Recording](https://conf.splunk.com/files/2022/recordings/PLA1162B_1080.mp4) |
| Fields, indexed tokens and you | [PLA1466B PDF](https://conf.splunk.com/files/2022/slides/PLA1466B.pdf) · [Recording](https://conf.splunk.com/files/2022/recordings/PLA1466B_1080.mp4) |
| Job Inspector | [TRU1143C PDF](https://conf.splunk.com/files/2020/slides/TRU1143C.pdf) · [Recording](https://conf.splunk.com/files/2020/recordings/TRU1143C.mp4) |
| More tstats for your buckets | [TRU1133B PDF](https://conf.splunk.com/files/2021/slides/TRU1133B.pdf) · [Recording](https://conf.splunk.com/files/2021/recordings/TRU1133B.mp4) |
| Master joining without `join` | [PLA1528B PDF](https://conf.splunk.com/files/2022/slides/PLA1528B.pdf) · [Recording](https://conf.splunk.com/files/2022/recordings/PLA1528B_1080.mp4) |
| Dashboard Studio interactivity | [PLA1314B PDF](https://conf.splunk.com/files/2022/slides/PLA1314B.pdf) · [Recording](https://conf.splunk.com/files/2022/recordings/PLA1314B_1080.mp4) |

**Splunk blog / Docs (search quality):** [Clara-fication: Job Inspector](https://www.splunk.com/en_us/blog/tips-and-tricks/splunk-clara-fication-job-inspector.html) · [Search best practices (Clara-fication)](https://www.splunk.com/en_us/blog/customers/splunk-clara-fication-search-best-practices.html) · [Built-in search optimizations (Docs)](https://docs.splunk.com/Documentation/Splunk/latest/Search/Built-inoptimization) · [Behind the magnifying glass — how search works (PDF, .conf 2016)](https://conf.splunk.com/files/2016/slides/behind-the-magnifying-glass-how-search-works.pdf)

**Video:** [Martin Müller — Job Inspector (B-Sides)](https://www.youtube.com/watch?v=1QCZ5klSptM) · [Martin Müller — searching with Lispy](https://conf.splunk.com/files/2019/summit/FN1003.mp4)

**Training:** [Splunk Training & Certification](https://www.splunk.com/en_us/training.html)

---

## Common anti-patterns (recap)

| Instead of | Prefer |
|------------|--------|
| `NOT x=y` (sometimes costly) | Positive filters where possible |
| `search foo` after first `|` | `foo` in the initial search string |
| `join` for large enrichment | `lookup`, `eventstats`, or prebuilt KV |
| Leading wildcards | `TERM()`, narrow tokens, CIM field names |
| `transaction` for grouping | `stats` with explicit `by` |
| Unbounded real-time in dashboards | Scheduled (1m/5m) + panel refresh |

---

## Useful SPL snippets

```spl
-- Expensive searches (audit)
index=_audit action=search info=completed
| eval duration=round(total_run_time,2)
| stats avg(duration) max(duration) count by user, search
| sort -max(duration)

-- tstats: counts by index
| tstats count WHERE index=* BY index
| sort - count

-- Walklex (capability / bucket type required)
| walklex index=s4c_tutorial type=fieldvalue
| stats sum(count) by term

-- Metrics catalog
| mcatalog values(metric_name) WHERE index=s4c_meteo_metrics
```

---

## One-page quick reference

| Goal | Pattern |
|------|--------|
| Fast aggregate | `\| tstats count WHERE index=X BY field` |
| Exact token | `TERM(127.0.0.1)` |
| Group without transaction | `\| stats ... BY field` |
| Enrich without join | `lookup` / `eventstats` |
| Index terms (warm/cold) | `walklex` |
| List metric names | `mcatalog` |
| Events → metrics (lab) | `mcollect` into `s4c_student_metrics` |
| Stock + meteo (workshop) | `inputlookup meteo_historic` on **date** + `exchange_city` |

---

## Phyphox (HEC)

For phone sensor HEC inputs, the workshop expects (see **Phyphox** / **Readme** in the app):

```ini
/etc/apps/splunk_httpinput/local/inputs.conf
[http://phyphox]
allowQueryStringAuth = true
```

---

*Handout version aligned with the Splunk4Champions2 workshop app structure (chapters 0–7). Screenshots: GitHub `main` branch. Contact: tbaublys@splunk.com*