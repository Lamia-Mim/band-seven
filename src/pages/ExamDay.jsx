import { useState } from 'react';
import { PageHead, TaskDone, useTask } from '../components/ui.jsx';

const ITEMS = [
  ['Documents', ['The same ID (passport or NID) you used to register', 'Your test confirmation email or letter', 'Check the time and place of your Speaking test (it can be on a different day)']],
  ['The night before', ['Pack a clear water bottle and pencils, if allowed by your centre', 'Plan your route and leave extra time for traffic', 'Sleep early: no new studying tonight']],
  ['On the day', ['Eat a proper breakfast', 'Arrive at least 30 minutes early', 'Phones and watches go in the storage area before the test']],
  ['During the test', ['Read every instruction and word limit', 'Listening: read ahead and guess anything you miss', 'Reading: about 20 minutes per passage; never leave a blank', 'Writing: Task 2 first if you prefer, and keep 3 minutes to proofread']],
];

export default function ExamDay() {
  const { task, finish, done } = useTask();
  const [checked, setChecked] = useState({});
  return (
    <>
      <PageHead kicker="Final preparation" title="Exam-day checklist" back={task ? '/' : undefined} />
      <div className="stack" style={{ maxWidth: 680 }}>
        <div className="card checklist">
          {ITEMS.map(([head, list]) => (
            <div key={head}>
              <h4>{head}</h4>
              {list.map((t) => <label key={t}><input type="checkbox" checked={!!checked[t]} onChange={() => setChecked({ ...checked, [t]: !checked[t] })} />{t}</label>)}
            </div>
          ))}
        </div>
        <p className="muted small">Rules differ a little between test centres. Check the instructions in your confirmation email.</p>
        <TaskDone show={done} />
        {task && !done && <div><button type="button" className="btn primary" onClick={finish}>I’m ready</button></div>}
      </div>
    </>
  );
}
