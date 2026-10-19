import { useParams } from 'react-router-dom';
import { READING } from '../data/index.js';
import QuestionSet from '../components/QuestionSet.jsx';
import { PageHead, TaskDone, Timer, useTask } from '../components/ui.jsx';
import { ScoreSummary, useMarking } from '../components/useMarking.jsx';
import { explainReading } from '../lib/ai/explain.js';

export function Passage({ passage }) {
  return (
    <article className="card passage">
      <p className="kicker">{passage.level}</p>
      <h2 style={{ margin: '4px 0 14px' }}>{passage.title}</h2>
      {passage.paragraphs.map((p, i) => (
        <p key={i}>{passage.lettered && <span className="para-letter">{String.fromCharCode(65 + i)}</span>}{p}</p>
      ))}
    </article>
  );
}

export default function Reading() {
  const { id } = useParams();
  const passage = READING.find((r) => r.id === id);
  const { task, finish, done } = useTask();
  const m = useMarking(passage?.groups || [], { section: 'reading', label: passage?.title, finish });
  if (!passage) return <p>Passage not found.</p>;
  const total = passage.groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <PageHead kicker="Reading" title={passage.title} sub={`${total} questions · about 20 minutes`} back={task ? '/' : '/practice'}>
        {!m.result && <Timer minutes={20} />}
      </PageHead>
      <div className="stack">
        <ScoreSummary result={m.result} />
        <TaskDone show={!!m.result && done} />
        <div className="split">
          <Passage passage={passage} />
          <div className="card">
            <QuestionSet groups={passage.groups} answers={m.answers} setAnswer={m.setAnswer} marked={!!m.result} explain={(g, item, given) => explainReading(passage, g, item, given)} />
            {!m.result && (
              <div className="row" style={{ marginTop: 20 }}>
                <span className="muted small">{m.answered}/{total} answered</span>
                <span className="spacer" />
                <button type="button" className="btn primary" onClick={m.submit}>Check answers</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
