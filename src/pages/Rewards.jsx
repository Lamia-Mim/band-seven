import { Link, useParams } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { TIPS, PHRASE_PACKS, PHASE_GUIDES } from '../data/rewards.js';
import { MASTERCLASSES } from '../data/masterclasses.js';
import { BADGES, LEVELS, levelFor, xpFor } from '../lib/progress.js';
import { sayWord } from '../lib/speech.js';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';
import { Icon } from '../components/icons.jsx';

export default function Rewards() {
  const { state, plan } = useStore();
  const { task, finish, done } = useTask();
  const lvl = levelFor(xpFor(plan, state.done));
  const { tips, packs, guides, shields = 0 } = state.unlocked;

  return (
    <>
      <PageHead kicker="Your rewards" title="Level up, unlock what matters" sub="Every task earns XP. Levels unlock masterclasses; streaks earn phrase packs and shields; every finished day adds an examiner insight." back={task ? '/' : undefined} />
      <div className="stack" style={{ gap: 26 }}>
        {task && <div className="row"><TaskDone show={done} />{!done && <button type="button" className="btn primary" onClick={finish}>I’ve reviewed my insights</button>}</div>}

        <section className="level-card">
          <div className="level-badge">{lvl.level}</div>
          <div>
            <p className="kicker" style={{ color: 'rgba(255,255,255,.85)' }}>Level {lvl.level} of {LEVELS.length}</p>
            <h2 style={{ fontSize: 28 }}>{lvl.name}</h2>
            <div className="xpbar"><i style={{ width: `${Math.round(lvl.progress * 100)}%` }} /></div>
            <p className="small" style={{ marginTop: 8, opacity: 0.9 }}>{lvl.next ? `${lvl.xp} / ${lvl.next} XP · ${lvl.next - lvl.xp} XP to ${LEVELS[lvl.level].name}` : `${lvl.xp} XP · top level reached`}</p>
            <div className="row" style={{ marginTop: 10 }}>
              <span className="chip" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><Icon name="shield" width="14" />{shields} streak shield{shields === 1 ? '' : 's'}</span>
              <span className="chip" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><Icon name="rewards" width="14" />{state.badges.length} badges</span>
            </div>
          </div>
        </section>

        <section className="stack">
          <h2>Masterclasses</h2>
          <div className="mc-grid">
            {MASTERCLASSES.map((m) => (lvl.level >= m.level ? (
              <Link key={m.id} to={`/masterclass/${m.id}`} className="mc">
                <span className="chip accent" style={{ justifySelf: 'start' }}>Level {m.level}</span>
                <h3>{m.title}</h3>
                <p className="small muted">{m.why}</p>
              </Link>
            ) : (
              <div key={m.id} className="mc locked">
                <span className="chip" style={{ justifySelf: 'start' }}><Icon name="lock" width="13" />Level {m.level}</span>
                <h3>{m.title}</h3>
                <p className="small">Reach level {m.level} ({LEVELS[m.level - 1].name}) to unlock.</p>
              </div>
            )))}
          </div>
        </section>

        <section className="stack">
          <h2>Badges</h2>
          <div className="badges">
            {BADGES.map((b) => {
              const has = state.badges.includes(b.id);
              return (
                <div key={b.id} className={`badge-tile ${has ? '' : 'locked'}`}>
                  <span className="medal"><Icon name={has ? 'rewards' : 'lock'} width="26" height="26" /></span>
                  <b>{b.title}</b><span>{b.desc}</span>
                </div>
              );
            })}
          </div>
        </section>

        {guides.length > 0 && (
          <section className="stack">
            <h2>Phase guides</h2>
            <div className="tips">{[...guides].sort().map((g) => <article className="tipcard" key={g}><p className="cat">Phase {g + 1}</p><h3>{PHASE_GUIDES[g].title}</h3><p>{PHASE_GUIDES[g].body}</p></article>)}</div>
          </section>
        )}

        <section className="stack">
          <h2>Band 7 phrase packs</h2>
          <div className="tips">
            {PHRASE_PACKS.map((p, i) => (i < packs ? (
              <article className="tipcard" key={p.title}><p className="cat">Pack {i + 1}</p><h3>{p.title}</h3><ul className="small" style={{ margin: 0, paddingLeft: 18 }}>{p.phrases.map((x) => <li key={x}>{x}</li>)}</ul></article>
            ) : (
              <article className="tipcard locked" key={p.title}><p className="cat">Pack {i + 1}</p><h3>{p.title}</h3><p>{i === packs ? 'Your next 7-day streak unlocks this.' : `Unlocks after pack ${i}.`}</p></article>
            )))}
          </div>
        </section>

        <section className="stack">
          <h2>Examiner insights <span className="muted small">({tips}/{TIPS.length})</span></h2>
          <div className="tips">
            {TIPS.map((t, i) => (i < tips ? (
              <article className="tipcard" key={i}><p className="cat">#{i + 1} · {t.cat}</p><h3>{t.title}</h3><p>{t.body}</p></article>
            ) : i < tips + 3 ? (
              <article className="tipcard locked" key={i}><p className="cat">#{i + 1}</p><h3>Locked</h3><p>Finish {i + 1 - tips === 1 ? 'one more day' : `${i + 1 - tips} more days`} to unlock.</p></article>
            ) : null))}
          </div>
        </section>
      </div>
    </>
  );
}

export function Masterclass() {
  const { id } = useParams();
  const { state, plan } = useStore();
  const m = MASTERCLASSES.find((x) => x.id === id);
  const lvl = levelFor(xpFor(plan, state.done));
  if (!m) return <PageHead kicker="Masterclass" title="Not found" back="/rewards" />;
  if (lvl.level < m.level) {
    return (
      <>
        <PageHead kicker={`Masterclass · level ${m.level}`} title={m.title} back="/rewards" />
        <div className="card stack"><p>This masterclass unlocks at level {m.level}. You are level {lvl.level}: {lvl.next - lvl.xp} XP to go to the next level.</p><Link className="btn primary" to="/" style={{ justifySelf: 'start' }}>Back to today’s tasks</Link></div>
      </>
    );
  }
  return (
    <>
      <PageHead kicker={`Masterclass · unlocked at level ${m.level}`} title={m.title} sub={m.why} back="/rewards" />
      <div className="mc-body">
        {m.sections.map((s, i) => (
          <section className="card stack" key={i}>
            <h2>{s.heading}</h2>
            {s.kind === 'text' && <p style={{ lineHeight: 1.75 }}>{s.body}</p>}
            {s.kind === 'list' && <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 6 }}>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>}
            {s.kind === 'compare' && (
              <div className="compare">
                <div><p className="kicker" style={{ marginBottom: 6 }}>{s.left.label}</p>{s.left.text}</div>
                <div><p className="kicker" style={{ marginBottom: 6, color: 'var(--brand)' }}>{s.right.label}</p>{s.right.text}</div>
              </div>
            )}
            {s.kind === 'table' && (
              <table className="data"><tbody>{s.rows.map(([a, b]) => <tr key={a}><td><b>{a}</b></td><td className={/[ঀ-৿]/.test(b) ? 'bn' : ''}>{b}</td></tr>)}</tbody></table>
            )}
            {s.kind === 'say' && (
              <>
                <p>{s.body}</p>
                <div className="row">
                  {s.words.map((w) => (
                    <button key={w} type="button" className="btn sm" onClick={() => sayWord(w.toLowerCase())}><Icon name="volume" />{w}</button>
                  ))}
                </div>
              </>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
