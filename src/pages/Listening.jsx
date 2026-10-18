import { useParams } from 'react-router-dom';
import { LISTENING } from '../data/index.js';
import QuestionSet from '../components/QuestionSet.jsx';
import ScriptPlayer, { Script } from '../components/ScriptPlayer.jsx';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { ScoreSummary, useMarking } from '../components/useMarking.jsx';

export default function Listening() {
  const { id } = useParams();
  const section = LISTENING.find((l) => l.id === id);
  const { task, finish, done } = useTask();
  const m = useMarking(section?.groups || [], { section: 'listening', label: section?.title, finish });
  if (!section) return <p>Section not found.</p>;

  return (
    <>
      <PageHead kicker={`Listening · ${section.level}`} title={section.title} sub="10 questions. Read them before you press play." back={task ? '/' : '/practice'} />
      <div className="stack" style={{ maxWidth: 820 }}>
        <ScoreSummary result={m.result} />
        <TaskDone show={!!m.result && done} />
        <ScriptPlayer sections={[section]} />
        <div className="card">
          <QuestionSet groups={section.groups} answers={m.answers} setAnswer={m.setAnswer} marked={!!m.result} />
          {!m.result && (
            <div className="row" style={{ marginTop: 20 }}>
              <span className="muted small">{m.answered}/10 answered</span>
              <span className="spacer" />
              <button type="button" className="btn primary" onClick={m.submit}>Check answers</button>
            </div>
          )}
        </div>
        {m.result && <Script section={section} />}
      </div>
    </>
  );
}
