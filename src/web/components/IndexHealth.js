import React, { useState, useEffect, useCallback } from 'react';
import Button from '@splunk/react-ui/Button';

const INDEXES = [
    { name: 's4c_weather',       label: 'Weather Events',   type: 'event'  },
    { name: 's4c_stocks',        label: 'Stocks',           type: 'event'  },
    { name: 's4c_www',           label: 'Web Server Logs',  type: 'event'  },
    { name: 's4c_tutorial',      label: 'Tutorial Data',    type: 'event'  },
    { name: 's4c_meteo',         label: 'Meteo Events',     type: 'event'  },
    { name: 's4c_meteo_metrics', label: 'Meteo Metrics',    type: 'metric' },
];

// Splunk may return minTime/maxTime as Unix epoch (float) OR ISO-8601 string.
function parseTime(ts) {
    if (ts === null || ts === undefined || ts === '') return null;
    const n = parseFloat(ts);
    if (!isNaN(n) && n > 946684800) return n;           // Unix epoch seconds
    const d = new Date(ts);
    if (!isNaN(d.getTime()) && d.getFullYear() >= 2000) return d.getTime() / 1000;
    return null;
}

function formatDate(ts) {
    const n = parseTime(ts);
    if (n === null) return '—';
    return new Date(n * 1000).toISOString().slice(0, 10);
}

function formatCount(n) {
    if (n === null || n === undefined) return '—';
    return Number(n).toLocaleString();
}

async function fetchIndexInfo(locale, indexName) {
    const url = `/${locale}/splunkd/__raw/services/data/indexes/${indexName}?output_mode=json`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const content = json.entry?.[0]?.content ?? {};
    const count   = parseInt(content.totalEventCount ?? '0', 10);
    const minTime = content.minTime;
    const maxTime = content.maxTime;
    const hasData = count > 0 && parseTime(minTime) !== null;
    return { count, minTime, maxTime, hasData };
}

async function fetchVersions(locale) {
    const [splunkRes, appRes] = await Promise.all([
        fetch(`/${locale}/splunkd/__raw/services/server/info?output_mode=json`,                    { credentials: 'include' }),
        fetch(`/${locale}/splunkd/__raw/services/apps/local/splunk4champions2?output_mode=json`,   { credentials: 'include' }),
    ]);
    const splunkJson = splunkRes.ok  ? await splunkRes.json()  : null;
    const appJson    = appRes.ok     ? await appRes.json()     : null;
    return {
        splunkVersion: splunkJson?.entry?.[0]?.content?.version ?? '—',
        appVersion:    appJson?.entry?.[0]?.content?.version    ?? '—',
    };
}

// ── Colour palette (green family) ────────────────────────────────────────────
const C = {
    headerBg:     '#1e4d2b',
    headerText:   '#ffffff',
    subHeaderBg:  '#d4edda',
    subHeaderText:'#1e4d2b',
    rowBase:      '#ffffff',
    rowAlt:       '#f2faf4',
    borderColor:  '#a8d5b5',

    ok:   { bg: '#d4edda', border: '#5cb85c', text: '#1a5c2a', dot: '#28a745' },
    bad:  { bg: '#fde8e8', border: '#e57373', text: '#b71c1c', dot: '#e53935' },
    wait: { bg: '#f5f5f5', border: '#ccc',    text: '#888',    dot: '#ccc'    },

    badgeBlueBg:    '#e3f2fd', badgeBlueText:    '#0d47a1',
    badgeGreenBg:   '#e8f5e9', badgeGreenText:   '#1b5e20',
};

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
                    .catch(e   => ({ name: idx.name, count: 0, minTime: null, maxTime: null, hasData: false, error: String(e) }))
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

                {/* Version pills */}
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
                    label={loading ? 'Checking…' : 'Refresh'} />

                {checkedAt && !loading && (
                    <span style={{ fontSize: '12px', opacity: 0.65 }}>checked {checkedAt}</span>
                )}
            </div>

            {/* ── Table ── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ backgroundColor: C.subHeaderBg }}>
                        {['Index', 'Label', 'Type', 'Status', 'Oldest event', 'Latest event', 'Event count'].map((h, i) => (
                            <th key={h} style={{
                                padding: '10px 16px',
                                fontWeight: 700,
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.7px',
                                color: C.subHeaderText,
                                textAlign: i >= 4 ? 'right' : i === 3 ? 'center' : 'left',
                                borderBottom: `2px solid ${C.borderColor}`,
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {INDEXES.map((idx, i) => {
                        const s  = statuses[idx.name];
                        const ok = s?.hasData ?? false;
                        const c  = (loading && !s) ? C.wait : (ok ? C.ok : C.bad);

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
                                <td style={{ padding: '11px 16px', textAlign: 'center' }}>
                                    {loading && !s ? (
                                        <span style={{ color: '#bbb', fontSize: '18px' }}>…</span>
                                    ) : (
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 14px',
                                            borderRadius: '20px',
                                            backgroundColor: c.bg,
                                            border: `1px solid ${c.border}`,
                                            color: c.text,
                                            fontWeight: 700,
                                            fontSize: '13px',
                                        }}>
                                            <span style={{
                                                width: '9px', height: '9px',
                                                borderRadius: '50%',
                                                backgroundColor: c.dot,
                                                flexShrink: 0,
                                            }} />
                                            {ok ? 'OK' : (s?.error ? 'Error' : 'No data')}
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '11px 16px', textAlign: 'right', color: '#4a7c59', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                                    {s ? formatDate(s.minTime) : '…'}
                                </td>
                                <td style={{ padding: '11px 16px', textAlign: 'right', color: '#4a7c59', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                                    {s ? formatDate(s.maxTime) : '…'}
                                </td>
                                <td style={{ padding: '11px 16px', textAlign: 'right', color: '#1e4d2b', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                                    {s ? formatCount(s.count) : '…'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
