---
title: "Splunk4Champions Workshop Handout"
subtitle: "Hands-on Splunk skills for champions, admins, and use case builders"
author: "Splunk4Champions Team"
date: "2026"
geometry: margin=18mm
fontsize: 10pt
---

# Splunk4Champions Workshop Handout

**Workshop app:** `splunk4champions2`  
**Current build referenced:** `2.16.0`  
**Repository:** <https://github.com/bautt/splunk4champions2>  
**Workshop UI:** `https://<your-splunk>/en-GB/app/splunk4champions2/lab`  
**Contact:** `tbaublys@splunk.com`

Splunk4Champions is an interactive workshop delivered as a Splunk app. Participants work through guided labs inside Splunk itself: no separate slide deck is required, and each chapter combines explanations, searches, screenshots, and hands-on tasks.

The workshop is built for experienced Splunk users who want to move beyond basic search into data internals, search performance, metrics, dashboards, mobile, and new AI/MCP workflows.

## Who should attend

- Experienced and ambitious Splunk users
- Splunk admins and platform owners
- Use case developers and dashboard builders
- Champions who support other users inside their organization

## What you will practice

- Splunk UI preferences, search modes, Search Assistant, and AI Assistant
- Indexes, buckets, data aging, SmartStore concepts, and the data pipeline
- Search fundamentals, SPL2, command types, Job Inspector, terms, `tstats`, and performance patterns
- Metrics workflows with `mcollect`, `mcatalog`, `mstats`, weather data, stock index data, and Phyphox sensor data
- XML dashboards (Legacy) and Dashboard Studio
- A custom visualization exercise inside Dashboard Studio
- Splunk Mobile concepts (Legacy)
- Final Champion Quiz to check knowledge across the whole workshop

## How to use the workshop app

1. Open the workshop UI from the Splunk app navigation.
2. Start with **Setup** and verify the Health Check.
3. Work the live path in order: Settings, Data, Search, Dashboard Studio, Champion Quiz. Metrics, XML Dashboards, and Mobile are under **Legacy**.
4. Use the URL hash and browser bookmarks to return to a chapter or section.
5. For live delivery, use **Large Room** and the colour scheme on **Setup**. Both stay visible there.

The app stores your navigation state in the URL hash. Browser back/forward and direct links can be used during a class.

\newpage

# Chapter Guide

## Setup

The Setup area confirms that the environment is ready before participants start the labs.

Key items:

- Health Check for expected indexes, event counts, metric counts, and date ranges
- Splunk version and app version display
- Readme, What's New, follow-up links, and credits
- Trainer-friendly display mode for larger rooms

If the Health Check confirms a missing index, create it under **Settings -> Data -> Indexes** and enable the matching app data input. If an index exists but is empty, check the monitor input or scripted input listed by the Health Check. Failed checks are not proof of missing data: resolve session, permission, network, or timeout errors and refresh first.

## 1. Settings

This chapter tunes the Splunk working environment before deeper labs begin.

Covered topics:

- Search Assistant
- Line numbers
- Themes
- Fast, Smart, and Verbose search modes
- Search auto-format and keyboard shortcuts
- Inline comments in SPL
- User language and locale
- Splunk AI Assistant

Practical takeaway: participants learn how to make the Search UI more readable and avoid expensive UI habits such as using Verbose mode by default on broad searches.

## 2. Data

This chapter explains how Splunk stores, ages, and searches data.

Covered topics:

- Indexes and buckets
- Hot, warm, cold, and frozen data
- What lives inside a bucket: raw data, `tsidx`, bloom filters, metadata
- Input, parsing, indexing, and search pipeline stages
- Segmentation and TERM highlighting
- Indexers and clustering
- Data aging and SmartStore concepts

Practical takeaway: participants understand why data layout matters for search behavior, retention, performance, and architecture decisions.

## 3. Search

This is the largest workshop chapter and focuses on practical SPL and search behavior.

Covered topics:

