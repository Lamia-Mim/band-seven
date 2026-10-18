import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from './icons.jsx';
import { useStore } from '../lib/store.jsx';
import { taskFromSearch } from '../lib/tasks.js';

export function PageHead({ kicker, title, sub, back, children }) {
  return (
    <>
      {back && <Link className="back" to={back}><Icon name="left" width="16" height="16" />Back</Link>}
      <header className="head">
        <div>
          {kicker && <p className="kicker">{kicker}</p>}
          <h1>{title}</h1>
          {sub && <p>{sub}</p>}
        </div>
        {children && <div className="row">{children}</div>}
      </header>
    </>
  );
}

// The task this page was opened for (from "?task=date~id"), and a way to
// mark it done when the activity is finished.
export function useTask() {
  const { search } = useLocation();
  const { completeTask, state } = useStore();
  const task = taskFromSearch(search);
  const done = !!task && !!state.done[task.date]?.includes(task.id);
  return {
    task,
    done,
    finish: () => task && completeTask(task.date, task.id),
  };
}

export function TaskDone({ show }) {
  if (!show) return null;
  return (
    <div className="notice ok row">
      <Icon name="check" width="18" height="18" />
      <span>Task complete.</span>
      <span className="spacer" />
      <Link className="btn sm" to="/">Back to today</Link>
    </div>
  );
}

// Countdown. Calls onEnd when it reaches zero.
export function useCountdown(seconds, { running, onEnd } = {}) {
  const [left, setLeft] = useState(seconds);
  const end = useRef(onEnd);
  end.current = onEnd;
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setLeft((l) => {
      if (l <= 1) { clearInterval(id); end.current?.(); return 0; }
      return l - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [running]);
  return [left, setLeft];
}

export const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export function Timer({ minutes, onEnd, autoStart = false }) {
  const [running, setRunning] = useState(autoStart);
  const [left] = useCountdown(minutes * 60, { running, onEnd });
  return (
    <div className="row">
      <span className={`timer ${left < 120 ? 'low' : ''}`} aria-live="off">{mmss(left)}</span>
      <button type="button" className="btn sm" onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : left === minutes * 60 ? 'Start timer' : 'Resume'}</button>
    </div>
  );
}

export function Ring({ value, total, size = 96 }) {
  const r = 40, c = 2 * Math.PI * r;
  const f = total ? value / total : 0;
  return (
    <svg className="ring" viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${value} of ${total} done`}>
      <circle className="track" cx="50" cy="50" r={r} />
      <circle className="bar" cx="50" cy="50" r={r} strokeDasharray={c} strokeDashoffset={c * (1 - f)} transform="rotate(-90 50 50)" />
      <text x="50" y="57" textAnchor="middle">{value}/{total}</text>
    </svg>
  );
}

export function wordCount(text) {
  return (text.trim().match(/\S+/g) || []).length;
}
