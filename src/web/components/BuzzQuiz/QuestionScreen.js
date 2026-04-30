import React, { useState, useEffect, useRef } from 'react';

const SHAPES = ['▲', '◆', '●', '■', '★', '✦'];

function Tile({ idx, text, picked, revealed, isCorrect, multi, onPick }) {
    const dim = revealed && !isCorrect && !picked;
    const correctClass = revealed && isCorrect ? 's4c-buzz__tile--correct' : '';
    const wrongClass = revealed && picked && !isCorrect ? 's4c-buzz__tile--wrong' : '';
    const pickedClass = !revealed && picked ? 's4c-buzz__tile--picked' : '';
    const dimClass = dim ? 's4c-buzz__tile--dim' : '';
    const shape = SHAPES[idx % SHAPES.length];

    return (
        <button
            className={`s4c-buzz__tile s4c-buzz__tile--${idx % 4} ${correctClass} ${wrongClass} ${pickedClass} ${dimClass}`}
            onClick={onPick}
            disabled={revealed}
            type="button"
        >
            <span className="s4c-buzz__tile-shape">{multi ? (picked ? '☑' : '☐') : shape}</span>
            <span>{text}</span>
            {revealed && isCorrect ? <span className="s4c-buzz__tile-mark">✓</span> : null}
            {revealed && picked && !isCorrect ? <span className="s4c-buzz__tile-mark">✗</span> : null}
        </button>
    );
}

function scoreMultiSelect(answers, picks, pointsBase, timeRatio) {
    const totalCorrect = answers.filter((a) => a.correct).length;
    const totalIncorrect = answers.length - totalCorrect;
    let correctPicked = 0;
    let incorrectPicked = 0;
    answers.forEach((a, i) => {
        if (!picks[i]) return;
        if (a.correct) correctPicked++;
        else incorrectPicked++;
    });
    if (totalCorrect === 0) return { fraction: 0, perfect: false, points: 0 };
    const correctFrac = correctPicked / totalCorrect;
    const wrongPenalty = totalIncorrect > 0 ? incorrectPicked / totalIncorrect : 0;
    const fraction = Math.max(0, correctFrac - wrongPenalty);
    const perfect = correctPicked === totalCorrect && incorrectPicked === 0;
    return { fraction, perfect, points: Math.round(pointsBase * fraction * (1 - timeRatio * 0.5)) };
}

