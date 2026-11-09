  ![](https://github.com/bautt/splunk4champions2/raw/main/src/package/static/appIcon_2x.png) 

# Splunk4Champions 2.0 -> _Splunk SE Workshop for advanced users_

**Current app version: 2.16.0**

### What's new in 2.16.0

- React 18.3.1, Splunk React UI 5.18.0, Search 8.0.0, and Dashboard framework 29.9.0.
- Persistent, dismissible inline clipboard messages replace deprecated toasts.
- Clear Health Check diagnostics for session, permission, network, and timeout failures.
- Visible lesson loading states and retry controls.
- Horizontally scrollable navigation without overlapping tab labels on narrow screens.
- Token Kitchen links from its simplified preview to the real Dashboard Studio dashboard.
- Patched vulnerable transitive dependencies; the unused root npm lockfile was removed.

See the [release notes](https://github.com/bautt/splunk4champions2/blob/main/WHATS_NEW.md)
for details.

## This is a complete re-design from https://github.com/bautt/splunk4champions training 
## 
This repository houses a new version of the Splunk4Champions workshop. The content management has been redesigned to work with React.js, Splunk UI and MDX files.

Splunk4Champions is  a session for more experienced Splunk users (champions) who are still willing to learn some new tricks and get deeper understanding of how Splunk search works.
We want to share hints & tricks on how to use Splunk searches more efficiently and also provide some underlying theory for that. This is an interactive hands-on workshop which will require your participation and also provide your dozens of follow-up links to find more information. 

### Target audience: 
Advanced Splunk users 
Splunk admins

### Content:
- 1 Settings: GUI options, search modes, Search Assistant, AI Assistant
- 2 Data: how Splunk stores data
- 3 Search: Job Inspector, SPL performance, SPL2, optional MCP
- 4 Dashboard Studio: chain searches, token kitchen, images, custom viz, sharing
- 5 Champion Quiz
- Legacy: Metrics, XML Dashboards, Mobile
- Setup: health check, Large Room, colour scheme



### Benefit:
- Sustainable and energy saving usage of Splunk
- New insights and inspiration

### Design Goals: 
Zero-Powerpoint: all information needed is included in the app

## Download and installation:
Download the latest release from https://github.com/bautt/splunk4champions2/releases/
and install it as a standard Splunk app. It is not intended for production systems
and is provided without warranty.

For version 2.16.0, download `splunk4champions2-2.16.0.tar.gz` from
https://github.com/bautt/splunk4champions2/releases/tag/v2.16.0. In Splunk Web,
select **Apps → Manage Apps → Install app from file**, follow the prompts, and
restart Splunk if prompted. Check **Setup → Health Check** before the workshop.

This release is for **Splunk Enterprise only**, not Splunk Cloud. Version 2.16.0
was smoke-tested locally on Splunk Enterprise 10.6.0.5; older Splunk releases
were not validated with the upgraded UI stack. The custom visualization exercise
requires Splunk Enterprise 10.4+.



# Development readme:
## Setting up the Development Environment

Use Node.js 22+ and Yarn 1.22. The UI stack uses React 18 and styled-components
5.3.11; do not independently upgrade to React 19 or styled-components 6.
The [development README](https://github.com/bautt/splunk4champions2/blob/main/README_development.md)
lists the supported dependency versions and local validation steps.

Clone the repository to your local workstation
```
git clone https://github.com/bautt/splunk4champions2
```

Install the required dependencies
```
make deps
```

Run the component regression tests with `yarn --cwd src test` and validate the
production bundle and MDX with `yarn --cwd src build`. Version 2.16.0 passed all
13 regression tests and the production build, with non-blocking MapLibre and
bundle-size warnings.

Run the development task. This will build a development version of the app in the `dist` folder.
```
make dev
```

During development, you can use `ln -s` to create a symlink from the `dist` folder to `$SPLUNK_HOME/etc/apps`splunk4champions2`.

To build the app, use the `package` target. This will build a production version of the app in a temporary folder and create a tar file in the repository root.
```
make package
```

### Running App Vetting locally

Create a new virtualenv with the required dependencies
```
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
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
