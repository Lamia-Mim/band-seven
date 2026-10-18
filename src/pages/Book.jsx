import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { RESOURCES } from '../data/index.js';
import { bandFor } from '../lib/band.js';
import { useStore } from '../lib/store.jsx';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

// Practice from a printed or official test, then record the score here
export default function Book() {
  const section = useParams().section === 'listening' ? 'listening' : 'reading';
  const full = new URLSearchParams(useLocation().search).get('full') === '1';
  const { task, finish, done } = useTask();
  const { addScore } = useStore();
  const [raw, setRaw] = useState('');
  const [total, setTotal] = useState(full ? 40 : section === 'reading' ? 13 : 10);
  const [saved, setSaved] = useState(null);
  const name = section === 'reading' ? 'Reading' : 'Listening';
  const valid = raw !== '' && +raw >= 0 && +raw <= +total && +total > 0;

  function save(e) {
    e.preventDefault();
    if (!valid) return;
    const band = bandFor(section, +raw, +total);
    addScore({ section, label: full ? `Mock: ${name} (book)` : `${name} (book)`, raw: +raw, total: +total, band });
    setSaved(band);
    finish();
  }

  return (
    <>
      <PageHead kicker={`${name} · your book`} title={full ? `A full ${name} test` : `One ${name} ${section === 'reading' ? 'passage' : 'section'}`} back={task ? '/' : '/practice'} />
      <div className="stack" style={{ maxWidth: 760 }}>
        <section className="card stack">
          <h2>1. Do the test</h2>
          <p>
            Use a Cambridge IELTS Academic book or an official practice test.
            {full
              ? section === 'reading' ? ' Do all three passages in 60 minutes, in one sitting.' : ' Play all four parts once, without pausing.'
              : section === 'reading' ? ' Pick the next passage you haven’t done and give yourself 20 minutes.' : ' Pick the next section you haven’t done and play it once.'}
          </p>
          <p className="muted small">Your PDFs can live in the <Link to="/library">Library</Link>. Free official tests:</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {RESOURCES.slice(0, 2).map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer">{r.name}</a></li>)}
          </ul>
        </section>
        <form className="card stack" onSubmit={save}>
          <h2>2. Enter your score</h2>
          <div className="row">
            <label className="field" style={{ flex: '1 1 120px' }}>Correct answers<input type="number" min="0" max={total} value={raw} onChange={(e) => setRaw(e.target.value)} disabled={saved != null} /></label>
            <label className="field" style={{ flex: '1 1 120px' }}>Out of<input type="number" min="1" max="40" value={total} onChange={(e) => setTotal(e.target.value)} disabled={saved != null} /></label>
          </div>
          {saved == null
            ? <div><button type="submit" className="btn primary" disabled={!valid}>Save score</button></div>
            : <p className="scorebox"><span className="big">{saved}</span><span className="muted">{full ? 'Band' : 'Band estimate (scaled to 40 questions)'} · saved to your progress</span></p>}
          <TaskDone show={saved != null && done} />
          <p className="muted small"><Icon name="review" width="14" height="14" /> Go back over every wrong answer in the book and find the exact words in the text or transcript that give the answer.</p>
        </form>
      </div>
    </>
  );
}
