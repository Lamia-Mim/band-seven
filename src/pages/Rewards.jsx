import { useStore } from '../lib/store.jsx';
import { TIPS, PHRASE_PACKS, PHASE_GUIDES } from '../data/rewards.js';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';

export default function Rewards() {
  const { state } = useStore();
  const { task, finish, done } = useTask();
  const { tips, packs, guides } = state.unlocked;

  return (
    <>
      <PageHead kicker={`${tips} of ${TIPS.length} cards · ${packs} of ${PHRASE_PACKS.length} phrase packs`} title="Rewards"
        sub="Finish every task in a day to unlock the next Examiner Secret. Keep a 7-day streak for a phrase pack, and finish a phase for its guide." back={task ? '/' : undefined} />
      <div className="stack">
        {task && (
          <div className="row">
            <TaskDone show={done} />
            {!done && <button type="button" className="btn primary" onClick={finish}>I’ve read my cards</button>}
          </div>
        )}

        {guides.length > 0 && (
          <section className="stack">
            <h2>Phase guides</h2>
            <div className="tips">
              {[...guides].sort().map((g) => (
                <article className="tipcard" key={g}><p className="cat">Phase {g + 1}</p><h3>{PHASE_GUIDES[g].title}</h3><p>{PHASE_GUIDES[g].body}</p></article>
              ))}
            </div>
          </section>
        )}

        <section className="stack">
          <h2>Band 7 phrase packs</h2>
          <div className="tips">
            {PHRASE_PACKS.map((p, i) => (i < packs ? (
              <article className="tipcard" key={p.title}><p className="cat">Pack {i + 1}</p><h3>{p.title}</h3><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{p.phrases.map((x) => <li key={x}>{x}</li>)}</ul></article>
            ) : (
              <article className="tipcard locked" key={p.title}><p className="cat">Pack {i + 1}</p><h3>Locked</h3><p>{i === packs ? 'Reach your next 7-day streak to unlock.' : `Unlocks after pack ${i}.`}</p></article>
            )))}
          </div>
        </section>

        <section className="stack">
          <h2>Examiner Secrets</h2>
          <div className="tips">
            {TIPS.map((t, i) => (i < tips ? (
              <article className="tipcard" key={i}><p className="cat">#{i + 1} · {t.cat}</p><h3>{t.title}</h3><p>{t.body}</p></article>
            ) : (
              <article className="tipcard locked" key={i}><p className="cat">#{i + 1}</p><h3>Locked</h3><p>Finish {i + 1 - tips === 1 ? 'one more day' : `${i + 1 - tips} more days`} to unlock.</p></article>
            )))}
          </div>
        </section>
      </div>
    </>
  );
}
