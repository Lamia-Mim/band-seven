// Voice room: talk with the AI examiner the way you would with a voice
// assistant. It speaks, listens, waits for you to pause, and replies.
// Modes: a full Speaking mock (Parts 1–3) or a free conversation for fluency.

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CUE_CARDS, PART1 } from '../data/index.js';
import { ModelProgress, useAi } from '../components/ai/Ai.jsx';
import { examinerSystem, partnerSystem, speakingFeedbackPrompt } from '../lib/ai/prompts.js';
import { canSpeak, canTranscribe, createSpeaker, listenTurn, micLevel } from '../lib/speech.js';
import { useStore } from '../lib/store.jsx';
import { PageHead, TaskDone, mmss, useCountdown, useTask } from '../components/ui.jsx';
import Markdown from '../components/Markdown.jsx';
import { Icon } from '../components/icons.jsx';

const TOPICS = ['your hometown', 'your studies or work', 'technology in daily life', 'travel and holidays', 'food and cooking', 'the environment', 'friends and family', 'books and films'];
const STATUS = { idle: 'Tap the orb to start', thinking: 'Thinking…', speaking: 'Speaking…', listening: 'Listening… pause when you finish', prep: 'Prepare your talk' };

// A new query (another task, mode or card) starts a fresh session
export default function TalkRoute() {
  const { search } = useLocation();
  return <Talk key={search} search={search} />;
}

