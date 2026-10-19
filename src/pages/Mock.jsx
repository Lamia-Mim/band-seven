import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LISTENING, READING, TASK1, TASK2 } from '../data/index.js';
import QuestionSet from '../components/QuestionSet.jsx';
import ScriptPlayer, { Script } from '../components/ScriptPlayer.jsx';
import { PageHead, TaskDone, Timer, useTask } from '../components/ui.jsx';
import { ScoreSummary, useMarking } from '../components/useMarking.jsx';
import { Passage } from './Reading.jsx';
import { WritingEditor, Feedback } from './Writing.jsx';
import { useStore } from '../lib/store.jsx';
import { explainListening, explainReading } from '../lib/ai/explain.js';

const allGroups = (items) => items.flatMap((x) => x.groups);

export function MockHub() {
  const { state } = useStore();
  const mocks = state.scores.filter((s) => s.label?.startsWith('Mock'));
  return (
    <>
      <PageHead kicker="Full tests" title="Mock tests" sub="Do them in one sitting, with the timer, and without your phone." />
      <div className="stack">
        <div className="grid2">
          <Link className="card" to="/mock/listening" style={{ textDecoration: 'none', color: 'inherit' }}><p className="kicker">30 minutes · 40 questions</p><h3>Listening</h3><p className="muted small">Four sections, played once.</p></Link>
          <Link className="card" to="/mock/reading" style={{ textDecoration: 'none', color: 'inherit' }}><p className="kicker">60 minutes · 40 questions</p><h3>Reading</h3><p className="muted small">Three Academic passages.</p></Link>
          <Link className="card" to="/mock/writing/0" style={{ textDecoration: 'none', color: 'inherit' }}><p className="kicker">60 minutes</p><h3>Writing</h3><p className="muted small">Task 1 and Task 2.</p></Link>
          <Link className="card" to="/speaking/full/0" style={{ textDecoration: 'none', color: 'inherit' }}><p className="kicker">About 14 minutes</p><h3>Speaking</h3><p className="muted small">Parts 1, 2 and 3, recorded.</p></Link>
        </div>
        <section className="card stack">
          <h2>Tests from your book</h2>
          <p className="muted">After the app’s own test, use Cambridge IELTS books or official practice tests, and enter your score here so it shows in your progress.</p>
          <div className="row"><Link className="btn" to="/book/listening?full=1">Enter a Listening score</Link><Link className="btn" to="/book/reading?full=1">Enter a Reading score</Link></div>
        </section>
        {mocks.length > 0 && (
          <section className="card">
            <h2>Your mock results</h2>
            <table className="data"><thead><tr><th>Date</th><th>Test</th><th>Score</th><th>Band</th></tr></thead>
              <tbody>{mocks.slice().reverse().map((s, i) => <tr key={i}><td>{s.date}</td><td>{s.label}</td><td>{s.raw}/{s.total}</td><td><b>{s.band}</b></td></tr>)}</tbody></table>
          </section>
        )}
      </div>
    </>
  );
}

export function MockListening() {
  const { task, finish, done } = useTask();
  const groups = allGroups(LISTENING);
  const m = useMarking(groups, { section: 'listening', label: 'Mock: Listening', finish });
  return (
    <>
      <PageHead kicker="Mock test" title="Listening" sub="Four sections, 40 questions. The recording plays once." back={task ? '/' : '/mock'} />
      <div className="stack" style={{ maxWidth: 860 }}>
        <ScoreSummary result={m.result} full />
        <TaskDone show={!!m.result && done} />
        <ScriptPlayer sections={LISTENING} />
        {LISTENING.map((sec) => (
          <div className="card" key={sec.id}>
            <p className="kicker">{sec.level}</p>
            <QuestionSet groups={sec.groups} answers={m.answers} setAnswer={m.setAnswer} marked={!!m.result} explain={(g, item, given) => explainListening(sec, g, item, given)} />
          </div>
        ))}
        {!m.result
          ? <div className="row"><span className="muted small">{m.answered}/40 answered</span><span className="spacer" /><button type="button" className="btn primary" onClick={m.submit}>Finish and mark</button></div>
          : LISTENING.map((s) => <Script key={s.id} section={s} />)}
      </div>
    </>
  );
}

export function MockReading() {
  const { task, finish, done } = useTask();
  const [tab, setTab] = useState(0);
  const groups = allGroups(READING);
  const m = useMarking(groups, { section: 'reading', label: 'Mock: Reading', finish });
  const passage = READING[tab];
  return (
    <>
      <PageHead kicker="Mock test" title="Academic Reading" sub="Three passages, 40 questions, 60 minutes. No extra time to transfer answers." back={task ? '/' : '/mock'}>
        {!m.result && <Timer minutes={60} onEnd={m.submit} />}
      </PageHead>
      <div className="stack">
        <ScoreSummary result={m.result} full />
        <TaskDone show={!!m.result && done} />
        <div className="row" role="tablist">
          {READING.map((r, i) => <button key={r.id} type="button" role="tab" aria-selected={tab === i} className={`btn sm ${tab === i ? 'primary' : ''}`} onClick={() => setTab(i)}>Passage {i + 1}</button>)}
        </div>
        <div className="split">
          <Passage passage={passage} />
          <div className="card">
            <QuestionSet groups={passage.groups} answers={m.answers} setAnswer={m.setAnswer} marked={!!m.result} explain={(g, item, given) => explainReading(passage, g, item, given)} />
            <div className="row" style={{ marginTop: 20 }}>
              {tab < READING.length - 1 && <button type="button" className="btn" onClick={() => { setTab(tab + 1); window.scrollTo(0, 0); }}>Next passage</button>}
              <span className="spacer" />
              {!m.result && <button type="button" className="btn primary" onClick={m.submit}>Finish and mark ({m.answered}/40)</button>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function MockWriting() {
  const ref = +useParams().ref;
  const t1 = { ...TASK1[ref % TASK1.length], task: 1 };
  const t2 = { ...TASK2[ref % TASK2.length], task: 2 };
  const { task, finish, done } = useTask();
  const { saveWriting } = useStore();
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const boxes = document.querySelectorAll('.writing-box textarea');
    saveWriting(t1.id, boxes[0]?.value || '', true);
    saveWriting(t2.id, boxes[1]?.value || '', true);
    setSubmitted(true);
    finish();
  }

  return (
    <>
      <PageHead kicker="Mock test" title="Academic Writing" sub="Task 1 and Task 2 in 60 minutes. Spend about 20 minutes on Task 1 and 40 on Task 2." back={task ? '/' : '/mock'}>
        {!submitted && <Timer minutes={60} onEnd={submit} />}
      </PageHead>
      <div className="stack" style={{ maxWidth: 860 }}>
        <TaskDone show={submitted && done} />
        <WritingEditor prompt={t1} locked={submitted} />
        <WritingEditor prompt={t2} locked={submitted} />
        {!submitted
          ? <div className="row"><span className="spacer" /><button type="button" className="btn primary" onClick={submit}>Finish</button></div>
          : <><Feedback prompt={t1} /><Feedback prompt={t2} /></>}
      </div>
    </>
  );
}
