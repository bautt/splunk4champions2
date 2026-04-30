import React, { useState, useMemo, useCallback } from 'react';
import './BuzzQuiz.css';
import QuestionScreen from './QuestionScreen';
import ResultScreen from './ResultScreen';

// ── Authoring stubs ──────────────────────────────────────────────────────────
// These render nothing on their own; <BuzzQuiz> walks its children to extract data.

export function Question() { return null; }
export function Answer() { return null; }
export function TrueFalse() { return null; }

// ── Children → question data ─────────────────────────────────────────────────

function extractAnswers(questionEl) {
    return React.Children.toArray(questionEl.props.children)
        .filter((c) => c && c.type === Answer)
        .map((a) => ({
            text: a.props.children,
            correct: !!a.props.correct,
        }));
}

function parseChildren(children) {
    return React.Children.toArray(children)
        .filter((c) => c && (c.type === Question || c.type === TrueFalse))
        .map((el, i) => {
            if (el.type === TrueFalse) {
                return {
                    kind: 'tf',
                    multi: false,
                    id: i,
                    prompt: el.props.prompt,
                    emoji: el.props.emoji,
                    image: el.props.image,
                    explanation: el.props.explanation,
                    answers: [
                        { text: 'True', correct: el.props.correct === true },
                        { text: 'False', correct: el.props.correct === false },
                    ],
                };
            }
            const answers = extractAnswers(el);
            const multi = el.props.multi != null
                ? !!el.props.multi
                : answers.filter((a) => a.correct).length > 1;
            return {
                kind: 'q',
                multi,
                id: i,
                prompt: el.props.prompt,
                emoji: el.props.emoji,
                image: el.props.image,
                explanation: el.props.explanation,
                answers,
            };
        });
}

// ── Title screen ─────────────────────────────────────────────────────────────

function TitleScreen({ title, subtitle, count, defaultName, onStart }) {
    const [name, setName] = useState(defaultName || '');
    const canStart = name.trim().length > 0;

    return (
        <div className="s4c-buzz__title-wrap">
            <div className="s4c-buzz__logo">{title}</div>
            {subtitle ? <div className="s4c-buzz__subtitle">{subtitle}</div> : null}
            <div className="s4c-buzz__meta">{count} questions · ~{Math.ceil(count * 0.5)} min</div>

            <input
                className="s4c-buzz__name-input"
                placeholder="Your nickname"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 24))}
                onKeyDown={(e) => { if (e.key === 'Enter' && canStart) onStart(name.trim()); }}
                autoFocus
            />
            <div>
                <button
                    className="s4c-buzz__cta"
                    onClick={() => onStart(name.trim())}
                    disabled={!canStart}
                >
                    PLAY
                </button>
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function BuzzQuiz({
    title = 'Quiz',
    subtitle,
    timePerQuestion = 30,
    pointsBase = 1000,
    theme,                  // 'purple' (default) | 'blue' | 'dark' | 'splunk' | 'sunset' | 'forest'
    background,             // any CSS background string — overrides theme
    questions: explicitQuestions,
    children,
}) {
    const questions = useMemo(
        () => (explicitQuestions && explicitQuestions.length ? explicitQuestions : parseChildren(children)),
        [explicitQuestions, children]
    );

    const [phase, setPhase] = useState('title');         // title | playing | results
    const [playerName, setPlayerName] = useState(() => {
        try { return localStorage.getItem('s4c_buzz_name') || ''; }
        catch (e) { return ''; }
    });
    const [qIndex, setQIndex] = useState(0);
    const [results, setResults] = useState([]);

    const handleStart = useCallback((name) => {
        setPlayerName(name);
        try { localStorage.setItem('s4c_buzz_name', name); } catch (e) { /* ignore */ }
        setQIndex(0);
        setResults([]);
        setPhase('playing');
    }, []);

    const handleQuestionComplete = useCallback((outcome) => {
        setResults((prev) => [...prev, outcome]);
    }, []);

    const handleNext = useCallback(() => {
        if (qIndex + 1 >= questions.length) {
            setPhase('results');
        } else {
            setQIndex((i) => i + 1);
        }
    }, [qIndex, questions.length]);

    const totalScore = results.reduce((s, r) => s + r.points, 0);
    const correctCount = results.filter((r) => r.correct).length;

    const playAgain = () => {
        setQIndex(0);
        setResults([]);
        setPhase('playing');
    };

    const themeClass = theme ? `s4c-buzz--theme-${theme}` : '';
    const wrapperClassName = `s4c-buzz ${themeClass}`.trim();
    const wrapperStyle = background ? { background } : undefined;

    if (!questions.length) {
        return (
            <div className={wrapperClassName} style={wrapperStyle}>
                <div className="s4c-buzz__title-wrap">
                    <div className="s4c-buzz__logo">{title}</div>
                    <div className="s4c-buzz__subtitle">No questions defined yet.</div>
                </div>
            </div>
        );
    }

    if (phase === 'title') {
        return (
            <div className={wrapperClassName} style={wrapperStyle}>
                <TitleScreen
                    title={title}
                    subtitle={subtitle}
                    count={questions.length}
                    defaultName={playerName}
                    onStart={handleStart}
                />
            </div>
        );
    }

    if (phase === 'playing') {
        return (
            <div className={wrapperClassName} style={wrapperStyle}>
                <QuestionScreen
                    key={qIndex}
                    question={questions[qIndex]}
                    index={qIndex}
                    total={questions.length}
                    runningScore={totalScore}
                    timePerQuestion={timePerQuestion}
                    pointsBase={pointsBase}
                    onComplete={handleQuestionComplete}
                    onNext={handleNext}
                />
            </div>
        );
    }

    if (phase === 'results') {
        return (
            <div className={wrapperClassName} style={wrapperStyle}>
                <ResultScreen
                    playerName={playerName}
                    results={results}
                    totalScore={totalScore}
                    correctCount={correctCount}
                    totalQuestions={questions.length}
                    onPlayAgain={playAgain}
                />
            </div>
        );
    }

    return null;
}
