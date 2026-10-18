import { useStore } from '../lib/store.jsx';
import { completedDays, isDayDone, streak } from '../lib/progress.js';
import { isLearned } from '../lib/srs.js';
import { diffDays, todayKey } from '../lib/dates.js';
import { WORDS } from '../data/index.js';
import { PageHead } from '../components/ui.jsx';

function Trend({ scores }) {
  const series = ['reading', 'listening'].map((s, k) => ({
    name: s, color: k ? '#e8553d' : '#1f4fd6', points: scores.filter((x) => x.section === s && x.band != null),
  })).filter((s) => s.points.length);
  if (!series.length) return <p className="muted">Your Reading and Listening bands will appear here after your first practice.</p>;
  const W = 640, H = 220, m = { l: 34, r: 12, t: 12, b: 24 };
  const n = Math.max(...series.map((s) => s.points.length));
  const x = (i) => m.l + (n === 1 ? (W - m.l - m.r) / 2 : (i * (W - m.l - m.r)) / (n - 1));
  const y = (b) => H - m.b - ((b - 3) / 6) * (H - m.t - m.b);
  return (
    <>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Band trend">
        {[3, 4, 5, 6, 7, 8, 9].map((b) => (
          <g key={b}>
            <line x1={m.l} x2={W - m.r} y1={y(b)} y2={y(b)} stroke="currentColor" opacity={b === 7 ? 0.45 : 0.1} strokeDasharray={b === 7 ? '4 4' : ''} />
            <text x={m.l - 6} y={y(b) + 4} textAnchor="end">{b}</text>
          </g>
        ))}
        {series.map((s) => (
          <g key={s.name}>
            <polyline points={s.points.map((p, i) => `${x(i)},${y(p.band)}`).join(' ')} fill="none" stroke={s.color} strokeWidth="2.5" />
            {s.points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.band)} r="4" fill={s.color}><title>{`${p.date} · ${p.label}: ${p.band}`}</title></circle>)}
          </g>
        ))}
      </svg>
      <div className="row small" style={{ justifyContent: 'center' }}>
        {series.map((s) => <span key={s.name} className="row" style={{ gap: 6 }}><span style={{ width: 12, height: 3, background: s.color, display: 'inline-block' }} />{s.name}</span>)}
        <span className="muted">· dashed line = Band 7</span>
      </div>
    </>
  );
}

export default function Progress() {
  const { state, plan } = useStore();
  const today = todayKey();
  const days = completedDays(plan, state.done);
  let best = 0, run = 0;
  for (const d of plan.days) { run = isDayDone(d, state.done) ? run + 1 : 0; best = Math.max(best, run); }
  const learned = WORDS.filter((w) => isLearned(state.vocab[w.id])).length;
  const essays = Object.values(state.writing).filter((w) => w.submitted).length;
  const speaking = state.scores.filter((s) => s.section === 'speaking');
  const avgWpm = speaking.filter((s) => s.wpm).reduce((a, s, _, arr) => a + s.wpm / arr.length, 0);
  const scored = state.scores.filter((s) => s.band != null);
  const left = diffDays(today, plan.examDate);

  return (
    <>
      <PageHead kicker={left > 0 ? `${left} days to go` : 'Exam'} title="Progress" />
      <div className="stack">
        <div className="kpis">
          <div className="kpi"><b>{days}/{plan.n}</b><span>days complete</span></div>
          <div className="kpi"><b>{streak(plan, state.done, today)}</b><span>current streak · best {best}</span></div>
          <div className="kpi"><b>{learned}</b><span>words learned of {WORDS.length}</span></div>
          <div className="kpi"><b>{essays}</b><span>writing tasks submitted</span></div>
          <div className="kpi"><b>{speaking.length}</b><span>speaking sessions{avgWpm ? ` · ${Math.round(avgWpm)} wpm avg` : ''}</span></div>
        </div>
        <section className="card stack">
          <h2>Reading and Listening bands</h2>
          <Trend scores={scored} />
        </section>
        <section className="card">
          <h2>All scores</h2>
          {scored.length ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data">
                <thead><tr><th>Date</th><th>Section</th><th>Practice</th><th>Score</th><th>Band</th></tr></thead>
                <tbody>{scored.slice().reverse().map((s, i) => <tr key={i}><td>{s.date}</td><td>{s.section}</td><td>{s.label}</td><td>{s.raw}/{s.total}</td><td><b>{s.band}</b></td></tr>)}</tbody>
              </table>
            </div>
          ) : <p className="muted">No scores yet.</p>}
          <p className="muted small" style={{ marginTop: 10 }}>Bands for single passages and sections are scaled estimates; full tests use the usual conversion table.</p>
        </section>
      </div>
    </>
  );
}
