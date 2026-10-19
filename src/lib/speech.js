// Browser speech features: free and built in.
//   playScript       Listening scripts read aloud, one voice per speaker
//   createSpeaker    speaks streamed AI replies sentence by sentence
//   listenTurn       one conversational turn of speech recognition
//   startRecording   records practice sessions
//   speechStats      fluency numbers from a transcript

import { FILLERS } from '../data/speaking.js';

// ---------- voices ----------

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function voices() {
  return new Promise((resolve) => {
    const v = speechSynthesis.getVoices();
    if (v.length) return resolve(v);
    speechSynthesis.addEventListener('voiceschanged', () => resolve(speechSynthesis.getVoices()), { once: true });
    setTimeout(() => resolve(speechSynthesis.getVoices()), 1500);
  });
}

const FEMALE = /female|woman|zira|hazel|susan|libby|sonia|maisie|serena|karen|moira|samantha|tessa|fiona|kate|aria|jenny|emma|natasha/i;
const MALE = /\bmale|david|george|ryan|thomas|daniel|arthur|oliver|james|guy|mark|alex|brian|william/i;
// Natural / neural voices (Edge, newer Chrome) sound far more human
const quality = (v) => (/natural|neural|online|enhanced|premium/i.test(v.name) ? 2 : 0) + (v.lang === 'en-GB' ? 1 : 0);

async function englishVoices() {
  return (await voices()).filter((v) => /^en/i.test(v.lang)).sort((a, b) => quality(b) - quality(a));
}

async function castVoices(kinds) {
  const ranked = await englishVoices();
  const used = new Set();
  const pick = (test) => {
    const v = ranked.find((x) => test(x) && !used.has(x.name)) || ranked.find((x) => !used.has(x.name)) || ranked[0];
    if (v) used.add(v.name);
    return v || null;
  };
  const cast = {};
  for (const k of kinds) cast[k] = k.startsWith('female') ? pick((v) => FEMALE.test(v.name)) : pick((v) => MALE.test(v.name) && !FEMALE.test(v.name));
  return cast;
}

const speaking = new Set();

function utter(text, voice, { rate = 1, pitch = 1 } = {}) {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice || null;
    u.lang = voice?.lang || 'en-GB';
    u.rate = rate;
    u.pitch = pitch;
    // Chrome sometimes never fires onend; don't let a reply hang forever
    const words = text.split(/\s+/).length;
    const timer = setTimeout(done, (words / 2.3 / rate) * 1000 + 4000);
    function done() { clearTimeout(timer); speaking.delete(u); resolve(); }
    u.onend = u.onerror = done;
    speaking.add(u); // keep a reference so the utterance isn't garbage-collected mid-sentence
    speechSynthesis.speak(u);
  });
}

// Reads a Listening script line by line. Returns { stop() }.
export function playScript(script, speakers, { rate = 1, onLine = () => {}, onEnd = () => {} } = {}) {
  let stopped = false;
  speechSynthesis.cancel();
  (async () => {
    const cast = await castVoices([...new Set(Object.values(speakers).map((s) => s.voice))]);
    for (let i = 0; i < script.length && !stopped; i++) {
      const [who, text] = script[i];
      onLine(i);
      const kind = speakers[who]?.voice || 'female';
      await utter(text, cast[kind], { rate: rate * 0.95, pitch: kind === 'male2' ? 0.85 : 1 });
      if (!stopped) await new Promise((r) => setTimeout(r, 350));
    }
    if (!stopped) onEnd();
  })();
  return { stop() { stopped = true; speechSynthesis.cancel(); } };
}

export async function sayWord(text) {
  if (!canSpeak()) return;
  speechSynthesis.cancel();
  const [v] = await englishVoices();
  utter(text, v, { rate: 0.9 });
}

