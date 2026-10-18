// Browser speech features, all free and on-device or built into the browser:
// reading Listening scripts aloud, recording speaking practice, and live
// transcription (where the browser supports it) for speaking statistics.

import { FILLERS } from '../data/speaking.js';

// ---------- text to speech ----------

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

function voices() {
  return new Promise((resolve) => {
    const v = speechSynthesis.getVoices();
    if (v.length) return resolve(v);
    speechSynthesis.addEventListener('voiceschanged', () => resolve(speechSynthesis.getVoices()), { once: true });
    setTimeout(() => resolve(speechSynthesis.getVoices()), 1500);
  });
}

const FEMALE = /female|woman|zira|hazel|susan|libby|sonia|maisie|serena|karen|moira|samantha|tessa|fiona|kate/i;
const MALE = /male|man|david|george|ryan|thomas|daniel|arthur|oliver|james|guy|mark|alex/i;

// Choose a distinct English voice for each speaker type, preferring British ones
async function castVoices(kinds) {
  const all = (await voices()).filter((v) => /^en/i.test(v.lang));
  const ranked = [...all].sort((a, b) => (b.lang === 'en-GB') - (a.lang === 'en-GB'));
  const used = new Set();
  const pick = (test) => {
    const v = ranked.find((x) => test(x) && !used.has(x.name)) || ranked.find((x) => !used.has(x.name)) || ranked[0];
    if (v) used.add(v.name);
    return v || null;
  };
  const cast = {};
  for (const k of kinds) {
    cast[k] = k.startsWith('female') ? pick((v) => FEMALE.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i, ''))) : pick((v) => MALE.test(v.name) && !FEMALE.test(v.name));
  }
  return cast;
}

// Reads the script line by line. Returns { stop() }.
export function playScript(script, speakers, { rate = 1, onLine = () => {}, onEnd = () => {} } = {}) {
  let stopped = false;
  speechSynthesis.cancel();
  (async () => {
    const kinds = [...new Set(Object.values(speakers).map((s) => s.voice))];
    const cast = await castVoices(kinds);
    for (let i = 0; i < script.length && !stopped; i++) {
      const [who, text] = script[i];
      onLine(i);
      await new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(text);
        const kind = speakers[who]?.voice || 'female';
        u.voice = cast[kind] || null;
        u.lang = u.voice?.lang || 'en-GB';
        u.rate = rate * 0.95;
        u.pitch = kind === 'male2' ? 0.85 : 1;
        u.onend = u.onerror = resolve;
        speechSynthesis.speak(u);
      });
      if (!stopped) await new Promise((r) => setTimeout(r, 350));
    }
    if (!stopped) onEnd();
  })();
  return { stop() { stopped = true; speechSynthesis.cancel(); } };
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

// ---------- live transcript ----------

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
export const canTranscribe = () => !!Recognition;

export function startTranscript(onText) {
  if (!Recognition) return null;
  const r = new Recognition();
  r.lang = 'en-GB';
  r.continuous = true;
  r.interimResults = true;
  let finalText = '';
  let running = true;
  r.onresult = (e) => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    onText((finalText + interim).trim());
  };
  // Browsers end recognition after a silence; restart until we are stopped
  r.onend = () => { if (running) try { r.start(); } catch { /* already started */ } };
  try { r.start(); } catch { return null; }
  return { stop() { running = false; r.stop(); return finalText.trim(); } };
}

// Words, words per minute, filler words and how varied the vocabulary is
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
