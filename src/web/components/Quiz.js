import React, { useState } from 'react'
import Button from '@splunk/react-ui/Button'
import SplunkSearch from './SplunkSearch'

// ── Question data ─────────────────────────────────────────────────────────────

const QUESTIONS = [
    {
        type: 'image',
        question: 'What is it?',
        src: '/static/app/splunk4champions2/images/rebus.png',
        width: 600,
        answer: null,
        explanation: 'Discuss the answer with the group!',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index="s4c_meteo" Frankfurt
| rename weather_code as WeatherCode
| stats count as eventcount by WeatherCode
| where eventcount > 5000`,
        splB: `index="s4c_meteo" Frankfurt
| stats count as eventcount by weather_code
| where eventcount > 5000
| rename weather_code as WeatherCode`,
        earliest: '-1y', latest: 'now',
        answer: 'B',
        explanation: 'Move rename after stats. The rename runs on the small result set (a handful of rows) rather than on every raw event. Push field renames as late as possible.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index=_internal 127.0.0.1`,
        splB: `index=_internal TERM(127.0.0.1)`,
        earliest: '-30d', latest: 'now',
        answer: 'B',
        explanation: 'TERM() tells Splunk to look up the exact token "127.0.0.1" in the index. Without it, the dots are treated as minor breakers and the search engine tokenises the IP into parts, making it slower and less precise.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index="_introspection" component=PerProcess "data.process"=splunkd
| stats last(_time) as _time, count as eventcount by "data.pid"
| rename "data.pid" as processId
| where eventcount > 10`,
        splB: `index="_introspection" "data.process"=splunkd
| transaction "data.pid"
| rename "data.pid" as processId
| table _time, processId, eventcount
| search eventcount > 10`,
        earliest: '-30d', latest: 'now',
        answer: 'A',
        explanation: 'stats is far faster than transaction. The transaction command groups events by field and must hold them in memory — it is expensive and should only be used when you truly need session boundaries. Here stats last() + count achieves the same result in a fraction of the time.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index="_audit"
| join type=left host [search index="_audit"
  | stats count as eventcount by host]`,
        splB: `index="_audit"
| eventstats count as host_count by host
| stats count by component, host_count, host`,
        earliest: '-30d', latest: 'now',
        answer: 'B',
        explanation: 'eventstats avoids the join entirely. join spawns a sub-search, has a 50 000-event default limit, and is hard to optimise. eventstats computes the aggregate over the same result set in a single pass — no sub-search, no limit.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index=s4c_meteo
| stats count by city`,
        splB: `| tstats count WHERE index="s4c_meteo" by city`,
        earliest: '-1y', latest: 'now',
        answer: 'B',
        explanation: 'tstats reads pre-built .tsidx files and never touches the raw event data, making it orders of magnitude faster for aggregations over large time ranges. Use it whenever you only need indexed fields.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `| tstats avg(temperature_2m) max(temperature_2m) min(temperature_2m) median(temperature_2m)
  WHERE index=s4c_meteo by city`,
        splB: `index=s4c_meteo
| stats avg(temperature_2m) max(temperature_2m) min(temperature_2m) median(temperature_2m) by city`,
        earliest: '-1y', latest: 'now',
        answer: 'trick',
        explanation: 'Trick question. tstats supports avg/max/min/median — but only on indexed fields. s4c_meteo uses KV_MODE=json (search-time extraction), so tstats finds no fields and returns nothing. For tstats to work, the index must use INDEXED_EXTRACTIONS=json (index-time). In that case A would be much faster; otherwise only B works.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index="s4c_meteo" city IN(Berlin Brussels Warsaw)`,
        splB: `index="s4c_meteo"
| where city IN("Berlin", "Brussels", "Warsaw")`,
        earliest: '-2y', latest: 'now',
        answer: 'A',
        explanation: 'Filtering in the search string (A) lets Splunk apply the filter during the index-scan phase — far fewer events are loaded. The | where command (B) runs after all matching events are retrieved, so Splunk loads everything first and then discards most of it.',
    },
    {
        question: 'Which search is better? And why?',
        splA: `index="s4c_meteo" *erlin`,
        splB: `index="s4c_meteo" Ber*`,
        earliest: '-2y', latest: 'now',
        answer: 'B',
        explanation: 'A leading wildcard (*erlin) forces a full scan of the index — Splunk cannot use the lexicon to shortcut the search. A trailing wildcard (Ber*) can still use the lexicon prefix lookup and is much faster. Avoid leading wildcards whenever possible.',
    },
]

