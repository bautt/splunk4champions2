# Development readme:
## Setting up the Development Environment

Prework on Mac: 
```
1) install nodejs pkg from https://nodejs.org/de/download 
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
