import React, { useEffect, useMemo, useRef, useState } from 'react';
import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';

/**
 * WorkshopViz — drop a one-panel Splunk Dashboard Studio visualization directly
 * into an MDX lab page.
 *
 * The dashboard framework is large and only used in a handful of lab pages, so
 * we load it on demand. This keeps the main workshop bundle lean and avoids
 * paying the chart-library cost on every page.
 *
 * Usage inside an .mdx file (no import needed, it is registered on the shared
 * MDX components map in Step.js):
 *
 *   <WorkshopViz
 *       spl='index=weather | timechart avg(main.temp) by city'
 *       earliest='-24h@h'
 *       latest='now'
 *       viz='line'
 *       title='Temperature by city, last 24h'
 *   />
 */

// Allowed values map 1:1 to the Dashboard Studio platform visualization keys.
const VIZ_KEYS = {
    line: 'splunk.line',
    column: 'splunk.column',
    bar: 'splunk.bar',
    area: 'splunk.area',
    table: 'splunk.table',
    singlevalue: 'splunk.singlevalue',
    pie: 'splunk.pie',
};

function buildDefinition({ spl, earliest, latest, viz, width, height, options }) {
    const vizType = VIZ_KEYS[viz] || VIZ_KEYS.line;
    return {
        dataSources: {
            ds_workshop_viz: {
                type: 'ds.search',
                options: {
                    query: spl,
                    queryParameters: {
                        earliest: earliest || '-24h@h',
                        latest: latest || 'now',
                    },
                },
            },
        },
        visualizations: {
            viz_workshop_viz: {
                type: vizType,
                dataSources: { primary: 'ds_workshop_viz' },
                options: options || {},
            },
        },
        layout: {
            type: 'absolute',
            options: { width, height },
            structure: [
                {
                    item: 'viz_workshop_viz',
                    type: 'block',
                    position: { x: 0, y: 0, w: width, h: height },
                },
            ],
        },
    };
}

function useDashboardModules() {
    // Hold the three dashboard framework pieces once resolved. We lazy-load so
    // that pages without a WorkshopViz do not download the dashboard bundle.
    const [modules, setModules] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        let cancelled = false;
        Promise.all([
            import('@splunk/dashboard-core'),
            import('@splunk/dashboard-context'),
            import('@splunk/dashboard-presets/EnterpriseViewOnlyPreset'),
        ])
            .then(([core, ctx, preset]) => {
                if (cancelled) return;
                setModules({
                    DashboardCore: core.default || core,
                    DashboardContextProvider: ctx.DashboardContextProvider,
                    preset: preset.default || preset,
                });
            })
            .catch((e) => {
                if (!cancelled) setError(e);
            });
        return () => {
            cancelled = true;
        };
    }, []);
    return { modules, error };
}

export default function WorkshopViz({
    spl,
    earliest,
    latest,
    viz = 'line',
    title,
    caption,
    height = 320,
    options,
}) {
    // Width tracks the containing lab card so the viz fills whatever room the
    // lab layout gives it.
    const frameRef = useRef(null);
    const [frameWidth, setFrameWidth] = useState(640);

    useEffect(() => {
        if (!frameRef.current) return undefined;
        const node = frameRef.current;
        const update = () => {
            const w = node.getBoundingClientRect().width;
            if (w && Math.abs(w - frameWidth) > 2) {
                setFrameWidth(Math.round(w));
            }
        };
        update();
        const ro =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(update)
                : null;
        if (ro) ro.observe(node);
        window.addEventListener('resize', update);
        return () => {
            if (ro) ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [frameWidth]);

    const definition = useMemo(
        () =>
            buildDefinition({
                spl,
                earliest,
                latest,
                viz,
                width: Math.max(320, frameWidth - 24), // minus internal padding
                height,
                options,
            }),
        [spl, earliest, latest, viz, frameWidth, height, options]
    );

    const { modules, error } = useDashboardModules();

    const vizKey = VIZ_KEYS[viz] ? viz : 'line';

    return (
        <div className="s4c-workshop-viz">
            <div className="s4c-workshop-viz__header">
                <span className="s4c-workshop-viz__title">
                    {title || `Live ${vizKey} chart`}
                </span>
                <span
                    className="s4c-workshop-viz__query"
                    title={spl}
                >
                    {spl}
                </span>
            </div>
            <div
                ref={frameRef}
                className="s4c-workshop-viz__frame"
                style={{ minHeight: height + 24 }}
            >
                {error && (
                    <div className="s4c-workshop-viz__error">
                        Could not load the dashboard framework: {String(error.message || error)}
                    </div>
                )}
                {!error && !modules && (
                    <div className="s4c-workshop-viz__loading">
                        Loading visualization…
                    </div>
                )}
                {modules && (
                    <SplunkThemeProvider family="enterprise" colorScheme="light">
                        <modules.DashboardContextProvider
                            preset={modules.preset}
                            initialDefinition={definition}
                            initialMode="view"
                        >
                            <modules.DashboardCore
                                width={Math.max(320, frameWidth - 24)}
                                height={height}
                            />
                        </modules.DashboardContextProvider>
                    </SplunkThemeProvider>
                )}
            </div>
            {caption && (
                <div className="s4c-workshop-viz__caption">{caption}</div>
            )}
        </div>
    );
}
