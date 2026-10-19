import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/icons.jsx';
import { CUE_CARDS, PART1 } from '../data/index.js';
import SpeakingSession from '../components/SpeakingSession.jsx';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { useStore } from '../lib/store.jsx';

// Offer the voice examiner first; recording yourself stays available below
function AiChoice({ cardRef }) {
  const { search } = useLocation();
  const t = new URLSearchParams(search).get('task');
  return (
    <Link to={`/talk?mode=test&card=${cardRef}${t ? `&task=${t}` : ''}`} className="card link raised s-speaking" style={{ display: 'flex', gap: 16, alignItems: 'center', borderTop: '4px solid var(--speaking)' }}>
      <span className="task__icon" style={{ width: 52, height: 52 }}><Icon name="wave" /></span>
      <span style={{ flex: 1 }}><b style={{ fontFamily: 'var(--display)', fontSize: 17 }}>Practise with the AI examiner</b><br /><span className="small muted">A real conversation by voice: it asks, listens, follows up, then gives band estimates and corrections.</span></span>
      <span className="btn skill sm">Start</span>
    </Link>
  );
}

function useFinish(label) {
  const { addScore } = useStore();
  const { finish } = useTask();
  return (stats) => {
    addScore({ section: 'speaking', label, raw: stats.words, total: null, band: null, wpm: stats.wpm, seconds: stats.seconds });
    finish();
  };
}

export function SpeakingHub() {
  const nav = useNavigate();
  return (
    <>
      <PageHead kicker="Speaking" title="Speaking practice" sub="Talk with the AI examiner by voice, or record yourself and check your fluency." back="/practice">
        <Link className="btn" to="/talk"><Icon name="wave" />Voice room</Link>
        <button type="button" className="btn primary" onClick={() => nav(`/speaking/card/${Math.floor(Math.random() * CUE_CARDS.length)}`)}>Random cue card</button>
      </PageHead>
      <div className="stack">
        <section className="card stack">
          <h2>Full test</h2>
          <p className="muted">Part 1 questions, a Part 2 cue card and Part 3 discussion, about 14 minutes, recorded in one go.</p>
          <div><Link className="btn" to={`/speaking/full/${Math.floor(Math.random() * CUE_CARDS.length)}`}>Start a full test</Link></div>
        </section>
        <section className="card stack">
          <h2>Part 1 topics</h2>
          <div className="row">{PART1.map((p, i) => <Link key={p.topic} className="btn sm" to={`/speaking/part1/${i}`}>{p.topic}</Link>)}</div>
        </section>
        <section className="card stack">
          <h2>Part 2 cue cards</h2>
          <div className="grid2">
            {CUE_CARDS.map((c, i) => (
              <Link key={c.title} to={`/speaking/card/${i}`} className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <p className="kicker">Card {i + 1}</p><p className="small">{c.title}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function SpeakingCard() {
  const ref = +useParams().ref % CUE_CARDS.length;
  const card = CUE_CARDS[ref];
  const { task, done } = useTask();
  const onFinish = useFinish(`Cue card: ${card.title}`);
  return (
    <>
      <PageHead kicker="Speaking · Part 2" title="Cue card" sub="One minute to prepare, then talk for up to two minutes." back={task ? '/' : '/speaking'} />
      <div className="stack" style={{ maxWidth: 760 }}>
        <TaskDone show={done} />
        <AiChoice cardRef={ref} />
        <p className="kicker" style={{ textAlign: 'center' }}>or record yourself</p>
        <SpeakingSession key={ref} segments={[{ type: 'card', card }]} onFinish={onFinish}
          extra={(
            <section className="card stack">
              <h3>Part 3: keep going</h3>
              <p className="muted small">In the test, the examiner would now ask questions like these. Answer each one aloud for about a minute.</p>
              <ul style={{ margin: 0, paddingLeft: 20 }}>{card.part3.map((q) => <li key={q}>{q}</li>)}</ul>
            </section>
          )} />
      </div>
    </>
  );
}

export function SpeakingPart1() {
  const ref = +useParams().ref % PART1.length;
  const topic = PART1[ref];
  const { task, done } = useTask();
  const onFinish = useFinish(`Part 1: ${topic.topic}`);
  return (
    <>
      <PageHead kicker="Speaking · Part 1" title={topic.topic} sub="Short, natural answers: answer, reason, example." back={task ? '/' : '/speaking'} />
      <div className="stack" style={{ maxWidth: 760 }}>
        <TaskDone show={done} />
        <SpeakingSession key={ref} segments={topic.questions.map((text) => ({ type: 'q', part: 1, text }))} onFinish={onFinish} />
      </div>
    </>
  );
}

export function SpeakingFull() {
  const ref = +useParams().ref % CUE_CARDS.length;
  const card = CUE_CARDS[ref];
  const p1 = PART1[ref % PART1.length];
  const { task, done } = useTask();
  const onFinish = useFinish('Full speaking test');
  const segments = [
    ...p1.questions.map((text) => ({ type: 'q', part: 1, text })),
    { type: 'card', card },
    ...card.part3.map((text) => ({ type: 'q', part: 3, text })),
  ];
  return (
    <>
      <PageHead kicker="Speaking · full test" title="Parts 1, 2 and 3" sub={`Part 1: ${p1.topic} · Part 2: ${card.title}`} back={task ? '/' : '/speaking'} />
      <div className="stack" style={{ maxWidth: 760 }}>
        <TaskDone show={done} />
        <AiChoice cardRef={ref} />
        <p className="kicker" style={{ textAlign: 'center' }}>or record yourself</p>
        <SpeakingSession key={ref} segments={segments} onFinish={onFinish} />
      </div>
    </>
  );
}
