import React, { useState } from 'react';
import Link from '@splunk/react-ui/Link';

/**
 * Embeds a Splunk dashboard (Classic XML or Dashboard Studio) in an iframe.
 *
 * Props:
 *   dashboard  - view name, e.g. "feature_tabbed"
 *   embed      - (optional) set true for Classic XML dashboards with embed="enabled"
 *                to use the /embed/ URL; default false (uses /app/ URL which works
 *                for Dashboard Studio v2 and requires the user to be logged in)
 *   panelId    - (optional) panel id for Classic single-panel embed
 *   height     - iframe height, default "500px"
 *   app        - Splunk app context, default "splunk4champions2"
 */
export default function SplunkPanel({ dashboard, embed = false, panelId, height = '500px', app = 'splunk4champions2' }) {
    const [loaded, setLoaded] = useState(false);

    // Derive locale from the current URL so the component works on any locale setting
    const locale = typeof window !== 'undefined'
        ? window.location.pathname.split('/')[1]
        : 'en-GB';

    const query = panelId ? `?panelId=${encodeURIComponent(panelId)}` : '';
    // Classic XML dashboards with embed="enabled" can use the /embed/ URL (no login needed).
    // Dashboard Studio v2 dashboards do not support /embed/ — use the regular /app/ URL instead.
    const iframeUrl = embed
        ? `/${locale}/embed/${app}/${dashboard}${query}`
        : `/${locale}/app/${app}/${dashboard}${query}`;
    const fullUrl  = `/${locale}/app/${app}/${dashboard}`;

    return (
        <div style={{ marginBottom: '16px' }}>
            {!loaded && (
                <div style={{
                    width: '100%',
                    height: height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    border: '1px solid #c3cbd4',
                    backgroundColor: '#f2f4f5',
                    color: '#6c737a',
                    fontSize: '13px',
                    fontStyle: 'italic',
                }}>
                    Loading dashboard…
                </div>
            )}
            <iframe
                src={iframeUrl}
                width="100%"
                height={height}
                onLoad={() => setLoaded(true)}
                style={{
                    display: loaded ? 'block' : 'none',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                }}
            />
            <div style={{ marginTop: '5px', textAlign: 'right', fontSize: '12px' }}>
                <Link to={fullUrl} openInNewContext>Open full dashboard →</Link>
            </div>
        </div>
    );
}
