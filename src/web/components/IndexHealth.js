import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '@splunk/react-ui/Button';
import Message from '@splunk/react-ui/Message';

const INDEXES = [
    { name: 's4c_weather',       label: 'Weather Events',   type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/current*' },
    { name: 's4c_stock_indices', label: 'Stock indices',    type: 'event',  inputType: 'script',  input: 'Scripts: `update_stock_indices.py` (daily) — 9 major indices, ~10y history via Yahoo chart; state: `static/stock_indices_history.csv` — `_time` = epoch sec' },
    { name: 's4c_www',           label: 'Web Server Logs',  type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/www*' },
    { name: 's4c_tutorial',      label: 'Tutorial Data',    type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/tutorialdata.zip' },
    { name: 's4c_meteo',         label: 'Meteo Events',     type: 'event',  inputType: 'script',  input: 'Settings → Data Inputs → Scripts → open_meteo_weather.py events (runs every 5 min)' },
    { name: 's4c_meteo_metrics', label: 'Meteo Metrics',    type: 'metric', inputType: 'mcollect',input: 'Run the mcollect search in Legacy → Metrics → Metrics Lab to push data from s4c_meteo into this index' },
    { name: 's4c_meteo_historic',label: 'Historic Weather', type: 'event',  inputType: 'mixed',  input: 'Monitor: .../static/meteo_historic.csv | Daily: `update_meteo_historic_csv.py` (7 cities; `inputlookup` via lookups symlink) | Open-Meteo archive extends dates' },
];

function parseTime(ts) {
    if (ts === null || ts === undefined || ts === '') return null;
    const n = parseFloat(ts);
    if (!isNaN(n) && n > 946684800) return n;
    const d = new Date(ts);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 2000) return d.getTime() / 1000;
    return null;
}

function formatDate(ts) {
    const n = parseTime(ts);
    if (n === null) return '—';
    return new Date(n * 1000).toISOString().slice(0, 10);
}

function formatRelative(ts) {
    const n = parseTime(ts);
    if (n === null) return '—';
    const diffSec = Math.floor(Date.now() / 1000) - n;
    if (diffSec < 0)        return 'just now';
    if (diffSec < 60)       return `${diffSec}s ago`;
    if (diffSec < 3600)     return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400)    return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}d ago`;
    if (diffSec < 86400 * 365) return `${Math.floor(diffSec / (86400 * 30))}mo ago`;
    return `${Math.floor(diffSec / (86400 * 365))}y ago`;
}

function formatCount(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString();
}

async function fetchHealthContent(url, allowMissing = false) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
        let res;
        try {
            res = await fetch(url, { credentials: 'include', signal: controller.signal });
        } catch (error) {
            if (controller.signal.aborted) {
                throw new Error('Connection timed out. Check that Splunk is reachable, then refresh.');
            }
            throw new Error(`Connection failed. Check your network and Splunk availability, then refresh. ${error.message}`);
        }
        if (res.status === 404 && allowMissing) return null;
        if (res.status === 401) {
            throw new Error('Session expired (HTTP 401). Sign in to Splunk again, then refresh.');
        }
        if (res.status === 403) {
            throw new Error('Permission denied (HTTP 403). Ask your trainer or administrator to check your access.');
        }
        if (!res.ok) {
            throw new Error(`Splunk API error (HTTP ${res.status}). Ask your trainer to check Splunk, then refresh.`);
        }
        let json;
        try {
            json = await res.json();
        } catch (error) {
            throw new Error('Could not read the Splunk API response. Check your session and connection, then refresh.');
        }
        const content = json?.entry?.[0]?.content;
        if (!content || typeof content !== 'object' || Array.isArray(content)) {
            throw new Error('Splunk returned an unexpected API response. Ask your trainer to check the endpoint.');
        }
        return content;
    } finally {
        clearTimeout(timeout);
    }
}

export async function fetchIndexInfo(locale, indexName) {
    const url = `/${locale}/splunkd/__raw/services/data/indexes/${indexName}?output_mode=json`;
    const content = await fetchHealthContent(url, true);
    if (content === null) {
        return { exists: false, count: null, minTime: null, maxTime: null, hasData: false };
    }
    const rawCount = content.totalEventCount;
    const count = Number(rawCount);
    if ((typeof rawCount !== 'string' && typeof rawCount !== 'number') ||
        String(rawCount).trim() === '' || !Number.isInteger(count) || count < 0) {
        throw new Error('Splunk returned an invalid event count. Ask your trainer to check the index endpoint.');
    }
    const minTime = content.minTime;
    const maxTime = content.maxTime;
    const hasData = count > 0;
    return { exists: true, count, minTime, maxTime, hasData };
}

export async function fetchVersions(locale) {
    const endpoints = [
        { key: 'splunkVersion', label: 'Splunk version', path: 'server/info' },
        { key: 'appVersion', label: 'App version', path: 'apps/local/splunk4champions2' },
    ];
    const results = await Promise.all(endpoints.map(async ({ key, label, path }) => {
        try {
            const content = await fetchHealthContent(`/${locale}/splunkd/__raw/services/${path}?output_mode=json`);
            if (typeof content.version !== 'string' || !content.version.trim()) {
                throw new Error('Splunk returned an invalid version response. Ask your trainer to check the endpoint.');
            }
            return { key, value: content.version };
        } catch (error) {
            return { key, value: 'Unavailable', error: `${label}: ${error.message}` };
        }
    }));
    return {
        ...Object.fromEntries(results.map(({ key, value }) => [key, value])),
        errors: results.filter(({ error }) => error).map(({ error }) => error),
    };
}

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
    headerBg:      '#1e4d2b',
    headerText:    '#ffffff',
    subHeaderBg:   '#d4edda',
    subHeaderText: '#1e4d2b',
    rowBase:       '#ffffff',
    rowAlt:        '#f2faf4',
    borderColor:   '#a8d5b5',

    ok:      { bg: '#d4edda', border: '#5cb85c', text: '#1a5c2a', dot: '#28a745', label: 'OK'       },
    nodata:  { bg: '#fff3e0', border: '#ffa726', text: '#e65100', dot: '#ff9800', label: 'No data'  },
    missing: { bg: '#fde8e8', border: '#e57373', text: '#b71c1c', dot: '#e53935', label: 'Missing'  },
    wait:    { bg: '#f5f5f5', border: '#ccc',    text: '#888',    dot: '#ccc',    label: '…'        },

    badgeBlueBg:    '#e3f2fd', badgeBlueText:    '#0d47a1',
    badgeGreenBg:   '#e8f5e9', badgeGreenText:   '#1b5e20',

    hintMissingBg:  '#fde8e8', hintMissingBorder: '#e57373', hintMissingText: '#b71c1c',
    hintNodataBg:   '#fff3e0', hintNodataBorder:  '#ffa726', hintNodataText:  '#e65100',
};

function statusColors(s, loading) {
    if (loading && !s) return C.wait;
    if (!s)            return C.wait;
    if (s.error)       return C.missing;
    if (!s.exists)     return C.missing;
    if (!s.hasData)    return C.nodata;
    return C.ok;
}

// ── Hints panel ───────────────────────────────────────────────────────────────
function HintsPanel({ statuses, versionErrors }) {
    const missing = INDEXES.filter(idx => {
        const s = statuses[idx.name];
        return s && !s.exists && !s.error;
    });
    const nodata = INDEXES.filter(idx => {
        const s = statuses[idx.name];
        return s && s.exists && !s.hasData && !s.error;
    });

    const failed = INDEXES.filter(idx => statuses[idx.name]?.error);

    if (missing.length === 0 && nodata.length === 0 && failed.length === 0 && versionErrors.length === 0) return null;

    return (
        <div style={{ borderTop: `1px solid ${C.borderColor}` }}>
            {(failed.length > 0 || versionErrors.length > 0) && (
                <Message type="error" role="alert">
                    <strong>Some checks could not be completed. This does not mean an index is missing.</strong>
                    <ul>
                        {versionErrors.map(error => <li key={error}>{error}</li>)}
                        {failed.map(idx => (
                            <li key={idx.name}><code>{idx.name}</code>: {statuses[idx.name].error}</li>
                        ))}
                    </ul>
                    After resolving the issue, select Refresh to retry.
                </Message>
            )}
            {missing.length > 0 && (
                <div style={{
                    padding: '10px 14px',
                    backgroundColor: C.hintMissingBg,
                    borderLeft: `4px solid ${C.hintMissingBorder}`,
                }}>
                    <div style={{ fontWeight: 700, color: C.hintMissingText, marginBottom: 6, fontSize: 12 }}>
                        ✗ Index not found or not visible to your account (HTTP 404)
                    </div>
                    <div style={{ fontSize: 11, color: '#444', marginBottom: 4 }}>
                        Ask your trainer or administrator to confirm these indexes are missing, then create them under <strong>Settings → Data → Indexes → New Index</strong> if needed:
                    </div>
                    <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: 11, color: '#333' }}>
                        {missing.map(idx => (
                            <li key={idx.name} style={{ marginBottom: 4 }}>
                                <code style={{ fontWeight: 700 }}>{idx.name}</code>
                                {' '}({idx.label}, type: {idx.type})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {nodata.length > 0 && (
                <div style={{
                    padding: '10px 14px',
                    backgroundColor: C.hintNodataBg,
                    borderLeft: `4px solid ${C.hintNodataBorder}`,
                }}>
                    <div style={{ fontWeight: 700, color: C.hintNodataText, marginBottom: 6, fontSize: 12 }}>
                        ⚠ Index exists but has no data — follow its data-source hint
                    </div>
                    <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: 11, color: '#333' }}>
                        {nodata.map(idx => (
                            <li key={idx.name} style={{ marginBottom: 6 }}>
                                <code style={{ fontWeight: 700 }}>{idx.name}</code>
                                {' — '}{idx.input}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IndexHealth() {
    const [statuses,  setStatuses]  = useState({});
    const [versions,  setVersions]  = useState({ splunkVersion: '…', appVersion: '…' });
    const [loading,   setLoading]   = useState(true);
    const [checkedAt, setCheckedAt] = useState(null);
    const [versionErrors, setVersionErrors] = useState([]);
    const checkId = useRef(0);

    const check = useCallback(() => {
        const currentCheck = ++checkId.current;
        setLoading(true);
        setStatuses({});
        setVersions({ splunkVersion: '…', appVersion: '…' });
        setVersionErrors([]);
        const locale = typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : 'en-GB';

        Promise.all([
            fetchVersions(locale),
            ...INDEXES.map(idx =>
                fetchIndexInfo(locale, idx.name)
                    .then(info => ({ name: idx.name, ...info, error: null }))
                    .catch(e   => ({ name: idx.name, exists: null, count: null, minTime: null, maxTime: null, hasData: null, error: e.message }))
            ),
        ]).then(([vers, ...results]) => {
            if (currentCheck !== checkId.current) return;
            const map = {};
            results.forEach(r => { map[r.name] = r; });
            setVersions(vers);
            setVersionErrors(vers.errors);
            setStatuses(map);
            setCheckedAt(new Date().toLocaleTimeString());
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        check();
        return () => { checkId.current += 1; };
    }, [check]);

    const allOk = !loading && versionErrors.length === 0 && INDEXES.every(idx => statuses[idx.name]?.hasData);

    return (
        <div
            className="s4c-index-health"
            aria-label="Workshop health check"
            aria-busy={loading}
            style={{
            marginBottom: '24px',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            border: `1px solid ${C.borderColor}`,
            fontFamily: 'sans-serif',
        }}>
            {/* ── Header ── */}
            <div style={{
                backgroundColor: C.headerBg,
                color: C.headerText,
                padding: '10px 12px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px 12px',
            }}>
                <span style={{ fontSize: '16px', fontWeight: 700, flexGrow: 1, letterSpacing: '0.4px' }}>
                    Health Check
                </span>
                <span style={{ fontSize: '11px', opacity: 0.85 }}>
                    Splunk&nbsp;
                    <span style={{ fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '8px' }}>
                        {versions.splunkVersion}
                    </span>
                </span>
                <span style={{ fontSize: '11px', opacity: 0.85 }}>
                    App&nbsp;
                    <span style={{ fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 6px', borderRadius: '8px' }}>
                        {versions.appVersion}
                    </span>
                </span>
                <span role="status" aria-live="polite">
                {loading ? 'Checking workshop health...' : (
                    <span style={{
                        backgroundColor: allOk ? '#28a745' : '#e53935',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '20px',
                        letterSpacing: '0.4px',
                    }}>
                        {allOk ? 'ALL OK' : 'NEEDS ATTENTION'}
                    </span>
                )}
                </span>
                <Button onClick={check} disabled={loading} appearance="secondary"
                    label={loading ? 'Checking…' : 'Refresh'}
                    style={{ color: '#ffffff', borderColor: '#ffffff', fontSize: '12px' }} />
                {checkedAt && !loading && (
                    <span style={{ fontSize: '11px', opacity: 0.65 }}>checked {checkedAt}</span>
                )}
            </div>

            {/* ── Table (scrolls horizontally if needed; font sizes in workshop.css) ── */}
            <div className="s4c-index-health__scroll" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ backgroundColor: C.subHeaderBg }}>
                        {['Index', 'Label', 'Type', 'Index exists', 'Has data', 'Oldest event', 'Latest event', 'Count'].map((h, i) => (
                            <th key={h} style={{
                                padding: '6px 8px',
                                fontWeight: 700,
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: C.subHeaderText,
                                textAlign: i >= 5 ? 'right' : i >= 3 ? 'center' : 'left',
                                borderBottom: `2px solid ${C.borderColor}`,
                                whiteSpace: 'nowrap',
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {INDEXES.map((idx, i) => {
                        const s       = statuses[idx.name];
                        const loading_ = loading && !s;
                        const exists  = !loading_ && s && s.exists && !s.error;
                        const hasData = !loading_ && s && s.hasData;

                        const existsC = loading_ ? C.wait : (exists ? C.ok : C.missing);
                        const dataC   = loading_ ? C.wait : (!exists ? C.wait : (hasData ? C.ok : C.nodata));

                        return (
                            <tr key={idx.name} style={{
                                backgroundColor: i % 2 === 0 ? C.rowBase : C.rowAlt,
                                borderBottom: `1px solid ${C.borderColor}`,
                            }}>
                                <td style={{ padding: '5px 8px', fontFamily: 'monospace', fontWeight: 700, fontSize: '11px', color: '#1e4d2b' }}>
                                    {idx.name}
                                </td>
                                <td style={{ padding: '5px 8px', color: '#37474f', fontWeight: 500, fontSize: '11px' }}>
                                    {idx.label}
                                </td>
                                <td style={{ padding: '5px 8px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '1px 6px',
                                        borderRadius: '10px',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        letterSpacing: '0.3px',
                                        textTransform: 'uppercase',
                                        backgroundColor: idx.type === 'metric' ? C.badgeBlueBg  : C.badgeGreenBg,
                                        color:           idx.type === 'metric' ? C.badgeBlueText : C.badgeGreenText,
                                    }}>
                                        {idx.type}
                                    </span>
                                </td>

                                {/* Index exists */}
                                <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                                    <StatusBadge loading={loading_} colors={existsC} label={loading_ ? '…' : (s?.error ? 'Check failed' : (exists ? 'Yes' : 'Not found'))} />
                                </td>

                                {/* Has data */}
                                <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                                    <StatusBadge loading={loading_} colors={dataC}
                                        label={loading_ ? '…' : (!exists ? '—' : (hasData ? 'Yes' : 'Empty'))} />
                                </td>

                                <td style={{ padding: '5px 8px', textAlign: 'right', color: '#4a7c59', fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: '11px' }}>
                                    {s ? formatDate(s.minTime) : '…'}
                                </td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', color: '#4a7c59', fontVariantNumeric: 'tabular-nums', fontWeight: 500, fontSize: '11px' }}>
                                    {s ? formatRelative(s.maxTime) : '…'}
                                </td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', color: '#1e4d2b', fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: '11px' }}>
                                    {s ? formatCount(s.count) : '…'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            </div>

            {/* ── Hints ── */}
            {!loading && <HintsPanel statuses={statuses} versionErrors={versionErrors} />}
        </div>
    );
}

function StatusBadge({ loading, colors, label }) {
    if (loading) return <span style={{ color: '#bbb', fontSize: '14px' }}>…</span>;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '20px',
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontWeight: 700,
            fontSize: '11px',
        }}>
            <span style={{
                width: '7px', height: '7px',
                borderRadius: '50%',
                backgroundColor: colors.dot,
                flexShrink: 0,
            }} />
            {label}
        </span>
    );
}
