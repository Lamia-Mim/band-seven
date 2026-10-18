import { useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { scoreGroups } from '../lib/score.js';
import { bandFor } from '../lib/band.js';

// Answers, marking, saving the score and mistakes, and finishing the task
export function useMarking(groups, { section, label, finish }) {
  const { addScore, addMistakes } = useStore();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const setAnswer = (n, v) => setAnswers((a) => ({ ...a, [n]: v }));

  function submit() {
    const r = scoreGroups(groups, answers);
    const band = bandFor(section, r.raw, r.total);
    setResult({ ...r, band });
    addScore({ section, label, raw: r.raw, total: r.total, band });
    addMistakes(r.results.filter((x) => !x.correct).map((x) => ({
      source: `${section === 'reading' ? 'Reading' : 'Listening'} · ${label}`, prompt: `${x.n}. ${x.prompt}`, yours: x.given || '(blank)', answer: x.answer,
    })));
    finish?.();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const answered = Object.values(answers).filter((v) => v !== '').length;
  return { answers, setAnswer, result, submit, answered };
}

export function ScoreSummary({ result, full }) {
  if (!result) return null;
  return (
    <div className="card raised scorebox">
      <div><p className="kicker">Score</p><p className="big">{result.raw}/{result.total}</p></div>
      <div>
        <p className="kicker">{full ? 'Band' : 'Band estimate'}</p>
        <p className="big">{result.band}</p>
      </div>
      <p className="muted small" style={{ flex: '1 1 260px' }}>
        {full
          ? 'Using the usual raw-score conversion for practice tests. Real tests vary slightly.'
          : `Scaled to a 40-question test, so treat it as a rough guide. Wrong answers are saved to your mistake review.`}
      </p>
    </div>
  );
}
