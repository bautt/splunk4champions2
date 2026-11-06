# Custom visualization chapter

**App release: 2.16.0.** The embedded reference chart was smoke-tested locally
with React 18.3.1 and Dashboard framework 29.9.0 on Splunk Enterprise 10.6.0.5.
Building the workshop app requires Node.js 22+. This does not change the
participant exercise or install a finished custom visualization.

The exercise lives in **4. Dashboard Studio → Custom Viz**. The steps are stacked on that page: Goal and data, Create the project, Build the scaffold, Draw the bars, Install and open in Studio, One small LLM change, Check and show, If you get stuck, Trainer notes.

Implemented for Splunk4Champions. The German Dashboard Studio doc under `Custom_Viz_Workshop/workshop/README.md` is unchanged. The English templates in `workshop/vorlagen/` are the ones participants copy, and the same three files ship in this app.

## What changed from the first plan

- The lab is not its own chapter and not `id: viz`. It is the Custom Viz section of chapter id `six`.
- The old on-ramp page `chapter6/ds_customviz.mdx` is gone. Overview names the six Dashboard Studio pages, and the exercise itself is the Custom Viz section.
- The check step uses `BuzzQuiz`, the quiz the rest of the workshop uses. `Quiz.js` is the search A/B comparison, so it is the wrong component here.
- One generator command, with initials in the app id: `npx @splunk/create@latest --mode=dashboard-studio-extension workshop_bars_<initials>`. There is no second command to rewrite later.
- The search labels are Web, Database, and Mail, so the picture matches the English template. Numbers format with `en-US`.
- No Studio screenshot. A dry-run capture was not available, and a drawn editor would be a fake UI. The goal step uses the bar SVG plus a live `WorkshopViz`. The pipeline is an SVG of the real flow.
- Template UI strings are English. Copies live in `src/package/appserver/static/custom_viz/`. `node --test workshop/pruefen.test.js` in Custom_Viz_Workshop asserts the English messages.
- The official tutorial link is on Follow Up Links and on the install step.
- This app still does not install a finished bar viz. `custom_viz_workshop` stays reserved.

## Learner path

Goal, Scaffold, First build, Draw the bars, Install, Use an LLM, Check and show, If you get stuck, Trainer notes.

Trainer notes are last and say participants can skip them. Storybook is one sentence on the build step, not a required repair.

## Out of scope

No ECharts chapter. No install of a participant app from this repo. No edit of the German README. No tokens, passwords, or real logs in the LLM step.
