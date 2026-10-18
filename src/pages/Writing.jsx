import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TASK1, TASK2 } from '../data/index.js';
import { CHECKLIST } from '../data/writing.js';
import Chart from '../components/Chart.jsx';
import { PageHead, TaskDone, Timer, useTask, wordCount } from '../components/ui.jsx';
import { useStore } from '../lib/store.jsx';

export const findPrompt = (id) => {
  const t1 = TASK1.find((t) => t.id === id);
  if (t1) return { ...t1, task: 1 };
  const t2 = TASK2.find((t) => t.id === id);
  return t2 ? { ...t2, task: 2 } : null;
};

// A prompt with its editor. Saves drafts as you type.
export function WritingEditor({ prompt, locked }) {
  const { state, saveWriting } = useStore();
  const [text, setText] = useState(state.writing[prompt.id]?.text || '');
  const latest = useRef(text);
  latest.current = text;
  const min = prompt.task === 1 ? 150 : 250;
  const words = wordCount(text);

  // Save the draft a moment after typing stops, and when leaving the page
  useEffect(() => {
    const id = setTimeout(() => text && saveWriting(prompt.id, text), 800);
    return () => clearTimeout(id);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => latest.current && saveWriting(prompt.id, latest.current), [prompt.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="stack">
      <section className="card stack">
        <p className="kicker">Writing Task {prompt.task}{prompt.kind ? ` · ${prompt.kind}` : ''} · {prompt.task === 1 ? '20 minutes' : '40 minutes'}</p>
        <p style={{ fontSize: 16.5 }}><b>{prompt.prompt}</b></p>
        <p className="muted small">
          {prompt.task === 1
            ? 'Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.'
            : 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'}
        </p>
        {prompt.task === 1 && <Chart item={prompt} />}
      </section>
      <section className="card writing-box stack">
        <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={locked} spellCheck="false"
          placeholder={prompt.task === 1 ? 'Introduction (paraphrase the question) · Overview · Two body paragraphs' : 'Introduction with your position · Body paragraph 1 · Body paragraph 2 · Conclusion'}
          aria-label={`Your answer to Task ${prompt.task}`} />
        <div className="row">
          <span className="wordcount" style={{ color: words >= min ? 'var(--ok)' : 'var(--bad)' }}>{words} words</span>
          <span className="muted small">minimum {min}. Spell-check is off, as in the real test.</span>
        </div>
      </section>
    </div>
  );
}

export function Feedback({ prompt }) {
  const { state } = useStore();
  const submitted = state.writing[prompt.id]?.submitted;
  return (
    <>
      <section className="card checklist">
        <h2>Check your answer against Band 7</h2>
        {CHECKLIST[prompt.task === 1 ? 'task1' : 'task2'].map(([crit, items]) => (
          <div key={crit}><h4>{crit}</h4>{items.map((t) => <label key={t}><input type="checkbox" />{t}</label>)}</div>
        ))}
        <p className="muted small">Every box you can’t tick is your next target. Rewrite one paragraph with that target in mind.</p>
      </section>
      {prompt.model && submitted && (
        <section className="card stack">
          <div className="row"><h2>Model answer</h2><span className="chip gold">unlocked</span><span className="spacer" /><span className="muted small">{wordCount(prompt.model)} words</span></div>
          <p className="model">{prompt.model}</p>
          <p className="muted small">Compare: how does it organise paragraphs, link ideas and vary vocabulary? Borrow structures, not sentences.</p>
        </section>
      )}
    </>
  );
}

export default function Writing() {
  const { id } = useParams();
  const prompt = findPrompt(id);
  const { task, finish, done } = useTask();
  const { state, saveWriting } = useStore();
  const [submitted, setSubmitted] = useState(false);
  if (!prompt) return <p>Prompt not found.</p>;

  function submit() {
    // read the editor itself: the saved draft can be a moment behind
    saveWriting(prompt.id, document.querySelector('.writing-box textarea')?.value ?? state.writing[prompt.id]?.text ?? '', true);
    setSubmitted(true);
    finish();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  return (
    <>
      <PageHead kicker={`Writing · Task ${prompt.task}`} title={prompt.task === 1 ? 'Describe the visual' : `${prompt.kind} essay`} back={task ? '/' : '/practice'}>
        <Timer minutes={prompt.task === 1 ? 20 : 40} />
      </PageHead>
      <div className="stack" style={{ maxWidth: 860 }}>
        <WritingEditor prompt={prompt} />
        {!submitted && !state.writing[prompt.id]?.submitted
          ? <div className="row"><span className="muted small">{prompt.model ? 'Submitting unlocks a model answer.' : 'Submit to check yourself against Band 7.'}</span><span className="spacer" /><button type="button" className="btn primary" onClick={submit}>Submit</button></div>
          : <><TaskDone show={done} /><Feedback prompt={prompt} />{!done && task && <div><button type="button" className="btn primary" onClick={finish}>Mark task done</button></div>}</>}
      </div>
    </>
  );
}