- Search basics and core SPL patterns
- SPL2 overview and modules
- Search command types
- Job Inspector and Inspector lab
- Terms, segmentation, `walklex`, and the `TERM()` directive
- `tstats` and `PREFIX`
- Bad searches and slow search patterns
- Story-driven investigation lab
- Search recap / quiz
- Optional Splunk MCP Server lab

Practical takeaway: participants learn not just what SPL commands do, but why some searches are faster, safer, or more scalable than others.

## 4. Dashboard Studio

Dashboard Studio is six pages.

Covered topics:

- Overview
- Chain searches
- Token Kitchen: simplified in-page preview plus a link to the real Studio dashboard for editor exercises
- Image upload
- Custom viz exercise with `@splunk/dashboard-studio-extension`
- Sharing a dashboard without a login

Practical takeaway: participants build one Studio dashboard, then a chart Studio does not ship.

## 5. Champion Quiz

The final numbered chapter is a Kahoot-style knowledge check across the workshop.

Covered topics:

- Timed questions
- Single-choice, true/false, and multi-answer patterns
- Instant feedback
- Time-decayed scoring

Practical takeaway: the quiz gives participants a memorable end point and helps trainers reinforce the main ideas.

## Legacy · Metrics

This chapter is under **Legacy**. It is not on the numbered path.

This chapter introduces Splunk metric indexes and metric search patterns.

Covered topics:

- Metrics introduction
- Onboarding metrics
- Searching metrics
- Weather data reference
- Metrics lab
- Stock index metrics: events to metrics
- Phyphox experiments

Core commands and concepts:

- `mcollect`
- `mcatalog`
- `mstats`
- Event-to-metric conversion
- Metric dimensions and naming

Practical takeaway: participants learn when to use event indexes versus metric indexes, and how to build efficient metric searches.

## Legacy · XML Dashboards

This chapter is under **Legacy**. It is not on the numbered path.

This chapter covers classic Splunk XML dashboards.

Covered topics:

- Base searches
- Drilldowns
- Tokens
- Annotations
- Colors
- Pseudonymization / hiding user names

Practical takeaway: participants understand proven XML dashboard patterns that still matter in many Splunk environments.

## Legacy · Mobile

This chapter is under **Legacy**. It is not on the numbered path.

This chapter introduces Splunk Mobile.

Covered topics:

- Splunk Mobile overview
- Gateway setup
- Adding a mobile device
- Mobile dashboard and alert experience

Practical takeaway: participants see how Splunk content can move beyond desktop dashboards into mobile workflows.

\newpage

# Workshop Data Reference

The workshop ships with curated `s4c_*` indexes so labs can run without using customer production data.

## Core event indexes

### `s4c_tutorial`

Web-style access records and tutorial data for search and dashboard exercises.

Used in:

- Search basics
- Dashboard examples
- XML dashboard labs
- Dashboard Studio labs

### `s4c_www`

Combined web access logs for web analytics, search, pseudonymization, and dashboard patterns.

Used in:

- Search labs
- Web analytics examples
- Privacy and pseudonymization exercises

### `s4c_weather`

OpenWeatherMap-style JSON weather data, including real and simulated current weather.

Used in:

- JSON exploration
- Weather examples
- Metrics-related labs

### `s4c_meteo`

Open-Meteo current weather events on a five-minute schedule.

Used in:

- Event search
- Timechart examples
- Event-vs-metric comparison

### `s4c_meteo_historic`

Historical daily weather by city from 2016 onward. The cities align with stock exchange cities used by `s4c_stock_indices`.

Join pattern:

```spl
date + city = date + exchange_city
```

Used in:

- Weather and stock correlation
- Lookup and join examples

### `s4c_stock_indices`

Daily OHLCV data for nine global indices, including:

- DAX
- Dow
- EURO STOXX 50
- FTSE 100
- Hang Seng
- Nasdaq
- Nikkei
- S&P 500
- SMI

Each event includes index metadata such as `index_name`, `symbol`, `date`, and `exchange_city`.

Used in:

- Settings examples
- Search labs
- `tstats`
- Weather correlation
- Metrics conversion labs

## Metric indexes

### `s4c_meteo_metrics`

Open-Meteo weather represented as metric time series.

Used in:

