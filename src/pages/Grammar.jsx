import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GRAMMAR } from '../data/index.js';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { useStore } from '../lib/store.jsx';

export function GrammarList() {
  return (
    <>
      <PageHead kicker="From the basics" title="Grammar" sub="Short lessons on the grammar IELTS examiners notice most, each with a quiz." back="/practice" />
      <div className="grid2">
        {GRAMMAR.map((g, i) => (
          <Link key={g.id} to={`/grammar/${g.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <p className="kicker">Lesson {i + 1}</p>
            <h3>{g.title}</h3>
            <p className="muted small">{g.summary}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

export function GrammarLesson() {
  const { id } = useParams();
  const g = GRAMMAR.find((x) => x.id === id);
  const { finish, task, done } = useTask();
  const { addMistakes, addScore } = useStore();
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState(false);
  if (!g) return <p>Lesson not found.</p>;
  const index = GRAMMAR.indexOf(g);
  const score = g.quiz.filter((q, i) => answers[i] === q.answer).length;

  function submit() {
    setMarked(true);
    addScore({ section: 'grammar', label: g.title, raw: score, total: g.quiz.length, band: null });
    addMistakes(g.quiz.map((q, i) => ({ q, i })).filter(({ q, i }) => answers[i] !== q.answer).map(({ q, i }) => ({
      source: `Grammar · ${g.title}`, prompt: q.q, yours: q.options[answers[i]] ?? '(no answer)', answer: q.options[q.answer],
    })));
    finish();
  }

  return (
    <>
      <PageHead kicker={`Grammar · lesson ${index + 1} of ${GRAMMAR.length}`} title={g.title} sub={g.summary} back={task ? '/' : '/grammar'} />
      <div className="stack">
        {g.sections.map((s) => (
          <section className="card stack" key={s.heading}>
            <h2>{s.heading}</h2>
            <p>{s.text}</p>
            <ul style={{ margin: 0, paddingLeft: 20 }}>{s.examples.map((e) => <li key={e}><i>{e}</i></li>)}</ul>
          </section>
        ))}

        <section className="card stack">
          <h2>Common mistakes</h2>
          {g.mistakes.map((m) => (
            <div key={m.wrong} className="stack" style={{ gap: 2 }}>
              <p><span className="chip bad">✗</span> <s>{m.wrong}</s></p>
              <p><span className="chip ok">✓</span> {m.right}</p>
              <p className="muted small">{m.why}</p>
            </div>
          ))}
        </section>

        <section className="card stack">
          <h2>Quiz</h2>
          {g.quiz.map((q, i) => {
            const right = marked && answers[i] === q.answer;
            return (
              <div key={q.q} className={`q ${marked ? (right ? 'right' : 'wrong') : ''}`}>
                <div><span className="q__n">{i + 1}</span>{q.q}</div>
                <div className="q__opts">
                  {q.options.map((o, oi) => (
                    <label key={o} className="opt">
                      <input type="radio" name={`g${i}`} checked={answers[i] === oi} disabled={marked} onChange={() => setAnswers({ ...answers, [i]: oi })} />{o}
                    </label>
                  ))}
                </div>
                {marked && <p className={right ? 'small muted' : 'q__answer'}>{right ? '' : `Answer: ${q.options[q.answer]}. `}{q.explain}</p>}
              </div>
            );
          })}
          {!marked
            ? <div><button type="button" className="btn primary" onClick={submit} disabled={Object.keys(answers).length < g.quiz.length}>Check answers</button></div>
            : <p className="scorebox"><span className="big">{score}/{g.quiz.length}</span><span className="muted">{score === g.quiz.length ? 'Perfect.' : 'Mistakes are saved to your review list.'}</span></p>}
          <TaskDone show={marked && done} />
        </section>
      </div>
    </>
  );
}
