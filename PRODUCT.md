# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two jobs are first-class. The participant's task comes first; trainer delivery is not secondary.

- **Participant.** An experienced Splunk user — admin, use-case owner, dashboard builder, or internal champion — working through guided labs inside Splunk Web. They already know the basics. Their job is to understand how Splunk behaves and leave able to build reliable content for other people.
- **Trainer.** The person running a live class from the same app. Their job is to deliver the workshop inside Splunk, with no slide deck and no separate lab portal. Large Room display mode and the colour-scheme picker exist for that job.

Self-paced use of the same app is supported. It is not the primary user.

## Product Purpose

Splunk4Champions is an interactive, hands-on Splunk workshop delivered as a Splunk app. Participants follow labs in a React UI embedded in Splunk.

Success is two-sided: the participant leaves able to explain Splunk behavior and build reliable content other people can use, and the trainer can run the class from the app.

## Positioning

The labs run inside Splunk itself, on curated `s4c_*` sample data shipped with the app. A class does not depend on a separate portal, a slide deck, or customer production data.

## Operating Context

Opened from Splunk Web at `/app/splunk4champions2/lab`. The locale segment varies by environment (`en-GB`, `en-US`, `de-DE`).

Recommended delivery flow:

1. Settings — shared UI preferences before deeper labs.
2. Data — storage and architecture before search performance.
3. Search — SPL (incl. SPL2), MCP, Job Inspector, terms, `tstats`, investigation lab, Search Quiz last.
4. Dashboard Studio — six pages: Overview, Chain Searches, Token Kitchen, Image Upload, Custom Viz exercise, Sharing.
5. Champion Quiz — timed recap to close the session.

Legacy — not part of the recommended live flow, grouped behind one tab: Metrics, XML Dashboards, and Mobile and Spacebridge. Those chapters are unnumbered so the live path stays 1–5. The tab is named Legacy because these labs are off the current teaching path.

Setup — Health Check, Large Room display mode, and the colour-scheme picker (Blue / Navy, Brown / Dark Red, Blue / Yellow, Pink / Orange) — stays the last tab. Those controls are on the Setup page, and the colour scheme is visible there. The tab is not called Settings, because chapter 1 already is.

Embedded search bars run against the host Splunk instance. Chapter quizzes plus the Champion Quiz are part of the session, not a separate product.

Editable collateral sits beside the app: `SPLUNK4CHAMPIONS_HANDOUT_2026.md` and `SPLUNK4CHAMPIONS_FLYER_2026.md`.

## Capabilities and Constraints

The app id is `splunk4champions2` (label: Splunk4Champions Workshop). Current package version is `2.16.0`. Content is MDX labs wired through `src/web/workshop/workshop.js`, compiled into a Splunk app with a Python 3 backend.

The 2.16.0 UI stack uses React 18.3.1, Splunk React UI 5.18.0, Search 8.0.0, and Dashboard framework 29.9.0. Development requires Node.js 22+; styled-components stays on 5.3.11 to satisfy the supported peer ranges.

Participant feedback is explicit: clipboard results use persistent, dismissible inline messages; lessons expose loading and retry states; Health Check distinguishes missing or empty data from access, session, network, and timeout failures. Token Kitchen provides both a simplified in-page preview and a link to the real Studio dashboard (`ch6_ds_token_kitchen`). Navigation tabs scroll without compressing their labels on narrow screens.

Release validation: 11 component regression tests and a production build passed, with local smoke checks on Splunk Enterprise 10.6.0.5. Older Splunk versions and Splunk Cloud were not validated with this UI upgrade.

Chapters: 1 Settings, 2 Data, 3 Search, 4 Dashboard Studio, 5 Champion Quiz as the live path; Metrics, XML Dashboards, and Mobile grouped under one "Legacy" tab; Setup (health check, Large Room, colour scheme) pinned at the end. Dashboard Studio is Overview, Chain Searches, Token Kitchen, Image Upload, Custom Viz, and Sharing.

Binding constraints:

- It stays a Splunk app: the React UI is embedded in Splunk Web, not a standalone site.
- Labs use the bundled `s4c_*` sample datasets, not customer or production data.
- Not intended for production systems. No warranty. Content is provided as-is.
- Workshop content stays English. User language and locale are a lab topic, not a translated UI.
- The custom visualization exercise uses `@splunk/dashboard-studio-extension` and requires Splunk Enterprise 10.4+ or an equivalent Splunk Cloud release. Do not infer support for older Splunk versions from the rest of the workshop content.

Sample indexes the labs depend on: `s4c_stock_indices`, `s4c_meteo_historic`, `s4c_meteo`, `s4c_meteo_metrics`, `s4c_student_metrics` (filled by participants via `mcollect`), `s4c_weather`, `s4c_tutorial`, `s4c_www`, and optional `s4c_phyphox` / `s4c_phyphox_metrics`. Phyphox HEC tokens are created per environment; the app does not ship them.

## Brand Commitments

- **Name:** Splunk4Champions. In-app label: Splunk4Champions Workshop.
- **Mark:** champignon (mushroom) logos, light and dark, at `src/package/appserver/static/images/champignon_schwarz_trans_150x150.png` and `champignon_weiss_trans_150x150.png`.
- **Voice:** practical and instructional. Teach the mechanism, then the lab. Credit public sources; do not claim outcomes the workshop does not guarantee.
- **Origin:** created in 2020 by Tomas Baublys and Andreas Greeske. Maintained by Tomas Baublys.

## Evidence on Hand

- Public product copy: `README.md` and in-app `src/web/workshop/chapter0/readme.mdx`.
- Lab map: `src/web/workshop/workshop.js`.
- Credits and source acknowledgements: `src/web/workshop/chapter0/credits.mdx`.
- Participant handout and one-page flyer: `SPLUNK4CHAMPIONS_HANDOUT_2026.md`, `SPLUNK4CHAMPIONS_FLYER_2026.md`.
- Releases: https://github.com/bautt/splunk4champions2/releases/
- Also listed on Splunk Show when the reader has access to show.splunk.com.

Do not fabricate testimonials, customer counts, certification claims, benchmarks, pricing, or licensing terms. None of those are in the product record.

## Product Principles

1. The participant's lab task comes first, and the trainer's ability to run the class from the same app is a first-class job.
2. Teach inside Splunk, on curated sample data, so a session never needs production data, slides, or a separate portal.
3. Success is two-sided: the participant can champion the platform for other people, and the trainer can run the session from the app.
4. Keep workshop prose in English. Language and locale are something the labs teach, not a translated product surface.
5. This is a workshop, not a production system. Ship it as-is, and do not point labs at customer data.
