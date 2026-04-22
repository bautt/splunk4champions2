import React, { useState, useEffect, useCallback } from 'react';
import Button from '@splunk/react-ui/Button';

const INDEXES = [
    { name: 's4c_weather',       label: 'Weather Events',   type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/current*' },
    { name: 's4c_stocks',        label: 'Stocks',           type: 'event',  inputType: 'monitor', input: 'One-shot monitor: .../static/stocks_history.csv (disabled in default; enable once for CSV baseline) & gdax_download* | Scripts → update_stocks.py (daily JSON + CSV append)' },
    { name: 's4c_www',           label: 'Web Server Logs',  type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/www*' },
    { name: 's4c_tutorial',      label: 'Tutorial Data',    type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/tutorialdata.zip' },
    { name: 's4c_meteo',         label: 'Meteo Events',     type: 'event',  inputType: 'script',  input: 'Settings → Data Inputs → Scripts → open_meteo_weather.py events (runs every 5 min)' },
    { name: 's4c_meteo_metrics', label: 'Meteo Metrics',    type: 'metric', inputType: 'mcollect',input: 'Run the mcollect search in Chapter 4 → Metrics Lab to push data from s4c_meteo into this index' },
    { name: 's4c_meteo_historic',label: 'Historic Weather', type: 'event',  inputType: 'monitor', input: 'Settings → Data Inputs → Files & Directories → monitor: .../static/meteo_historic.csv' },
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

// Returns { exists, count, minTime, maxTime, hasData }
// exists=false when Splunk returns 404 (index not created yet)
async function fetchIndexInfo(locale, indexName) {
    const url = `/${locale}/splunkd/__raw/services/data/indexes/${indexName}?output_mode=json`;
    const res = await fetch(url, { credentials: 'include' });
    if (res.status === 404) {
        return { exists: false, count: 0, minTime: null, maxTime: null, hasData: false };
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const content = json.entry?.[0]?.content ?? {};
    const count   = parseInt(content.totalEventCount ?? '0', 10);
    const minTime = content.minTime;
    const maxTime = content.maxTime;
    const hasData = count > 0 && parseTime(minTime) !== null;
    return { exists: true, count, minTime, maxTime, hasData };
}

async function fetchVersions(locale) {
    const [splunkRes, appRes] = await Promise.all([
        fetch(`/${locale}/splunkd/__raw/services/server/info?output_mode=json`,                  { credentials: 'include' }),
        fetch(`/${locale}/splunkd/__raw/services/apps/local/splunk4champions2?output_mode=json`, { credentials: 'include' }),
    ]);
    const splunkJson = splunkRes.ok ? await splunkRes.json() : null;
    const appJson    = appRes.ok   ? await appRes.json()    : null;
    return {
        splunkVersion: splunkJson?.entry?.[0]?.content?.version ?? '—',
        appVersion:    appJson?.entry?.[0]?.content?.version    ?? '—',
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
function HintsPanel({ statuses }) {
    const missing = INDEXES.filter(idx => {
        const s = statuses[idx.name];
        return s && (!s.exists || s.error);
    });
    const nodata = INDEXES.filter(idx => {
        const s = statuses[idx.name];
        return s && s.exists && !s.hasData && !s.error;
    });

    if (missing.length === 0 && nodata.length === 0) return null;

    return (
        <div style={{ borderTop: `1px solid ${C.borderColor}` }}>
            {missing.length > 0 && (
                <div style={{
                    padding: '14px 20px',
                    backgroundColor: C.hintMissingBg,
                    borderLeft: `4px solid ${C.hintMissingBorder}`,
                }}>
                    <div style={{ fontWeight: 700, color: C.hintMissingText, marginBottom: 8, fontSize: 13 }}>
                        ✗ Index not found — create the following indexes first
                    </div>
                    <div style={{ fontSize: 12, color: '#444', marginBottom: 6 }}>
                        Go to <strong>Settings → Data → Indexes → New Index</strong> and create:
                    </div>
                    <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: 12, color: '#333' }}>
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
                    padding: '14px 20px',
                    backgroundColor: C.hintNodataBg,
                    borderLeft: `4px solid ${C.hintNodataBorder}`,
                }}>
                    <div style={{ fontWeight: 700, color: C.hintNodataText, marginBottom: 8, fontSize: 13 }}>
                        ⚠ Index exists but has no data — enable the data input
                    </div>
                    <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: 12, color: '#333' }}>
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

    const check = useCallback(() => {
        setLoading(true);
        const locale = typeof window !== 'undefined'
            ? window.location.pathname.split('/')[1]
            : 'en-GB';

        Promise.all([
            fetchVersions(locale),
            ...INDEXES.map(idx =>
                fetchIndexInfo(locale, idx.name)
                    .then(info => ({ name: idx.name, ...info, error: null }))
                    .catch(e   => ({ name: idx.name, exists: false, count: 0, minTime: null, maxTime: null, hasData: false, error: String(e) }))
            ),
        ]).then(([vers, ...results]) => {
            const map = {};
            results.forEach(r => { map[r.name] = r; });
            setVersions(vers);
            setStatuses(map);
            setCheckedAt(new Date().toLocaleTimeString());
            setLoading(false);
        });
    }, []);

    useEffect(() => { check(); }, [check]);

    const allOk = !loading && INDEXES.every(idx => statuses[idx.name]?.hasData);

    return (
        <div style={{
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
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
            }}>
                <span style={{ fontSize: '20px', fontWeight: 700, flexGrow: 1, letterSpacing: '0.4px' }}>
                    Health Check
                </span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    Splunk&nbsp;
                    <span style={{ fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                        {versions.splunkVersion}
                    </span>
                </span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    App&nbsp;
                    <span style={{ fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                        {versions.appVersion}
                    </span>
                </span>
                {!loading && (
                    <span style={{
                        backgroundColor: allOk ? '#28a745' : '#e53935',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        padding: '4px 16px',
                        borderRadius: '20px',
                        letterSpacing: '0.6px',
                    }}>
                        {allOk ? 'ALL OK' : 'NEEDS ATTENTION'}
                    </span>
                )}
                <Button onClick={check} disabled={loading} appearance="secondary"
                    label={loading ? 'Checking…' : 'Refresh'}
                    style={{ color: '#ffffff', borderColor: '#ffffff' }} />
                {checkedAt && !loading && (
                    <span style={{ fontSize: '12px', opacity: 0.65 }}>checked {checkedAt}</span>
                )}
            </div>

            {/* ── Table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: C.subHeaderBg }}>
                        {['Index', 'Label', 'Type', 'Index exists', 'Has data', 'Oldest event', 'Latest event', 'Count'].map((h, i) => (
                            <th key={h} style={{
                                padding: '10px 16px',
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.7px',
                                color: C.subHeaderText,
                                textAlign: i >= 5 ? 'right' : i >= 3 ? 'center' : 'left',
                                borderBottom: `2px solid ${C.borderColor}`,
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
                                <td style={{ padding: '11px 16px', fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#1e4d2b' }}>
                                    {idx.name}
                                </td>
                                <td style={{ padding: '11px 16px', color: '#37474f', fontWeight: 500 }}>
                                    {idx.label}
                                </td>
                                <td style={{ padding: '11px 16px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '2px 10px',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 700,
                                        letterSpacing: '0.4px',
                                        textTransform: 'uppercase',
                                        backgroundColor: idx.type === 'metric' ? C.badgeBlueBg  : C.badgeGreenBg,
                                        color:           idx.type === 'metric' ? C.badgeBlueText : C.badgeGreenText,
                                    }}>
                                        {idx.type}
                                    </span>
                                </td>

                                {/* Index exists */}
                                <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                                    <StatusBadge loading={loading_} colors={existsC} label={loading_ ? '…' : (exists ? 'Yes' : 'No')} />
                                </td>

                                {/* Has data */}
                                <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                                    <StatusBadge loading={loading_} colors={dataC}
                                        label={loading_ ? '…' : (!exists ? '—' : (hasData ? 'Yes' : 'Empty'))} />
                                </td>

                                <td style={{ padding: '11px 16px', textAlign: 'right', color: '#4a7c59', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                                    {s ? formatDate(s.minTime) : '…'}
                                </td>
                                <td style={{ padding: '11px 16px', textAlign: 'right', color: '#4a7c59', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                                    {s ? formatRelative(s.maxTime) : '…'}
                                </td>
                                <td style={{ padding: '11px 16px', textAlign: 'right', color: '#1e4d2b', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                                    {s ? formatCount(s.count) : '…'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* ── Hints ── */}
            {!loading && <HintsPanel statuses={statuses} />}
        </div>
    );
}

function StatusBadge({ loading, colors, label }) {
    if (loading) return <span style={{ color: '#bbb', fontSize: '18px' }}>…</span>;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '20px',
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontWeight: 700,
            fontSize: '13px',
        }}>
            <span style={{
                width: '9px', height: '9px',
                borderRadius: '50%',
                backgroundColor: colors.dot,
                flexShrink: 0,
            }} />
            {label}
        </span>
    );
}
