import React from 'react';

export default function ResultScreen({
    playerName,
    results,
    totalScore,
    correctCount,
    totalQuestions,
    onPlayAgain,
}) {
    const verdict = correctCount === totalQuestions
        ? '🏆  Perfect score!'
        : correctCount >= totalQuestions * 0.75
            ? '🎉  Well done!'
            : correctCount >= totalQuestions * 0.5
                ? '👍  Not bad!'
                : '💪  Keep learning!';

    return (
        <div className="s4c-buzz__results">
            <div className="s4c-buzz__trophy">{verdict.split(' ')[0]}</div>
            <div className="s4c-buzz__results-title">{verdict.replace(/^\S+\s+/, '')} {playerName}</div>
            <div className="s4c-buzz__results-score">{totalScore.toLocaleString()}</div>
            <div className="s4c-buzz__results-correct">{correctCount} / {totalQuestions} correct</div>

            <div className="s4c-buzz__results-strip">
                {results.map((r, i) => (
                    <span key={i} className={r.correct ? 'ok' : 'ko'}>{i + 1}</span>
                ))}
            </div>

            <div>
                <button className="s4c-buzz__cta" onClick={onPlayAgain}>Play again</button>
            </div>
        </div>
    );
}
