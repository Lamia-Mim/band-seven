// The AI tutor, available everywhere: a setup screen to choose the "brain",
// a chat drawer (type or talk), and helpers pages use to ask for explanations.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useStore } from '../../lib/store.jsx';
import { AiError, CLAUDE_MODELS, LOCAL_MODELS, aiReady, checkDevice, geminiModel, hasWebGPU, isLocalDownloaded, isPhone, loadLocal, providerName, recommendedModel, streamChat } from '../../lib/ai/providers.js';
import { tutorSystem } from '../../lib/ai/prompts.js';
import { canSpeak, canTranscribe, createSpeaker, listenTurn } from '../../lib/speech.js';
import Markdown from '../Markdown.jsx';
import { Icon } from '../icons.jsx';

const AiCtx = createContext(null);
export const useAi = () => useContext(AiCtx);

export function AiProvider({ children }) {
  const { state } = useStore();
  const ai = state.settings?.ai || {};
  const ready = aiReady(ai);
  const [drawer, setDrawer] = useState(null); // { seed?: string } when open
  const [setup, setSetup] = useState(false);
  const [progress, setProgress] = useState(null); // on-device model loading { progress, text }
  const after = useRef(null);

  const requireAi = useCallback((fn) => {
    if (ready) fn();
    else { after.current = fn; setSetup(true); }
  }, [ready]);

  const openTutor = useCallback((seed) => requireAi(() => setDrawer({ seed: seed || null, key: Date.now() })), [requireAi]);

  // Stream with the latest settings. Read through a ref: an action that waited
  // for setup to finish still holds the stream function from before setup.
  const aiRef = useRef(ai);
  aiRef.current = ai;
  const stream = useCallback((opts) => streamChat(aiRef.current, {
    ...opts,
    onStatus: (p) => setProgress(p.progress >= 1 ? null : p),
  }), []);

  const value = { ai, ready, openTutor, requireAi, openSetup: () => setSetup(true), stream, progress };

  return (
    <AiCtx.Provider value={value}>
      {children}
      {setup && <AiSetup onClose={(ok) => { setSetup(false); if (ok && after.current) { const fn = after.current; after.current = null; setTimeout(fn, 50); } }} />}
      {drawer && <TutorDrawer key={drawer.key} seed={drawer.seed} onClose={() => setDrawer(null)} />}
    </AiCtx.Provider>
  );
}

// ---------- setup ----------