export default function QuestionScreen({
    question,
    index,
    total,
    runningScore,
    timePerQuestion,
    pointsBase,
    onComplete,
    onNext,
}) {
    const isMulti = !!question.multi;
    const [picks, setPicks] = useState(() => question.answers.map(() => false));
    const [revealed, setRevealed] = useState(false);
    const [tenths, setTenths] = useState(timePerQuestion * 10);
    const [awardedPoints, setAwardedPoints] = useState(0);
    const [wasPerfect, setWasPerfect] = useState(false);
    const completedRef = useRef(false);
    const startRef = useRef(Date.now());

    useEffect(() => {
        if (revealed) return undefined;
        const id = setInterval(() => {
            setTenths((t) => {
                if (t <= 1) { clearInterval(id); return 0; }
                return t - 1;
            });
        }, 100);
        return () => clearInterval(id);
    }, [revealed]);

    useEffect(() => {
        if (tenths === 0 && !revealed) doReveal(picks);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenths, revealed]);

    function doReveal(finalPicks) {
        if (completedRef.current) return;
        completedRef.current = true;
        const timeUsed = (Date.now() - startRef.current) / 1000;
        const timeRatio = Math.max(0, Math.min(1, timeUsed / timePerQuestion));

        let result;
        if (isMulti) {
            const r = scoreMultiSelect(question.answers, finalPicks, pointsBase, timeRatio);
            result = { correct: r.perfect, points: r.points, timeUsed: Math.round(timeUsed * 10) / 10 };
            setWasPerfect(r.perfect);
        } else {
            const pickIdx = finalPicks.findIndex(Boolean);
            const isCorrect = pickIdx >= 0 && question.answers[pickIdx].correct;
            const points = isCorrect ? Math.round(pointsBase * (1 - timeRatio * 0.5)) : 0;
            result = { correct: isCorrect, points, timeUsed: Math.round(timeUsed * 10) / 10 };
            setWasPerfect(isCorrect);
        }
        setAwardedPoints(result.points);
        setRevealed(true);
        onComplete(result);
    }

    function handlePick(i) {
        if (revealed) return;
        if (isMulti) {
            setPicks((prev) => prev.map((v, k) => (k === i ? !v : v)));
        } else {
            const next = question.answers.map((_, k) => k === i);
            setPicks(next);
            doReveal(next);
        }
    }

    function handleSubmitMulti() {
        if (revealed) return;
        doReveal(picks);
    }

    const seconds = Math.ceil(tenths / 10);
    const timerPct = (tenths / (timePerQuestion * 10)) * 100;
    const anyPicked = picks.some(Boolean);

    return (
        <div>
            <div className="s4c-buzz__hud">
                <span className="s4c-buzz__hud-left">
                    Question {index + 1} / {total}{isMulti ? ' · select all that apply' : ''}
                </span>
                <span className="s4c-buzz__hud-pill">Score: {runningScore}</span>
            </div>

            <div className="s4c-buzz__prompt">{question.prompt}</div>

            {(question.emoji || question.image) ? (
                <div className="s4c-buzz__media">
                    {question.image
                        ? <img src={question.image} alt="" />
                        : <span role="img" aria-label="">{question.emoji}</span>}
                </div>
            ) : null}

            <div className={`s4c-buzz__tiles ${question.kind === 'tf' ? 's4c-buzz__tiles--tf' : ''}`}>
                {question.answers.map((a, i) => (
                    <Tile
                        key={i}
                        idx={i}
                        text={a.text}
                        picked={picks[i]}
                        revealed={revealed}
                        isCorrect={a.correct}
                        multi={isMulti}
                        onPick={() => handlePick(i)}
                    />
                ))}
            </div>

            {!revealed ? (
                <div className="s4c-buzz__footer-row">
                    <div className="s4c-buzz__timer-foot" aria-live="polite">
                        <div className="s4c-buzz__timer-track">
                            <div className="s4c-buzz__timer-fill" style={{ width: `${timerPct}%` }} />
                        </div>
                        <span className="s4c-buzz__timer-label">{seconds}s</span>
                    </div>
                    <div className="s4c-buzz__footer-actions">
                        {isMulti ? (
                            <button
                                className="s4c-buzz__cta"
                                onClick={handleSubmitMulti}
                                disabled={!anyPicked}
                            >
                                Submit answer
                            </button>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {revealed ? (
                <>
                    <div className={`s4c-buzz__feedback ${wasPerfect ? 's4c-buzz__feedback-correct' : (awardedPoints > 0 ? '' : 's4c-buzz__feedback-wrong')}`}>
                        <strong>
                            {!anyPicked
                                ? '⏰ Time\'s up!'
                                : wasPerfect
                                    ? `✓ Correct! +${awardedPoints} points`
                                    : awardedPoints > 0
                                        ? `~ Partial credit: +${awardedPoints} points`
                                        : '✗ Not quite.'}
                        </strong>
                        {question.explanation ? (
                            <div style={{ marginTop: 6 }}>{question.explanation}</div>
                        ) : null}
                    </div>
                    <div className="s4c-buzz__footer-row">
                        <div className="s4c-buzz__footer-flex-grow" aria-hidden="true" />
                        <div className="s4c-buzz__footer-actions">
                            <button className="s4c-buzz__cta" onClick={onNext}>
                                {index + 1 === total ? 'See results →' : 'Next →'}
                            </button>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}
