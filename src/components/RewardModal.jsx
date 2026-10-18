import { Link } from 'react-router-dom';
import { useStore } from '../lib/store.jsx';
import { TIPS, PHRASE_PACKS, PHASE_GUIDES } from '../data/rewards.js';
import { Icon } from './icons.jsx';

// Shows each newly unlocked reward, one at a time
export default function RewardModal() {
  const { state, dismissReward } = useStore();
  const event = state.pending[0];
  if (!event) return null;

  let kicker, title, body;
  if (event.type === 'tip') {
    const t = TIPS[event.index];
    kicker = `Day complete · Examiner Secret #${event.index + 1}`;
    title = t.title;
    body = <><p className="chip gold" style={{ justifySelf: 'start' }}>{t.cat}</p><p>{t.body}</p></>;
  } else if (event.type === 'pack') {
    const p = PHRASE_PACKS[event.index];
    kicker = '7-day streak · Band 7 phrase pack';
    title = p.title;
    body = <ul>{p.phrases.map((x) => <li key={x}>{x}</li>)}</ul>;
  } else {
    const g = PHASE_GUIDES[event.index];
    kicker = `Phase ${event.index + 1} complete`;
    title = g.title;
    body = <p>{g.body}</p>;
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <div className="modal">
        <div className="badge"><Icon name={event.type === 'tip' ? 'star' : event.type === 'pack' ? 'rewards' : 'flag'} /></div>
        <p className="kicker">{kicker}</p>
        <h2 id="reward-title">{title}</h2>
        {body}
        <div className="row">
          <Link className="btn ghost" to="/rewards" onClick={dismissReward}>See all rewards</Link>
          <span className="spacer" />
          <button type="button" className="btn primary" onClick={dismissReward} autoFocus>Keep it</button>
        </div>
      </div>
    </div>
  );
}
