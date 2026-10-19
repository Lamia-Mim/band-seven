import { useEffect, useRef, useState } from 'react';
import { canRecord, canSpeak, canTranscribe, playScript, speechStats, startRecording, startTranscript } from '../lib/speech.js';
import { SPEAKING_CHECK } from '../data/speaking.js';
import { mmss, useCountdown } from './ui.jsx';
import { Icon } from './icons.jsx';
import Markdown from './Markdown.jsx';
import { useAi } from './ai/Ai.jsx';
import { speakingFeedbackPrompt } from '../lib/ai/prompts.js';

// A speaking practice made of segments:
//   { type: 'q', part, text }   a question to answer
//   { type: 'card', card }      a Part 2 cue card: 1 minute to prepare, 2 to talk
// Records the whole session, transcribes it where the browser can, and shows
// statistics and a self-check at the end.
export default function SpeakingSession({ segments, onFinish, extra }) {
  const [phase, setPhase] = useState('ready'); // ready | run | done
  const [i, setI] = useState(0);
  const [stage, setStage] = useState('answer'); // for cards: prep | talk
  const [text, setText] = useState('');
  const [audio, setAudio] = useState(null);
  const [stats, setStats] = useState(null);
  const [micError, setMicError] = useState('');
  const rec = useRef(null), tr = useRef(null), started = useRef(0), prepTime = useRef(0), prepStart = useRef(0);

  const seg = segments[i];
  const isCard = seg?.type === 'card';

  useEffect(() => () => { tr.current?.stop(); rec.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  async function start() {
    setMicError('');
    if (canRecord()) {
      try { rec.current = await startRecording(); } catch { setMicError('Microphone access was blocked, so this session won’t be recorded. You can still practise.'); }
    } else setMicError('This browser cannot record audio. You can still practise with the timer.');
    tr.current = startTranscript(setText);
    started.current = Date.now();
    setI(0);
    setStage(segments[0].type === 'card' ? 'prep' : 'answer');
    if (segments[0].type === 'card') prepStart.current = Date.now();
    setPhase('run');
  }

  function next() {
    if (isCard && stage === 'prep') {
      prepTime.current += Date.now() - prepStart.current;
      setStage('talk');
      return;
    }
    if (i < segments.length - 1) {
      const n = segments[i + 1];
      setI(i + 1);
      setStage(n.type === 'card' ? 'prep' : 'answer');
      if (n.type === 'card') prepStart.current = Date.now();
    } else finish();
  }

  async function finish() {
    const finalText = tr.current?.stop() ?? '';
    tr.current = null;
    const blob = await rec.current?.stop();
    rec.current = null;
    if (blob) setAudio(URL.createObjectURL(blob));
    const seconds = Math.max(1, Math.round((Date.now() - started.current - prepTime.current) / 1000));
    const s = { ...speechStats(finalText || text, seconds), seconds, transcribed: canTranscribe() };
    setStats(s);
    setPhase('done');
    onFinish?.(s);
  }

  const hear = (q) => canSpeak() && playScript([['E', q]], { E: { voice: 'female' } });

  if (phase === 'ready') {
    return (
      <div className="card stack">
        <p>{segments.length > 1 ? `This session has ${segments.length} parts.` : 'Read the task, then press start.'} Your answers are recorded on this device only, so you can listen back afterwards.</p>
        {!canTranscribe() && <p className="notice small">This browser can’t transcribe speech, so word counts won’t be shown. Chrome and Edge can.</p>}
        <div><button type="button" className="btn primary lg" onClick={start}><Icon name="mic" />Start speaking</button></div>
      </div>
    );
  }

  if (phase === 'run') {
    return (
      <div className="stack">
        {micError && <p className="notice warn">{micError}</p>}
        <div className="row">
          <span className="kicker">Part {isCard ? 2 : seg.part} · {i + 1} of {segments.length}</span>
          <span className="spacer" />
          {rec.current && <span className="row small"><span className="rec-dot" />Recording</span>}
        </div>
        {/* keyed so the countdown restarts cleanly for each stage */}
        {isCard ? <CardStage key={`${i}-${stage}`} card={seg.card} stage={stage} onDone={next} /> : (
          <div className="card stack">
            <h2>{seg.text}</h2>
            <p className="muted small">{seg.part === 1 ? 'Answer in 2–3 sentences: answer, reason, example.' : 'Give a longer answer: your view, a reason, an example, and maybe the other side.'}</p>
            <div className="row">
              {canSpeak() && <button type="button" className="btn sm" onClick={() => hear(seg.text)}><Icon name="volume" />Hear the question</button>}
              <span className="spacer" />
              <button type="button" className="btn primary" onClick={next}>{i < segments.length - 1 ? 'Next question' : 'Finish'}</button>
            </div>
          </div>
        )}
        {canTranscribe() && <div className="transcript" aria-live="polite">{text || 'Your words will appear here as you speak…'}</div>}
      </div>
    );
  }

  return (
    <div className="stack">
      {audio && <div className="card stack"><h3>Listen to yourself</h3><audio controls src={audio} style={{ width: '100%' }} /></div>}
      {stats?.transcribed && stats.words > 0 ? (
        <div className="card stack">
          <h3>Your speaking, in numbers</h3>
          <div className="stats">
            <div className="stat"><b>{stats.words}</b><span>words</span></div>
            <div className="stat"><b>{stats.wpm}</b><span>words per minute (fluent speech is often 120–160)</span></div>
            <div className="stat"><b>{stats.fillerTotal}</b><span>filler words {stats.fillers.length ? `(${stats.fillers.map((f) => `${f.word} ×${f.count}`).join(', ')})` : ''}</span></div>
            <div className="stat"><b>{stats.variety}%</b><span>different words (higher means more varied vocabulary)</span></div>
          </div>
          {stats.longWords.length > 0 && <p className="small">Longer words you used: {stats.longWords.join(', ')}</p>}
          <details><summary className="small">Show transcript</summary><p className="transcript">{text}</p></details>
        </div>
      ) : (
        <p className="notice">Practice time: {mmss(stats?.seconds ?? 0)}. {stats?.transcribed ? 'No speech was transcribed: check your microphone.' : ''}</p>
      )}
      {text.split(/\s+/).length > 15 && <TranscriptFeedback text={text} />}
      <div className="card checklist">
        <h3>Check yourself against Band 7</h3>
        {SPEAKING_CHECK.map(([crit, items]) => (
          <div key={crit}><h4>{crit}</h4>{items.map((t) => <label key={t}><input type="checkbox" />{t}</label>)}</div>
        ))}
      </div>
      {extra}
    </div>
  );
}

function CardStage({ card, stage, onDone }) {
  const [left] = useCountdown(stage === 'prep' ? 60 : 120, { running: true, onEnd: onDone });
  return (
    <div className="stack">
      <div className="cue">
        <h2>{card.title}</h2>
        <p className="small muted">You should say:</p>
        <ul>{card.points.map((p) => <li key={p}>{p}</li>)}</ul>
        <p>{card.explain}</p>
      </div>
      <div className="card row">
        <div>
          <p className="kicker">{stage === 'prep' ? 'Prepare: make notes' : 'Speak until the time ends'}</p>
          <p className="bigtime">{mmss(left)}</p>
        </div>
        <span className="spacer" />
        <button type="button" className="btn primary" onClick={onDone}>{stage === 'prep' ? 'Start talking now' : 'Finish'}</button>
      </div>
      {stage === 'prep' && <textarea rows="4" placeholder="Notes: key words for each point, plus one extra idea or story…" aria-label="Notes" />}
    </div>
  );
}

function TranscriptFeedback({ text }) {
  const { requireAi, stream } = useAi();
  const [out, setOut] = useState(null);
  function run() {
    requireAi(async () => {
      setOut('');
      let acc = '';
      try {
        for await (const t of stream({ system: 'You are an experienced, encouraging IELTS Speaking examiner.', messages: [{ role: 'user', content: speakingFeedbackPrompt(text) }] })) { acc += t; setOut(acc); }
      } catch (e) { setOut(`⚠️ ${e.message}`); }
    });
  }
  return (
    <div className="card raised stack" style={{ borderTop: '4px solid var(--brand)' }}>
      <div className="row"><Icon name="sparkle" /><h3>AI examiner feedback</h3><span className="spacer" />{out == null && <button type="button" className="btn primary sm" onClick={run}>Get feedback</button>}</div>
      {out == null ? <p className="small muted">Band estimates, corrections of your own sentences, and better words, from your transcript.</p> : out ? <Markdown text={out} /> : <span className="typing"><span /><span /><span /></span>}
    </div>
  );
}
