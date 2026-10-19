import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { addDays, todayKey } from '../lib/dates.js';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { ExplainButton } from '../components/ai/Ai.jsx';

export default function Review() {
  const { state, clearMistakes } = useStore();
  const { task, finish, done } = useTask();
  const since = addDays(todayKey(), -7);
  const recent = state.mistakes.filter((m) => m.date >= since);
  const older = state.mistakes.length - recent.length;
  const bySource = recent.reduce((acc, m) => ((acc[m.source] ||= []).push(m), acc), {});

  return (
    <>
      <PageHead kicker="Weekly review" title="Your mistakes" sub="For each one, find out why the right answer is right. That is where the improvement happens." back={task ? '/' : '/practice'} />
      <div className="stack" style={{ maxWidth: 860 }}>
        {!recent.length && (
          <div className="card stack">
            <p>No mistakes saved in the last 7 days. Do some Reading, Listening or Grammar practice, and wrong answers will collect here.</p>
            <div className="row"><Link className="btn" to="/practice">Practice</Link></div>
          </div>
        )}
        {Object.entries(bySource).map(([source, list]) => (
          <section className="card stack" key={source}>
            <h2>{source}</h2>
            {list.map((m, i) => (
              <div key={i} className="stack" style={{ gap: 2, paddingTop: 10, borderTop: i ? '1px solid var(--line)' : 0 }}>
                <p>{m.prompt}</p>
                <div className="row small"><span className="chip bad">yours</span> {m.yours} <span className="chip ok" style={{ marginLeft: 8 }}>answer</span> {m.answer}<span className="spacer" />
                  <ExplainButton label="Why?" prompt={`In my IELTS practice (${m.source}) I got this wrong: "${m.prompt}". My answer: "${m.yours}". Correct answer: "${m.answer}". Explain why, and give me a rule or strategy so I don't repeat the mistake.`} /></div>
              </div>
            ))}
          </section>
        ))}
        <TaskDone show={done} />
        <div className="row">
          {!done && task && <button type="button" className="btn primary" onClick={finish}>I’ve reviewed these</button>}
          <span className="spacer" />
          {state.mistakes.length > 0 && <button type="button" className="btn ghost sm" onClick={() => window.confirm('Delete all saved mistakes?') && clearMistakes()}>Clear all ({state.mistakes.length}{older ? `, ${older} older` : ''})</button>}
        </div>
      </div>
    </>
  );
}
