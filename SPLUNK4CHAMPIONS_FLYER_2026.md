---
title: "Splunk4Champions Workshop"
subtitle: "A hands-on Splunk workshop for experienced users, admins, and champions"
author: "Splunk4Champions Team"
date: "2026"
geometry: margin=12mm
fontsize: 9pt
---

\small

# Splunk4Champions Workshop

**Hands-on Splunk training delivered as a Splunk app.**  
Participants learn inside Splunk through guided labs, embedded searches, examples, screenshots, dashboards, and quizzes.

## Built for

- Experienced Splunk users who want to go deeper
- Splunk admins and platform owners
- Use case developers and dashboard builders
- Internal champions who support other teams

## What participants will learn

**Search & SPL**  
Search modes, Search Assistant, SPL2, command types, Job Inspector, terms, `tstats`, performance patterns, and story-driven investigations.

**Data & Architecture**  
Indexes, buckets, data aging, SmartStore concepts, data pipeline, segmentation, indexers, and clustering fundamentals.

**Metrics & Time Series**  
Metric indexes, `mcollect`, `mcatalog`, `mstats`, weather data, stock index metrics, and Phyphox sensor experiments.

**Dashboards**  
Classic XML dashboards, Dashboard Studio, base and chain searches, tokens, drilldowns, annotations, trellis, custom visualizations, and publishing.

**Modern Splunk Experience**  
Splunk AI Assistant, optional Splunk MCP Server lab, Splunk Mobile overview, and a final Champion Quiz.

## Workshop structure

| Chapter | Focus |
|---|---|
| Setup | Health Check, app readiness, links, release highlights |
| Settings | UI preferences, search modes, Search Assistant, AI Assistant |
| Data | Indexes, buckets, pipeline, aging, SmartStore |
| Search | SPL/SPL2, Inspector, `TERM`, `tstats`, performance, MCP |
| Metrics | Metric indexes, `mcollect`, `mstats`, weather and stock data |
| XML Dashboards | Base searches, drilldowns, tokens, colors, pseudonymization |
| Dashboard Studio | Modern dashboards, interactivity, custom visualizations |
| Mobile | Splunk Mobile setup and overview |
| Champion Quiz | Timed knowledge check across the workshop |

## Included demo data

The app ships with curated `s4c_*` data so labs do not depend on customer production data:

- Web/tutorial logs for search and dashboard labs
- Weather data in event and metric form
- Historical meteo data aligned with stock exchange cities
- Up to 10 years of daily OHLCV for nine global stock indices
- Practice metric indexes for participant `mcollect` labs
- Optional Phyphox phone sensor data through HEC

## Why teams use it

- Runs directly in Splunk: no separate lab platform required
- Suitable for live workshops, self-paced labs, and champion enablement
- Covers both platform internals and user-facing content creation
- Reinforces performance, maintainability, and practical SPL habits
- Includes a final quiz for recap and engagement

## Logistics

**Format:** Guided hands-on workshop inside Splunk  
**Audience:** Intermediate to advanced Splunk users  
**App:** `splunk4champions2`  
**Current build referenced:** `2.11.77`  
**Repository:** <https://github.com/bautt/splunk4champions2>  
**Contact:** `tbaublys@splunk.com`

---

**Export note:** This flyer is plain Markdown. For PDF, use Pandoc, VS Code Markdown PDF, Typora, Marked, Obsidian, or import into Word/Google Docs. Keep margins around `12mm` and font size around `9pt` for a one-page flyer.