- Metrics search
- `mstats`
- Event-vs-metric comparison

### `s4c_student_metrics`

Practice metric index populated by participants during `mcollect` labs.

Used in:

- Event-to-metric conversion
- `mcatalog`
- `mstats`

### `s4c_phyphox` and `s4c_phyphox_metrics`

Phone sensor data from the Phyphox app, ingested through HTTP Event Collector.

Used in:

- HEC examples
- JSON parsing
- Metrics experiments
- Bring-your-own-device demonstrations

\newpage

# Quick Reference

## Search mode guidance

| Mode | Use when | Avoid when |
|---|---|---|
| Fast | You need counts, stats, and focused results | You need all fields discovered |
| Smart | Default interactive searching | Very broad forensic exploration |
| Verbose | Debugging field extraction and event detail | Large windows, dashboards, production-scale searches |

## Performance reminders

- Start with a narrow time range.
- Filter early with `index`, `sourcetype`, host, source, and selective terms.
- Use transforming commands when you only need aggregates.
- Use `tstats` and accelerated data where appropriate.
- Use Job Inspector to understand where time is spent.
- Avoid unnecessary `join` on large result sets.
- Prefer metric indexes for dense time-series measurements.

## Dashboard reminders

- Use base searches or chain searches to avoid duplicate work.
- Keep tokens understandable and documented.
- Avoid running broad, expensive searches on every page load.
- Use consistent colors, annotations, and drilldowns.
- Test dashboards with realistic time ranges and user permissions.

## Metrics reminders

- Metric indexes are optimized for numeric time series.
- Dimensions should be useful, stable, and not too high-cardinality.
- `mstats` is the primary metrics search command.
- `mcollect` can convert event search results into metric data points.
- Use `mcatalog` to discover metric names and dimensions.

## Dashboard Studio reminders

- Treat data sources, layout, and interactions separately.
- Use chain searches for dependent panels.
- Use images and annotations sparingly to improve context.
- Custom visualizations can extend Studio beyond built-in charts.

\newpage

# Recent Highlights

The current workshop has been refreshed across content, UI, and data.

## Current content highlights

- Version 2.16.0 refreshes Splunk UI and React 18, adds persistent dismissible clipboard feedback, improves Health Check diagnostics and lesson loading/retry, and prevents overlapping navigation labels on narrow screens.
- Locally smoke-tested on Splunk Enterprise 10.6.0.5. The custom visualization exercise requires 10.4+ or an equivalent Cloud release; the upgraded UI stack was not validated on older releases or in Cloud.
- Setup Health Check, Large Room, and a visible colour scheme picker
- Live path: Settings, Data, Search, Dashboard Studio, Champion Quiz
- Legacy tab for Metrics, XML Dashboards, and Mobile
- Dashboard Studio: chain searches, Token Kitchen preview and real-dashboard link, images, custom viz, and sharing
- Metrics labs with weather, stock index, and Phyphox data, under Legacy

## Recent data model highlights

- `s4c_stock_indices` provides up to 10 years of daily OHLCV data for nine major indices.
- `s4c_meteo_historic` aligns historical weather cities with stock exchange cities.
- Open-Meteo and stock update scripts use Python standard library dependencies where possible.

## Trainer delivery notes

- Start with Setup Health Check before any chapter.
- Use Large Room and the colour scheme on Setup when projecting.
- Encourage participants to bookmark URL hashes for labs they want to revisit.
- Keep the Search chapter hands-on: Job Inspector and bad search examples land best when participants run them.
- Use the final quiz as a recap and discussion starter rather than only as a score.

# Exporting this handout

This file is plain Markdown and is meant to be easy to edit.

Example PDF export with Pandoc:

```bash
pandoc SPLUNK4CHAMPIONS_HANDOUT_2026.md \
  -o SPLUNK4CHAMPIONS_HANDOUT_2026.pdf \
  --pdf-engine=xelatex
```

Other easy options:

- Open in VS Code with a Markdown PDF extension.
- Open in Typora, Marked, or Obsidian and export to PDF.
- Import into Google Docs or Word if you prefer final layout editing there.