// Speaks streamed text as soon as each sentence is complete, so a reply
// starts playing before the AI has finished writing it.
export function createSpeaker({ voice = 'female', onStart, onIdle } = {}) {
  let buffer = '', queue = [], speaking = false, stopped = false, chosen = null, ended = false;
  const ready = castVoices([voice]).then((c) => (chosen = c[voice]));
  async function pump() {
    if (speaking) return;
    speaking = true;
    await ready;
    while (queue.length && !stopped) {
      onStart?.();
      await utter(queue.shift(), chosen);
    }
    speaking = false;
    if (ended && !stopped) onIdle?.();
  }
  return {
    push(text) {
      buffer += text;
      const parts = buffer.split(/(?<=[.!?])\s+/);
      buffer = parts.pop();
      const sentences = parts.map((p) => p.replace(/[*#_`>]/g, '').trim()).filter(Boolean);
      if (sentences.length) { queue.push(...sentences); pump(); }
    },
    end() {
      ended = true;
      const rest = buffer.replace(/[*#_`>]/g, '').trim();
      buffer = '';
      if (rest) queue.push(rest);
      if (!speaking) pump();
    },
    stop() { stopped = true; queue = []; speechSynthesis.cancel(); },
  };
}

// ---------- listening (speech recognition) ----------

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const canTranscribe = () => !!Recognition;

// One turn: listens until the speaker pauses for `silenceMs` (after saying
// something) or stop() is called. Resolves with the final text.
// onFail is called if recognition can't work here (no mic, blocked, offline).
const FATAL = ['not-allowed', 'service-not-allowed', 'network', 'audio-capture', 'language-not-supported'];

export function listenTurn({ onText = () => {}, onFail = () => {}, silenceMs = 2200, lang = 'en-GB' } = {}) {
  if (!Recognition) return null;
  const r = new Recognition();
  r.lang = lang;
  r.continuous = true;
  r.interimResults = true;
  let finalText = '', interim = '', running = true, timer = null, resolveFn;
  const promise = new Promise((res) => (resolveFn = res));
  const finish = () => {
    if (!running) return;
    running = false;
    clearTimeout(timer);
    try { r.stop(); } catch { /* not started */ }
    resolveFn((finalText + ' ' + interim).replace(/\s+/g, ' ').trim());
  };
  r.onresult = (e) => {
    interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    onText((finalText + interim).trim());
    clearTimeout(timer);
    timer = setTimeout(finish, silenceMs);
  };
  r.onerror = (e) => { if (FATAL.includes(e.error)) { onFail(e.error); finish(); } };
  // Browsers stop listening after a while; keep going until the turn ends
  r.onend = () => { if (running) try { r.start(); } catch { finish(); } };
  try { r.start(); } catch { return null; }
  return { promise, stop: finish, setSilence: (ms) => (silenceMs = ms) };
}

// Live transcript for a whole recorded session
export function startTranscript(onText) {
  if (!Recognition) return null;
  const r = new Recognition();
  r.lang = 'en-GB';
  r.continuous = true;
  r.interimResults = true;
  let finalText = '', running = true;
  r.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    onText((finalText + interim).trim());
  };
  r.onend = () => { if (running) try { r.start(); } catch { /* already started */ } };
  try { r.start(); } catch { return null; }
  return { stop() { running = false; r.stop(); return finalText.trim(); } };
}

// Microphone loudness, 0–1, for animating the voice orb
export async function micLevel(onLevel) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 512;
  ctx.createMediaStreamSource(stream).connect(analyser);
  const data = new Uint8Array(analyser.fftSize);
  let raf;
  const tick = () => {
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (const v of data) sum += ((v - 128) / 128) ** 2;
    onLevel(Math.min(1, Math.sqrt(sum / data.length) * 4));
    raf = requestAnimationFrame(tick);
  };
  tick();
  return () => { cancelAnimationFrame(raf); stream.getTracks().forEach((t) => t.stop()); ctx.close(); };
}

// ---------- recording ----------

export const canRecord = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start();
  return {
    stop: () => new Promise((resolve) => {
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      };
      rec.stop();
    }),
  };
}

// ---------- statistics ----------

export function speechStats(text, seconds) {
  const lower = ` ${text.toLowerCase().replace(/[^a-z' ]/g, ' ')} `;
  const words = lower.trim().split(/\s+/).filter(Boolean);
  const fillers = FILLERS.map((f) => ({ word: f, count: (lower.match(new RegExp(` ${f} `, 'g')) || []).length })).filter((f) => f.count);
  const unique = new Set(words).size;
  return {
    words: words.length,
    wpm: seconds > 0 ? Math.round((words.length / seconds) * 60) : 0,
    fillers,
    fillerTotal: fillers.reduce((a, f) => a + f.count, 0),
    variety: words.length ? Math.round((unique / words.length) * 100) : 0,
    longWords: [...new Set(words.filter((w) => w.length >= 9))].slice(0, 12),
  };
}
