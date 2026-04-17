# Splunk4Champions2 — CLAUDE.md

Interactive workshop app for Splunk, delivered as a Splunk app package. Participants follow hands-on labs through a React UI embedded in Splunk.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Splunk app | Python 3, Splunk XML dashboards |
| Frontend | React 16, MDX, Splunk UI Toolkit (`@splunk/react-*`) |
| Build | Webpack 5 via `@splunk/webpack-configs`, Babel, yarn |
| Icons | `@splunk/react-icons`, `react-icons` |
| Styling | `styled-components` v5, CSS modules |
| Content | MDX (Markdown + JSX) compiled by `@mdx-js/loader` + `remark-gfm` |

## Project Structure

```
splunk4champions2/
├── src/                        # All source code
│   ├── package/                # Splunk app skeleton (copied verbatim to dist/)
│   │   ├── appserver/static/   # Static assets (images, scripts, styles)
│   │   ├── bin/                # Python custom search commands & data downloaders
│   │   ├── default/            # Splunk conf files + XML dashboard views
│   │   ├── lib/splunklib/      # Splunk Python SDK
│   │   ├── lookups/            # CSV lookup files
│   │   └── static/             # Download data files (weather logs, tutorial data)
│   ├── web/                    # React frontend (compiled → dist/)
│   │   ├── components/         # Shared React components (ChapterBar, SplunkSearch, etc.)
│   │   ├── workshop/           # Workshop content
│   │   │   ├── workshop.js     # Table of contents — chapters, sections, steps
│   │   │   ├── chapter0/       # Setup & credits
│   │   │   ├── chapter1–7/     # Lab content as .mdx files
│   │   └── index.js            # React app entry point
│   ├── webpack.config.mjs      # Webpack config (builds web/ → dist/, copies package/)
│   ├── package.json            # JS dependencies
│   └── yarn.lock
├── dist/                       # Build output — full Splunk app ready to package
├── Makefile                    # Build targets (see below)
└── splunk4champions2.tar.gz    # Deployable Splunk app tarball (git-ignored)
```

## Build & Deploy Commands

```bash
make deps       # Install JS dependencies (yarn install)
make dev        # Webpack watch mode for development
make package    # Full build → dist/ → splunk4champions2.tar.gz
make appinspect # Run Splunk AppInspect against the tarball (requires venv)
```

Deploy by copying the tarball to the Splunk server:
```bash
scp splunk4champions2.tar.gz tbaublys@v37823.1blu.de:~
```

Restart Splunk on the server after installing:
```bash
sudo systemctl restart Splunkd
```

## Coding Conventions

- **Workshop content** lives exclusively in `.mdx` files under `src/web/workshop/chapterN/`. Use `<Link>` from `@splunk/react-ui/Link` for external links and `<SplunkSearch>` for embedded search bars.
- **Table of contents** is managed in `workshop.js` — add new steps/sections there to wire up new MDX files.
- **No inline styles** in MDX — use the `width` attribute on `<img>` tags only.
- **App version** must be bumped in `src/package/default/app.conf` (`[launcher] version` and `[id] version`) on every change.
- **Python** scripts in `bin/` target Python 3 (`python.version = python3` in `app.conf`).

## Workflow Rules

1. **Always `make package` before deploying** — never copy `dist/` directly; the tarball build excludes `.DS_Store`, `__pycache__`, `*.pyc`, and `local/`.
2. **Bump the version in `app.conf`** on every change before packaging.
3. **Check links in MDX files** before release — `docs.splunk.com` URLs change frequently with new Splunk versions.
4. **Do not commit `splunk4champions2.tar.gz`** — it is git-ignored.
5. **Do not leave stale files in `/tmp/splunk4champions2/`** — `make package` cleans it automatically now, but be aware if running steps manually.
6. **Weather data** in `src/package/static/current_2026.log.gz` is real + simulated OpenWeatherMap JSON (one record per city per ~hour). Extend by shifting prior-year data forward, do not re-download live.
