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
Dashboard Studio (chain searches, Token Kitchen preview and real-dashboard link, images, a custom viz exercise, and sharing) and classic XML dashboards under Legacy.

**Modern Splunk Experience**  
Splunk AI Assistant, optional Splunk MCP Server lab, Splunk Mobile under Legacy, and a final Champion Quiz.

## Workshop structure

| Chapter | Focus |
|---|---|
| 1 Settings | UI preferences, search modes, Search Assistant, AI Assistant |
| 2 Data | Indexes, buckets, pipeline, aging, SmartStore |
| 3 Search | SPL/SPL2, Inspector, `TERM`, `tstats`, performance, MCP |
| 4 Dashboard Studio | Overview, chain searches, token kitchen, images, custom viz, sharing |
| 5 Champion Quiz | Timed knowledge check across the workshop |
| Legacy | Metrics, XML Dashboards, and Mobile |
| Setup | Health Check, Large Room, colour scheme, links, release highlights |

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
**Current build referenced:** `2.16.0`  
**Repository:** <https://github.com/bautt/splunk4champions2>  
**Contact:** `tbaublys@splunk.com`

**2.16.0 refresh:** updated Splunk UI and React 18, clearer setup and clipboard
feedback, lesson retry controls, and scrollable navigation. Locally smoke-tested
on Splunk Enterprise 10.6.0.5. Custom visualization labs require 10.4+ or an
equivalent Cloud release.

---

**Export note:** This flyer is plain Markdown. For PDF, use Pandoc, VS Code Markdown PDF, Typora, Marked, Obsidian, or import into Word/Google Docs. Keep margins around `12mm` and font size around `9pt` for a one-page flyer.