export function AiSetup({ onClose }) {
  const { state, saveAi } = useStore();
  const current = state.settings?.ai || {};
  const [provider, setProvider] = useState(current.provider || (hasWebGPU() ? 'local' : 'gemini'));
  const [localModel, setLocalModel] = useState(current.localModel || recommendedModel());
  const [geminiKey, setGeminiKey] = useState(current.geminiKey || '');
  const [claudeKey, setClaudeKey] = useState(current.claudeKey || '');
  const [claudeModel, setClaudeModel] = useState(current.claudeModel || CLAUDE_MODELS[0].id);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [detail, setDetail] = useState('');
  const [prog, setProg] = useState(null);
  const [cached, setCached] = useState({});
  const [device, setDevice] = useState(null); // { ok, f16 } once checked
  const phone = isPhone();
  const chosen = LOCAL_MODELS.find((m) => m.id === localModel);

  useEffect(() => {
    checkDevice().then((d) => {
      setDevice(d);
      if (!d.ok && !current.provider) setProvider('gemini'); // this device can't run it: start on the free option that can
    });
    Promise.all(LOCAL_MODELS.map((m) => isLocalDownloaded(m.id))).then((r) => setCached(Object.fromEntries(LOCAL_MODELS.map((m, i) => [m.id, r[i]]))));
  }, []);

  async function connect() {
    setBusy(true);
    setMsg('');
    setProg(null);
    try {
      if (provider === 'local') {
        await loadLocal(localModel, (p) => setProg(p));
        saveAi({ provider, localModel });
      } else if (provider === 'gemini') {
        if (!geminiKey.trim()) throw new AiError('key', 'Paste your Gemini API key first.');
        await geminiModel(geminiKey.trim());
        saveAi({ provider, geminiKey: geminiKey.trim() });
      } else {
        if (!claudeKey.trim()) throw new AiError('key', 'Paste your Claude API key first.');
        saveAi({ provider, claudeKey: claudeKey.trim(), claudeModel });
      }
      onClose(true);
    } catch (e) {
      setMsg(e.message || 'Couldn’t connect.');
      setDetail(e.detail && e.detail !== e.message ? e.detail : '');
    } finally {
      setBusy(false);
    }
  }

  const options = [
    { id: 'local', icon: 'cpu', title: 'On this device', tag: 'Free · private · no key', body: 'An AI model runs inside your browser. Downloaded once, then works offline. Needs Chrome or Edge on a recent laptop or phone.' },
    { id: 'gemini', icon: 'sparkle', title: 'Gemini', tag: 'Free key · best free quality', body: 'Get a free key from Google AI Studio in a minute. On the free plan, Google may use your questions to improve its products.' },
    { id: 'claude', icon: 'key', title: 'Claude', tag: 'Your own paid key', body: 'Excellent explanations and feedback, paid per use from your Anthropic account.' },
  ];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ai-setup-title">
      <div className="modal" style={{ width: 'min(620px, 100%)' }}>
        <div className="row"><div className="badge"><Icon name="sparkle" /></div><span className="spacer" /><button type="button" className="btn ghost icon" onClick={() => onClose(false)} aria-label="Close"><Icon name="close" /></button></div>
        <h2 id="ai-setup-title">Choose your AI tutor’s brain</h2>
        <p className="muted">The tutor explains answers, gives writing and speaking feedback, and talks with you by voice. Pick how it runs; you can change this any time in Settings.</p>
        <div className="stack" style={{ gap: 10 }}>
          {options.map((o) => (
            <button key={o.id} type="button" className="provider" aria-pressed={provider === o.id} onClick={() => setProvider(o.id)}>
              <span className="row"><Icon name={o.icon} width="20" height="20" /><b>{o.title}</b><span className="chip accent">{o.id === 'local' && device && !device.ok ? 'Not available in this browser' : o.tag}</span></span>
              <span className="small muted">{o.body}</span>
            </button>
          ))}
        </div>

        {provider === 'local' && (
          <div className="stack" style={{ gap: 8 }}>
            {device && !device.ok && (
              <p className="notice warn">
                This {phone ? 'phone’s' : ''} browser can’t run the on-device AI (WebGPU isn’t available).
                {phone ? ' On Android, update Chrome; on iPhone, update to the latest iOS. ' : ' Try the latest Chrome or Edge. '}
                Or choose <b>Gemini</b> above: it’s free and works on any phone.
              </p>
            )}
            {device?.ok && !device.f16 && <p className="small muted">This device’s graphics chip needs the 32-bit version of each model, which is about a third larger.</p>}
            {LOCAL_MODELS.map((m, i) => (
              <label key={m.id} className="choice">
                <input type="radio" name="lm" checked={localModel === m.id} onChange={() => setLocalModel(m.id)} />
                <span>
                  <b>{m.name}</b> · {m.size} {cached[m.id] && <span className="chip ok">downloaded</span>}
                  {m.id === recommendedModel() && !cached[m.id] && <span className="chip accent">{phone ? 'best for phones' : 'recommended'}</span>}
                  {phone && i >= 2 && <span className="chip">may be too big for a phone</span>}
                  <br /><span className="small muted">{m.note}</span>
                </span>
              </label>
            ))}
          </div>
        )}
        {provider === 'gemini' && (
          <div className="stack" style={{ gap: 8 }}>
            <p className="small">1. Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com/apikey</a> and sign in with Google. 2. Create an API key. 3. Paste it here.</p>
            <input type="password" placeholder="Gemini API key" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} autoComplete="off" spellCheck="false" />
          </div>
        )}
        {provider === 'claude' && (
          <div className="stack" style={{ gap: 8 }}>
            <p className="small">Create a key at <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">console.anthropic.com</a>. Each answer uses a little of your API credit.</p>
            <input type="password" placeholder="Claude API key (sk-ant-…)" value={claudeKey} onChange={(e) => setClaudeKey(e.target.value)} autoComplete="off" spellCheck="false" />
            <select value={claudeModel} onChange={(e) => setClaudeModel(e.target.value)}>{CLAUDE_MODELS.map((m) => <option key={m.id} value={m.id}>{m.name} · {m.note}</option>)}</select>
          </div>
        )}
        <p className="small muted">Keys are saved only in this browser and sent only to the provider you chose.</p>

        <div className="modal-foot stack" style={{ gap: 10 }}>
          {busy && provider === 'local' && (
            <>
              <ModelProgress prog={prog} size={chosen?.size} />
              <p className="small muted">Keep this page open with the screen on. On mobile data this can take 5–15 minutes. If it stops, tap the button again: it continues where it left off.</p>
            </>
          )}
          {msg && <p className="notice warn">{msg}{detail && <><br /><span className="small muted" style={{ wordBreak: 'break-word' }}>Details: {detail.slice(0, 300)}</span></>}</p>}
          <div className="row"><span className="spacer" /><button type="button" className="btn primary lg" onClick={connect} disabled={busy || (provider === 'local' && device && !device.ok)}>{busy ? (provider === 'local' ? 'Downloading…' : 'Connecting…') : provider === 'local' && !cached[localModel] ? `Download ${chosen?.name ?? ''} · ${chosen?.size ?? ''}` : 'Start'}</button></div>
        </div>
      </div>
    </div>
  );
}

