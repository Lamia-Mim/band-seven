import { useEffect, useRef, useState } from 'react';
import { canSpeak, playScript } from '../lib/speech.js';
import { Icon } from './icons.jsx';

// Plays one or more Listening sections with the browser's voices. Like the
// real test it plays once, unless replay is switched on for practice.
export default function ScriptPlayer({ sections, locked }) {
  const [state, setState] = useState('idle'); // idle | playing | done
  const [pos, setPos] = useState({ s: 0, line: 0 });
  const [replay, setReplay] = useState(false);
  const [rate, setRate] = useState(1);
  const ctl = useRef(null);

  useEffect(() => () => ctl.current?.stop(), []);

  if (!canSpeak()) {
    return <p className="notice warn">This browser can’t play the recording aloud. Read the script below instead after answering, or try Chrome or Edge.</p>;
  }

  function play(from = 0) {
    if (from >= sections.length) { setState('done'); return; }
    setState('playing');
    const sec = sections[from];
    ctl.current = playScript(sec.script, sec.speakers, {
      rate,
      onLine: (line) => setPos({ s: from, line }),
      onEnd: () => play(from + 1),
    });
  }

  function stop() {
    ctl.current?.stop();
    setState('done');
  }

  const sec = sections[pos.s];
  return (
    <div className="card stack">
      <div className="player">
        {state !== 'playing'
          ? <button type="button" className="btn primary" onClick={() => play(0)} disabled={locked || (state === 'done' && !replay)}><Icon name="play" />{state === 'done' ? 'Play again' : 'Play recording'}</button>
          : <button type="button" className="btn" onClick={stop}><Icon name="stop" />Stop</button>}
        <span className="muted small">
          {state === 'playing' ? `${sections.length > 1 ? `Section ${pos.s + 1} · ` : ''}line ${pos.line + 1} of ${sec.script.length}` : state === 'done' ? 'Finished' : 'Read the questions first, then press play.'}
        </span>
        <span className="spacer" />
        <label className="row small"><input type="checkbox" checked={replay} onChange={(e) => setReplay(e.target.checked)} />Allow replay (practice)</label>
        <select value={rate} onChange={(e) => setRate(+e.target.value)} aria-label="Speed" style={{ width: 'auto' }} disabled={state === 'playing'}>
          <option value={0.85}>Slower</option><option value={1}>Normal speed</option><option value={1.1}>Faster</option>
        </select>
      </div>
      <p className="muted small">Played by your browser’s built-in voices, so it sounds less natural than the real test. Use official recordings too (see Library).</p>
    </div>
  );
}

export function Script({ section }) {
  return (
    <details className="card script">
      <summary><b>Script: {section.title}</b></summary>
      <div style={{ marginTop: 10 }}>
        {section.script.map(([who, text], i) => (
          <p key={i}><span className="who">{section.speakers[who].name}:</span>{text}</p>
        ))}
      </div>
    </details>
  );
}
