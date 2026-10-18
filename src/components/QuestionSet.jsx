import { isCorrect, optionValue } from '../lib/score.js';

const TFNG = ['TRUE', 'FALSE', 'NOT GIVEN'];

// Renders IELTS question groups. Before marking, answers are editable; after
// marking (`marked`), each question shows right/wrong and the correct answer.
export default function QuestionSet({ groups, answers, setAnswer, marked }) {
  return (
    <div>
      {groups.map((g, gi) => {
        const first = g.items[0].n, last = g.items[g.items.length - 1].n;
        return (
          <section className="qgroup" key={gi}>
            <p className="kicker">Questions {first}{last !== first ? `–${last}` : ''}</p>
            <p className="instruction">{g.instruction}</p>
            {g.type === 'choose' && g.options.some((o) => /^[ivx]+\s{2}/.test(o)) && (
              <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
                {g.options.map((o) => <li key={o}>{o}</li>)}
              </ul>
            )}
            {g.items.map((item) => {
              const given = answers[item.n] ?? '';
              const right = marked && isCorrect(g, item, given);
              const name = `q${item.n}`;
              return (
                <div key={item.n} className={`q ${marked ? (right ? 'right' : 'wrong') : ''}`}>
                  <div><span className="q__n">{item.n}</span>{item.prompt}</div>
                  {g.type === 'tfng' && (
                    <div className="q__opts">
                      {TFNG.map((o) => (
                        <label className="opt" key={o}>
                          <input type="radio" name={name} value={o} checked={given === o} disabled={marked} onChange={() => setAnswer(item.n, o)} />{o}
                        </label>
                      ))}
                    </div>
                  )}
                  {g.type === 'mcq' && (
                    <div className="q__opts col">
                      {item.options.map((o, i) => {
                        const letter = String.fromCharCode(65 + i);
                        return (
                          <label className="opt" key={letter}>
                            <input type="radio" name={name} value={letter} checked={given === letter} disabled={marked} onChange={() => setAnswer(item.n, letter)} />
                            <b>{letter}</b> {o}
                          </label>
                        );
                      })}
                    </div>
                  )}
                  {g.type === 'choose' && (
                    <select value={given} disabled={marked} onChange={(e) => setAnswer(item.n, e.target.value)} aria-label={`Answer ${item.n}`} style={{ maxWidth: 360 }}>
                      <option value="">Choose…</option>
                      {g.options.map((o) => <option key={o} value={optionValue(o)}>{optionValue(o)}</option>)}
                    </select>
                  )}
                  {g.type === 'gap' && (
                    <input type="text" value={given} disabled={marked} onChange={(e) => setAnswer(item.n, e.target.value)} aria-label={`Answer ${item.n}`} autoComplete="off" spellCheck="false" style={{ maxWidth: 320 }} />
                  )}
                  {marked && !right && (
                    <p className="q__answer">
                      Answer: {g.type === 'gap' ? item.answer.join(' / ') : g.type === 'mcq' ? `${item.answer}) ${item.options[item.answer.charCodeAt(0) - 65]}` : item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