// Download / loading progress for the on-device model. WebLLM reports progress
// once per ~35 MB part, so show elapsed time and a moving bar in between.
export function ModelProgress({ prog, size }) {
  const [start] = useState(() => Date.now());
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const text = prog?.text || '';
  const part = text.match(/\[(\d+)\/(\d+)\]/);
  const mb = text.match(/(\d+)\s*MB fetched/);
  const pct = Math.round((prog?.progress || 0) * 100);
  const label = !prog ? 'Preparing the AI engine…'
    : mb ? `Downloading part ${part ? `${part[1]} of ${part[2]}` : ''} · ${mb[1]} MB${size ? ` of about ${size}` : ''}`
      : /fetch params/i.test(text) ? `Downloading the model${size ? ` (about ${size})` : ''}…`
        : /from cache/i.test(text) ? 'Loading the model from this device…'
          : 'Getting the model ready…';
  const secs = Math.round((Date.now() - start) / 1000);
  return (
    <div className="stack" style={{ gap: 6 }}>
      <div className="progressbar live"><i style={{ width: `${Math.max(pct, 2)}%` }} /></div>
      <p className="small muted"><b>{pct}%</b> · {label} · {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</p>
    </div>
  );
}

// ---------- tutor chat ----------

const SUGGESTIONS = [
  'What is the difference between FALSE and NOT GIVEN?',
  'How do I write a good Task 1 overview?',
  'Give me 5 ways to start a Part 3 answer',
  'Check this sentence: The number of students are increasing.',
];

export function TutorDrawer({ seed, onClose }) {
  const { stream, ai, progress } = useAi();
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('band7-lang') || 'en'; } catch { return 'en'; } });
  const [voice, setVoice] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(null);
  const abort = useRef(null);
  const end = useRef(null);
  const sentSeed = useRef(false);

  useEffect(() => { try { localStorage.setItem('band7-lang', lang); } catch { /* ignore */ } }, [lang]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => () => { abort.current?.abort(); window.speechSynthesis?.cancel(); }, []);
  useEffect(() => { if (seed && !sentSeed.current) { sentSeed.current = true; send(seed); } }, [seed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function send(text) {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    const history = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);
    const ctl = new AbortController();
    abort.current = ctl;
    const speaker = voice && canSpeak() ? createSpeaker() : null;
    let out = '';
    try {
      for await (const t of stream({ system: tutorSystem(lang), messages: history.slice(-12), signal: ctl.signal })) {
        out += t;
        speaker?.push(t);
        setMessages([...history, { role: 'assistant', content: out }]);
      }
      speaker?.end();
    } catch (e) {
      setMessages([...history, { role: 'assistant', content: `⚠️ ${e.message || 'Something went wrong.'}`, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  function dictate() {
    if (listening) { listening.stop(); return; }
    const turn = listenTurn({ onText: setInput, silenceMs: 1800, lang: lang === 'bn' ? 'bn-BD' : 'en-GB' });
    if (!turn) return;
    setListening(turn);
    turn.promise.then((t) => { setListening(null); if (t) send(t); });
  }

  return (
    <>
      <div className="sheet-backdrop" style={{ background: 'rgba(12,10,30,.25)' }} onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="AI tutor">
        <div className="drawer-head">
          <div className="badge" style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff' }}><Icon name="sparkle" width="20" height="20" /></div>
          <div><b style={{ fontFamily: 'var(--display)' }}>AI tutor</b><p className="small muted">{providerName(ai)}</p></div>
          <span className="spacer" />
          <div className="seg" role="group" aria-label="Answer language">
            <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
            <button type="button" aria-pressed={lang === 'bn'} onClick={() => setLang('bn')} className="bn">বাংলা</button>
          </div>
          <button type="button" className={`btn icon sm ${voice ? 'primary' : 'ghost'}`} onClick={() => setVoice(!voice)} aria-pressed={voice} title="Read answers aloud"><Icon name="volume" /></button>
          <button type="button" className="btn icon sm ghost" onClick={onClose} aria-label="Close tutor"><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          {!messages.length && (
            <div className="stack" style={{ gap: 12 }}>
              <p className="muted">Ask anything about IELTS: a question you got wrong, a grammar point, a word, or how to answer a task. Switch to বাংলা for explanations in Bangla.</p>
              <div className="suggest">{SUGGESTIONS.map((s) => <button key={s} type="button" onClick={() => send(s)}>{s}</button>)}</div>
            </div>
          )}
          {progress && <div className="stack" style={{ gap: 6 }}><div className="progressbar"><i style={{ width: `${Math.round(progress.progress * 100)}%` }} /></div><p className="small muted">Loading the on-device AI… {progress.text}</p></div>}
          {messages.map((m, i) => (
            <div key={i} className={`bubble ${m.role === 'user' ? 'user' : 'ai'}`}>
              {m.role === 'user' ? m.content : m.content ? <Markdown text={m.content} /> : <span className="typing"><span /><span /><span /></span>}
            </div>
          ))}
          <div ref={end} />
        </div>
        <div className="drawer-foot">
          {canTranscribe() && <button type="button" className={`btn icon ${listening ? 'primary' : ''}`} onClick={dictate} aria-label={listening ? 'Stop listening' : 'Speak your question'}><Icon name="mic" /></button>}
          <textarea rows="1" value={input} placeholder={listening ? 'Listening…' : 'Ask the tutor…'} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} aria-label="Your question" />
          {busy
            ? <button type="button" className="btn icon" onClick={() => abort.current?.abort()} aria-label="Stop"><Icon name="stop" /></button>
            : <button type="button" className="btn primary icon" onClick={() => send()} disabled={!input.trim()} aria-label="Send"><Icon name="send" /></button>}
        </div>
      </aside>
    </>
  );
}

// A button that opens the tutor with a prepared question
export function ExplainButton({ prompt, label = 'Explain', small = true }) {
  const { openTutor } = useAi();
  return (
    <button type="button" className={`btn ghost ${small ? 'sm' : ''}`} onClick={() => openTutor(prompt)} style={{ color: 'var(--brand)' }}>
      <Icon name="sparkle" />{label}
    </button>
  );
}