// ── Styles ────────────────────────────────────────────────────────────────────

function badge(state) {
    const bg = state === 'correct' ? '#2e7d32' : state === 'wrong' ? '#c62828' : '#555'
    return {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 24, height: 24, borderRadius: '50%',
        background: bg, color: '#fff', fontWeight: 700, fontSize: 12,
        flexShrink: 0, marginRight: 8,
    }
}

// ── QuizQuestion ──────────────────────────────────────────────────────────────

function QuizQuestion({ q, index, revealed, onReveal }) {
    const stateA = revealed ? (q.answer === 'A' ? 'correct' : q.answer === 'trick' ? 'neutral' : 'wrong') : 'neutral'
    const stateB = revealed ? (q.answer === 'B' ? 'correct' : q.answer === 'trick' ? 'neutral' : 'wrong') : 'neutral'

    return (
        <div style={{
            marginBottom: 20,
            padding: '16px 20px',
            border: `1px solid ${revealed ? '#b2dfdb' : '#ddd'}`,
            borderRadius: 6,
            background: revealed ? '#f9fffe' : '#fafafa',
            transition: 'border-color 0.2s, background 0.2s',
        }}>
            <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>
                {index + 1}. {q.question}
            </div>

            {q.type === 'image' ? (
                <img
                    src={q.src}
                    width={q.width || 600}
                    style={{ display: 'block', marginBottom: 12, borderRadius: 4 }}
                />
            ) : (
                <>
                    <div style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                            <span style={badge(stateA)}>A</span>
                        </div>
                        <SplunkSearch spl={q.splA} earliest={q.earliest} latest={q.latest} />
                    </div>

                    <div style={{ color: '#999', fontStyle: 'italic', margin: '6px 0', fontSize: 12 }}>
                        versus
                    </div>

                    <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                            <span style={badge(stateB)}>B</span>
                        </div>
                        <SplunkSearch spl={q.splB} earliest={q.earliest} latest={q.latest} />
                    </div>
                </>
            )}

            {!revealed ? (
                <Button appearance="secondary" onClick={onReveal} label="Reveal Answer" />
            ) : (
                <div style={{
                    marginTop: 10,
                    padding: '10px 14px',
                    background: '#e3f2fd',
                    borderLeft: `3px solid ${q.answer === 'trick' ? '#f57c00' : '#0070d2'}`,
                    borderRadius: 3,
                    fontSize: 13,
                }}>
                    <strong>
                        {q.answer === 'trick'
                            ? '⚠ Trick question'
                            : q.answer
                                ? `✓ Search ${q.answer} is better`
                                : '💬 Discussion'}
                    </strong>
                    <p style={{ margin: '6px 0 0', color: '#333', lineHeight: 1.5 }}>
                        {q.explanation}
                    </p>
                </div>
            )}
        </div>
    )
}

// ── Quiz (exported) ───────────────────────────────────────────────────────────

export default function Quiz() {
    const [revealed, setRevealed] = useState(Array(QUESTIONS.length).fill(false))

    const reveal = (i) => setRevealed(prev => { const n = [...prev]; n[i] = true; return n })
    const reset = () => setRevealed(Array(QUESTIONS.length).fill(false))

    const answered = revealed.filter(Boolean).length

    return (
        <div>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 20, padding: '10px 16px',
                background: '#f5f5f5', borderRadius: 6, border: '1px solid #e0e0e0',
            }}>
                <span style={{ fontSize: 13, color: '#555' }}>
                    {answered} / {QUESTIONS.length} revealed
                </span>
                <Button appearance="secondary" onClick={reset} label="Reset Quiz" />
            </div>

            {QUESTIONS.map((q, i) => (
                <QuizQuestion
                    key={i}
                    q={q}
                    index={i}
                    revealed={revealed[i]}
                    onReveal={() => reveal(i)}
                />
            ))}
        </div>
    )
}