function Talk({ search }) {
  const params = new URLSearchParams(search);
  const { requireAi, stream, ready, progress } = useAi();
  const { addScore } = useStore();
  const { task, finish, done } = useTask();

  const asked = params.get('mode');
  const [mode, setMode] = useState(asked === 'test' || asked === 'chat' ? asked : task ? 'chat' : 'test');
  const [topic, setTopic] = useState(TOPICS[0]);
  const cardRef = params.get('card') != null ? +params.get('card') % CUE_CARDS.length : Math.floor(Math.random() * CUE_CARDS.length);
  const card = CUE_CARDS[cardRef];
  const p1 = PART1[cardRef % PART1.length];

  const [status, setStatus] = useState('idle');
  const [live, setLive] = useState(false);
  const [aiText, setAiText] = useState('');
  const [userText, setUserText] = useState('');
  const [log, setLog] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [prep, setPrep] = useState(false);
  const [typed, setTyped] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);

  const history = useRef([]);
  const active = useRef(false);
  const turn = useRef(null);
  const speaker = useRef(null);
  const stopMic = useRef(null);
  const abort = useRef(null);
  const orb = useRef(null);
  const started = useRef(0);
  const part2 = useRef(false);
  const voiceOff = useRef(!canTranscribe()); // typed answers when the browser can't listen
  const [typing, setTyping] = useState(voiceOff.current);

  const system = mode === 'test' ? examinerSystem({ topic: p1.topic.toLowerCase(), card }) : partnerSystem(topic);

  useEffect(() => () => stopAll(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!live) return undefined;
    const id = setInterval(() => setElapsed(Math.round((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [live]);
  const goal = mode === 'chat' && elapsed >= 300; // the daily conversation is five minutes

  function stopAll() {
    active.current = false;
    turn.current?.stop();
    speaker.current?.stop();
    abort.current?.abort();
    stopMic.current?.();
    stopMic.current = null;
  }

  function begin() {
    requireAi(async () => {
      setError('');
      setFeedback(null);
      setLog([]);
      history.current = [{ role: 'user', content: mode === 'test' ? '(The candidate is ready. Please begin the test.)' : '(Start the conversation with a friendly question.)' }];
      active.current = true;
      part2.current = false;
      started.current = Date.now();
      setElapsed(0);
      setLive(true);
      try {
        stopMic.current = await micLevel((l) => orb.current?.style.setProperty('--level', l.toFixed(3)));
      } catch { /* no level meter: fine */ }
      aiTurn();
    });
  }

  async function aiTurn() {
    if (!active.current) return;
    setStatus('thinking');
    setAiText('');
    const ctl = new AbortController();
    abort.current = ctl;
    let out = '';
    let resolveIdle;
    const idle = new Promise((r) => (resolveIdle = r));
    speaker.current = canSpeak() ? createSpeaker({ onStart: () => setStatus('speaking'), onIdle: () => resolveIdle() }) : null;
    try {
      for await (const t of stream({ system, messages: history.current, signal: ctl.signal })) {
        out += t;
        setAiText(out);
        speaker.current?.push(t);
      }
    } catch (e) {
      setError(e.message || 'The AI stopped responding.');
      endSession(false);
      return;
    }
    history.current.push({ role: 'assistant', content: out });
    setLog((l) => [...l, { who: 'ai', text: out }]);
    if (speaker.current) { speaker.current.end(); await idle; }
    if (!active.current) return;

    if (/end of the speaking test/i.test(out)) { endSession(true); return; }
    if (mode === 'test' && /minute starts now/i.test(out)) {
      part2.current = true;
      setShowCard(true);
      setPrep(true);
      setStatus('prep');
      return; // the prep countdown calls userTurn
    }
    userTurn();
  }

  function userTurn() {
    if (!active.current) return;
    setStatus('listening');
    setUserText('');
    if (voiceOff.current) return; // typed answers instead
    const t = listenTurn({
      onText: setUserText,
      onFail: () => { voiceOff.current = true; setTyping(true); },
      silenceMs: part2.current ? 5000 : 2300,
    });
    if (!t) { voiceOff.current = true; setTyping(true); return; }
    turn.current = t;
    t.promise.then((text) => submitAnswer(text));
  }

  function submitAnswer(text) {
    if (!active.current) return;
    if (!text.trim()) { if (!voiceOff.current) userTurn(); return; }
    part2.current = false;
    history.current.push({ role: 'user', content: text });
    setLog((l) => [...l, { who: 'me', text }]);
    setUserText('');
    setTyped('');
    aiTurn();
  }

  function endPrep() {
    setPrep(false);
    userTurn();
  }

  async function endSession(withFeedback = true) {
    const answers = history.current.filter((m, i) => m.role === 'user' && i > 0).map((m) => m.content);
    stopAll();
    setLive(false);
    setStatus('idle');
    setShowCard(false);
    setPrep(false);
    if (!withFeedback || !answers.length) return;
    const words = answers.join(' ').split(/\s+/).filter(Boolean).length;
    addScore({ section: mode === 'test' ? 'speaking' : 'talk', label: mode === 'test' ? 'AI speaking test' : `Conversation: ${topic}`, raw: words, total: null, band: null, seconds: Math.round((Date.now() - started.current) / 1000) });
    finish();
    setFeedback('');
    let out = '';
    try {
      for await (const t of stream({ system: 'You are an experienced, encouraging IELTS Speaking examiner.', messages: [{ role: 'user', content: speakingFeedbackPrompt(answers.map((a, i) => `${i + 1}. ${a}`).join('\n')) }] })) {
        out += t;
        setFeedback(out);
      }
    } catch (e) {
      setFeedback(`⚠️ ${e.message}`);
    }
  }

  const orbState = live ? (prep ? 'idle' : status) : 'idle';

  return (
    <>
      <PageHead kicker="Voice room" title={mode === 'test' ? 'Speaking test with the AI examiner' : 'Talk to build fluency'} sub={mode === 'test' ? 'A full Part 1–3 test by voice, then band estimates and corrections.' : 'A relaxed conversation. Speak, pause, and it answers, like a voice assistant.'} back={task ? '/' : undefined}>
        {!live && (
          <div className="seg" role="group" aria-label="Mode">
            <button type="button" aria-pressed={mode === 'test'} onClick={() => setMode('test')}>Mock test</button>
            <button type="button" aria-pressed={mode === 'chat'} onClick={() => setMode('chat')}>Conversation</button>
          </div>
        )}
      </PageHead>

      <div className="stack" style={{ maxWidth: 820, margin: '0 auto' }}>
        <TaskDone show={done && !!feedback} />
        {mode === 'chat' && !live && (
          <div className="suggest" style={{ justifyContent: 'center' }}>
            {TOPICS.map((t) => <button key={t} type="button" onClick={() => setTopic(t)} style={t === topic ? { borderColor: 'var(--brand)', color: 'var(--brand)' } : undefined}>{t}</button>)}
          </div>
        )}

        <section className="voice">
          <div className={`orb-wrap ${orbState}`}>
            <span className="halo" /><span className="halo" />
            <button ref={orb} type="button" className="orb" onClick={() => (live ? (status === 'listening' ? turn.current?.stop() : null) : begin())}
              aria-label={live ? (status === 'listening' ? 'I’ve finished speaking' : STATUS[status]) : 'Start talking'} />
          </div>
          <p className="kicker">{live ? STATUS[prep ? 'prep' : status] : ready ? STATUS.idle : 'Tap the orb to set up the AI'}</p>
          {live && <p className="small muted">{mmss(elapsed)}{mode === 'chat' ? (goal ? ' · five minutes done: end whenever you like' : ' · aim for five minutes') : ''}</p>}
          {progress && <div style={{ width: 'min(420px, 100%)' }}><ModelProgress prog={progress} /></div>}
          {live && aiText && <p className="caption">{aiText.replace(/[*#]/g, '')}</p>}
          {live && userText && <p className="caption user">“{userText}”</p>}

          {showCard && (
            <div className="cue" style={{ textAlign: 'left', width: '100%' }}>
              <h2>{card.title}</h2>
              <p className="small muted">You should say:</p>
              <ul>{card.points.map((p) => <li key={p}>{p}</li>)}</ul>
              <p>{card.explain}</p>
              {prep && <PrepTimer onDone={endPrep} />}
            </div>
          )}

          {live && (
            <div className="row" style={{ justifyContent: 'center' }}>
              {status === 'listening' && !typing && <button type="button" className="btn" onClick={() => turn.current?.stop()}><Icon name="check" />I’ve finished</button>}
              <button type="button" className={`btn ${goal ? 'primary' : 'ghost'}`} onClick={() => endSession(true)}>End and get feedback</button>
            </div>
          )}
          {live && typing && status === 'listening' && (
            <form className="row" style={{ width: '100%' }} onSubmit={(e) => { e.preventDefault(); submitAnswer(typed); }}>
              <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={canTranscribe() ? 'The microphone isn’t available: type your answer' : 'This browser can’t hear you: type your answer'} style={{ flex: 1 }} />
              <button type="submit" className="btn primary">Send</button>
            </form>
          )}
          {error && <p className="notice warn">{error}</p>}
          {!live && !feedback && <p className="small muted" style={{ maxWidth: 520 }}>Use headphones if you can. Works best in Chrome or Edge. Your voice is turned into text by the browser; nothing is recorded.</p>}
        </section>

        {feedback != null && (
          <section className="card raised stack">
            <div className="row"><Icon name="sparkle" /><h2>Examiner feedback</h2></div>
            {feedback ? <Markdown text={feedback} /> : <span className="typing"><span /><span /><span /></span>}
          </section>
        )}

        {log.length > 0 && (
          <details className="card">
            <summary><b>Transcript</b></summary>
            <div className="stack" style={{ marginTop: 12, gap: 8 }}>
              {log.map((m, i) => <div key={i} className={`bubble ${m.who === 'me' ? 'user' : 'ai'}`}>{m.text}</div>)}
            </div>
          </details>
        )}
      </div>
    </>
  );
}

function PrepTimer({ onDone }) {
  const [left] = useCountdown(60, { running: true, onEnd: onDone });
  return (
    <div className="row" style={{ marginTop: 10 }}>
      <span className="bigtime" style={{ fontSize: 40 }}>{mmss(left)}</span>
      <span className="spacer" />
      <button type="button" className="btn primary" onClick={onDone}>Start talking now</button>
    </div>
  );
}
