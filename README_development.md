# Development readme:

Current app release: **2.16.0**. Both `[launcher]` and `[id]` versions in
[`src/package/default/app.conf`](src/package/default/app.conf) define the Splunk
app version; `src/package.json` identifies the frontend build package separately.
See [release notes](WHATS_NEW.md) for the UI refresh and workshop changes.

## Setting up the Development Environment

Prework on Mac: 
```
1) install Node.js 22 or newer from https://nodejs.org/en/download
# sudo npm install --global yarn webpack  webpack-cli
```

Clone the repository to your local workstation
```
git clone https://github.com/bautt/splunk4champions2
```

Install the required dependencies
```
make deps
```

Run the development task. This will build a development version of the app in the `dist` folder.
```
make dev
```

During development, you can use `ln -s` to create a symlink from the `dist` folder to `$SPLUNK_HOME/etc/apps/`splunk4champions2`.

To build the app, use the `package` target. This will build a production version of the app in a temporary folder and create a tar file in the repository root.
```
make package
```

### Regression tests

Run `yarn --cwd src test` for the workshop feedback regression tests. These cover
Health Check diagnostics and refresh, clipboard success and failure, and lesson
loading, cancellation, and retry using React 18's test renderer. Splunk APIs and
browser APIs are mocked; no running Splunk instance is required.

Run `yarn --cwd src build` to validate the production app and MDX content. Before
release, also check Setup, search copying, and lesson navigation inside Splunk Web.

For 2.16.0, all 13 regression tests and the production build passed. Local browser
checks on Splunk Enterprise 10.6.0.5 covered Health Check, clipboard success and
dismissal, time-picker presets, all four colour schemes, Large Room, narrow-screen
tabs, the embedded Studio bar chart, the quiz landing page, and the Token Kitchen
dashboard link. This is not a full end-to-end or Cloud certification. The build
still reports MapLibre dynamic-dependency and bundle-size warnings.

The Enterprise-only [v2.16.0 release](https://github.com/bautt/splunk4champions2/releases/tag/v2.16.0)
contains `splunk4champions2-2.16.0.tar.gz`; it is not a Splunk Cloud package.
The repository's `make package`
builds `splunk4champions2.tar.gz` and replaces `dist`; avoid it when `dist`
is a live Splunk app with local configuration. Release archives must exclude
local configuration, generated caches, and credentials.

If local Splunk uses a symlink to `dist`, `yarn --cwd src build` refreshes the app
without deleting the entire app directory. Hard-refresh Splunk Web after building.

### UI dependency compatibility

The app uses React/React DOM 18.3.1 with the `@splunk/react-page/18` entry point,
Splunk React UI 5.18.0, react-page 8.4.0, themes 1.13.1, icons 5.17.0, and search 8.0.0.
The dashboard context/core/presets/state packages are aligned at 29.9.0 with
visualization-context 28.9.1. Keep styled-components on 5.3.11: React 19 and
styled-components 6 are outside this Splunk UI stack's supported peer ranges.
Themes and Splunk icons are direct dependencies because app code imports them.

Clipboard feedback uses persistent, dismissible inline Splunk UI messages rather
than the deprecated toast-notification package.

### Dependency security maintenance

`src/yarn.lock` is the authoritative dependency lockfile; the unused root npm
lockfile was removed because it retained vulnerable packages unrelated to the
Yarn build.

Security resolutions require crypto-js 4.2.0, d3-color 3.1.0, fast-uri 3.1.9+,
qs 6.16.1+, source-map-js 1.2.2+, and serialize-javascript 7.1.3+.
CryptoJS and d3-color deliberately override older transitive dependency ranges
in the Splunk cloud-auth and visualization packages. Yarn reports compatibility
warnings for those ranges; regression tests cover the cloud-auth PKCE challenge
and D3 colour interpolation, scale interpolation, and transition module loading.
Keep these checks and the embedded-chart browser smoke test when updating the
overrides. CryptoJS is deprecated upstream; this patch does not replace the
Splunk-owned authentication implementation.

### Running App Vetting locally

Create a new virtualenv with the required dependencies
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
p.s. had to add following:
````
pip uninstall python-magic
pip install python-magic-bin==0.4.14
```


Run AppInspect CLI
```
make package
make appinspect
```

For complete validation, use the [Appinspect API](https://dev.splunk.com/enterprise/docs/developapps/testvalidate/appinspect/useappinspectapi/) with Postman for release candidates.

### Docker

There is a `docker-compose.yml` provided as part of this repository.

Running the command below will install the app in a new Splunk container. Please note that the container will listen on port 8000, so ensure it's available.
```
docker-compose up -d
```

## Editing Workshop Content

### workshop.js

The overall structure of the workshop, including chapters, sections and steps is configured in `src/web/workshop/workshop.js`.
Modify this file to add new chapters, sections and steps. It's importing icons from [@splunk/react-icons](https://splunkui.splunk.com/Packages/react-icons/Usage).

The actual content is all contained in Steps, each of which has his own markdown file.

#### Chapter

Example of a chapter
```
import Settings from '@splunk/react-icons/Settings';
...

{
    "title": "1 - Settings",
    "id": "one",
    "icon": <Settings/>,
    "subtitle": "test",
    "sections" : [<Sections here...>]
}
```

#### Section

Example of a section
```
{
    "title": "Set your preferences",
    "steps": [<Steps here...>]
}
```

#### Step

Example of an individual step. The path to the `.mdx` file is relative to the `src/web/workshop` folder.
```
{
    "title": "Fast Mode",
    "content": "chapter1/fast_mode.mdx"
}
```

### Content Files

Content files are located in `src/web/workshop/**/*.mdx` and are written in [MDX](https://mdxjs.com/docs/using-mdx/) which allows to use JSX inside Markdown content.
This allows to intermix text-heavy markdown-style content with interactive elements (ie. from [Splunk UI](https://splunkui.splunk.com/))

### Useful Components for MDX

#### SplunkSearch

The `<SplunkSearch/>` component adds an interactive search bar including a time picker to prettify SPL searches. It also allows to copy the search to clipboard. 

#### Reactjs icons 
https://react-icons.github.io/react-icons/icons?name=tb
npm install react-icons --save 
