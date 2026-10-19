import { Link } from 'react-router-dom';
import { GRAMMAR, READING, LISTENING, TASK1, TASK2, CUE_CARDS } from '../data/index.js';
import { PageHead } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';
import { useStore } from '../lib/store.jsx';

const CHARTS = { line: 'Line graph', bar: 'Bar chart', pie: 'Pie charts', table: 'Table', process: 'Process diagram' };

export default function Practice() {
  const { state } = useStore();
  const best = (label) => state.scores.filter((s) => s.label === label).reduce((m, s) => Math.max(m, s.raw), -1);

  return (
    <>
      <PageHead kicker="Free practice" title="Practice" sub="Everything in the app, any time. Your daily tasks link here too." />
      <div className="stack">
        <Link to="/talk" className="hero" style={{ textDecoration: 'none' }}>
          <div>
            <p className="kicker" style={{ color: 'rgba(255,255,255,.85)' }}>New · Voice room</p>
            <h1 style={{ fontSize: 28 }}>Talk with your AI examiner</h1>
            <p className="sub">A full Speaking test or a relaxed conversation, by voice, with band estimates and corrections at the end.</p>
          </div>
          <span className="countdown-big"><Icon name="mic" width="40" height="40" /></span>
        </Link>
        <section className="card stack">
          <div className="row"><Icon name="reading" width="20" /><h2>Reading</h2></div>
          <div className="grid2">
            {READING.map((r) => {
              const b = best(r.title);
              return (
                <Link key={r.id} to={`/reading/${r.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p className="kicker">{r.level}</p><h3>{r.title}</h3>
                  <p className="muted small">{b >= 0 ? `Best: ${b}/${r.groups.reduce((n, g) => n + g.items.length, 0)}` : 'Not tried yet'}</p>
                </Link>
              );
            })}
            <Link to="/book/reading" className="card" style={{ textDecoration: 'none', color: 'inherit' }}><p className="kicker">Your book</p><h3>Cambridge or official test</h3><p className="muted small">Enter a score from a printed test</p></Link>
          </div>
        </section>

        <section className="card stack">
          <div className="row"><Icon name="listening" width="20" /><h2>Listening</h2></div>
          <div className="grid2">
            {LISTENING.map((l) => {
              const b = best(l.title);
              return (
                <Link key={l.id} to={`/listening/${l.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p className="kicker">{l.level}</p><h3>{l.title}</h3>
                  <p className="muted small">{b >= 0 ? `Best: ${b}/10` : 'Not tried yet'}</p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="card stack">
          <div className="row"><Icon name="writing" width="20" /><h2>Writing</h2></div>
          <p className="kicker">Task 1</p>
          <div className="grid2">
            {TASK1.map((t) => (
              <Link key={t.id} to={`/writing/${t.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p className="kicker">{CHARTS[t.chart]}{state.writing[t.id]?.submitted ? ' · done' : ''}</p><p className="small">{t.prompt}</p>
              </Link>
            ))}
          </div>
          <p className="kicker">Task 2</p>
          <div className="grid2">
            {TASK2.map((t) => (
              <Link key={t.id} to={`/writing/${t.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p className="kicker">{t.kind}{t.model ? ' · model answer' : ''}{state.writing[t.id]?.submitted ? ' · done' : ''}</p><p className="small">{t.prompt}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid2">
          <Link to="/speaking" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="row"><Icon name="speaking" width="20" /><h2>Speaking</h2></div>
            <p className="muted small">{CUE_CARDS.length} cue cards, Part 1 topics and full tests with recording.</p>
          </Link>
          <Link to="/grammar" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="row"><Icon name="grammar" width="20" /><h2>Grammar</h2></div>
            <p className="muted small">{GRAMMAR.length} lessons from the basics, each with a quiz.</p>
          </Link>
          <Link to="/review" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="row"><Icon name="review" width="20" /><h2>Mistake review</h2></div>
            <p className="muted small">{state.mistakes.length} saved mistakes to go over.</p>
          </Link>
        </section>
      </div>
    </>
  );
}
