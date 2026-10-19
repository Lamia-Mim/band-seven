import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { TIPS, PHRASE_PACKS, PHASE_GUIDES } from '../data/rewards.js';
import { MASTERCLASSES } from '../data/masterclasses.js';
import { BADGES, LEVELS } from '../lib/progress.js';
import { confetti } from '../lib/confetti.js';
import { Icon } from './icons.jsx';

// Shows each newly unlocked reward, one at a time, with a little celebration
export default function RewardModal() {
  const { state, dismissReward } = useStore();
  const { pathname } = useLocation();
  // Don't interrupt a speaking session or a timed mock: rewards wait for the next page
  const held = /^\/(talk|mock)/.test(pathname);
  const event = held ? null : state.pending[0];

  useEffect(() => {
    if (event && ['tip', 'level', 'badge', 'guide'].includes(event.type)) confetti({ count: event.type === 'level' ? 220 : 120 });
  }, [event]);

  if (!event) return null;

  let icon = 'sparkle', kicker = '', title = '', body = null, link = null;
  if (event.type === 'tip') {
    const t = TIPS[event.index];
    kicker = `Day complete · Examiner insight #${event.index + 1}`;
    title = t.title;
    body = <><span className="chip gold" style={{ justifySelf: 'start' }}>{t.cat}</span><p>{t.body}</p></>;
  } else if (event.type === 'level') {
    const mc = MASTERCLASSES.find((m) => m.id === event.masterclass);
    icon = 'bolt';
    kicker = `Level ${event.level} reached`;
    title = `You’re now: ${LEVELS[event.level - 1].name}`;
    body = mc
      ? <p>New masterclass unlocked: <b>{mc.title}</b>. {mc.why}</p>
      : <p>Keep going: the next level unlocks another masterclass.</p>;
    if (mc) link = <Link className="btn primary" to={`/masterclass/${mc.id}`} onClick={dismissReward}>Open the masterclass</Link>;
  } else if (event.type === 'badge') {
    const b = BADGES.find((x) => x.id === event.id);
    icon = 'rewards';
    kicker = 'Badge earned';
    title = b?.title ?? 'New badge';
    body = <p>{b?.desc}</p>;
  } else if (event.type === 'pack') {
    const p = PHRASE_PACKS[event.index];
    kicker = '7-day streak · Band 7 phrase pack';
    title = p.title;
    body = <ul>{p.phrases.map((x) => <li key={x}>{x}</li>)}</ul>;
  } else if (event.type === 'shield') {
    icon = 'shield';
    kicker = '7-day streak bonus';
    title = 'Streak shield earned';
    body = <p>If you miss a study day, a shield keeps your streak alive automatically. You have {event.count} {event.count === 1 ? 'shield' : 'shields'} (up to 3).</p>;
  } else if (event.type === 'shield-used') {
    icon = 'shield';
    kicker = 'Streak protected';
    title = 'A shield saved your streak';
    body = <p>You missed {event.count === 1 ? 'a day' : `${event.count} days`}, so {event.count === 1 ? 'a shield was' : 'shields were'} used to keep your streak. Let’s get back to it today.</p>;
  } else {
    const g = PHASE_GUIDES[event.index];
    icon = 'flag';
    kicker = `Phase ${event.index + 1} complete`;
    title = g.title;
    body = <p>{g.body}</p>;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <div className="modal">
        <div className="badge"><Icon name={icon} /></div>
        <p className="kicker">{kicker}</p>
        <h2 id="reward-title">{title}</h2>
        {body}
        <div className="row">
          <Link className="btn ghost" to="/rewards" onClick={dismissReward}>All rewards</Link>
          <span className="spacer" />
          {link}
          <button type="button" className={`btn ${link ? '' : 'primary'}`} onClick={dismissReward} autoFocus>{link ? 'Later' : 'Keep going'}</button>
        </div>
      </div>
    </div>
  );
}
