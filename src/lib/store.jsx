// App state, saved in localStorage on this device. Everything the student
// does goes through the actions below.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildPlan, normaliseSettings } from './plan.js';
import { badgeStats, earnedBadges, isDayDone, levelFor, rewardsFor, xpFor } from './progress.js';
import { isLearned, review } from './srs.js';
import { addDays, todayKey } from './dates.js';
import { POOLS, WORDS } from '../data/index.js';
import { TIPS, PHRASE_PACKS } from '../data/rewards.js';
import { MASTERCLASSES } from '../data/masterclasses.js';

const KEY = 'band7';

const EMPTY = {
  version: 2,
  settings: null,   // { startDate, examDate, minutes, daysPerWeek, restDay, target, level, ratings, name, theme, ai }
  done: {},         // date → ids of finished tasks
  rewarded: {},     // dates whose day rewards were given
  unlocked: { tips: 0, packs: 0, guides: [], shields: 0 },
  shielded: [],     // missed days covered by a streak shield
  badges: [],       // earned badge ids
  vocab: {},        // word id → { box, due, seen }
  customWords: [],  // words the student added
  scores: [],       // { date, section, label, raw, total, band, … }
  writing: {},      // prompt id → { text, date, submitted, feedback }
  mistakes: [],     // { date, source, prompt, yours, answer }
  pending: [],      // reward events waiting to be shown
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved) return EMPTY;
    return {
      ...EMPTY,
      ...saved,
      version: 2,
      settings: saved.settings ? normaliseSettings(saved.settings) : null,
      unlocked: { ...EMPTY.unlocked, ...saved.unlocked },
    };
  } catch {
    return EMPTY;
  }
}

const Store = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full or blocked */ }
  }, [state]);

  const plan = useMemo(() => (state.settings ? buildPlan(state.settings, POOLS) : null), [state.settings]);
  const allWords = useMemo(() => [...WORDS, ...state.customWords], [state.customWords]);

  const setTask = useCallback((date, id, finished = true) => {
    setState((s) => {
      const list = new Set(s.done[date] || []);
      finished ? list.add(id) : list.delete(id);
      const done = { ...s.done, [date]: [...list] };
      let next = { ...s, done };
      if (!finished || !plan) return next;

      const events = [];
      const before = levelFor(xpFor(plan, s.done)).level;
      const after = levelFor(xpFor(plan, done)).level;
      for (let lv = before + 1; lv <= after; lv++) {
        events.push({ type: 'level', level: lv, masterclass: MASTERCLASSES.find((m) => m.level === lv)?.id ?? null });
      }
      if (!s.rewarded[date]) {
        const r = rewardsFor(plan, done, date, s.unlocked, { tips: TIPS.length, packs: PHRASE_PACKS.length }, s.shielded);
        if (r.events.length) {
          events.unshift(...r.events);
          next = { ...next, unlocked: r.unlocked, rewarded: { ...s.rewarded, [date]: true } };
        }
      }
      return events.length ? { ...next, pending: [...next.pending, ...events] } : next;
    });
  }, [plan]);

  // Streak shields: cover the study days missed since the last finished day
  useEffect(() => {
    if (!plan) return;
    const today = todayKey();
    setState((s) => {
      let shields = s.unlocked.shields ?? 0;
      if (!shields) return s;
      const shielded = [...s.shielded];
      const byDate = new Map(plan.days.map((d) => [d.date, d]));
      let cursor = addDays(today, -1);
      while (byDate.has(cursor) && shields > 0) {
        const d = byDate.get(cursor);
        if (d.type !== 'rest' && d.tasks.length && !shielded.includes(cursor)) {
          if (isDayDone(d, s.done)) break;
          shielded.push(cursor);
          shields--;
        }
        cursor = addDays(cursor, -1);
      }
      if (shielded.length === s.shielded.length) return s;
      return { ...s, shielded, unlocked: { ...s.unlocked, shields }, pending: [...s.pending, { type: 'shield-used', count: shielded.length - s.shielded.length }] };
    });
  }, [plan]);

  // Badges: award any newly earned ones
  useEffect(() => {
    if (!plan) return;
    const learned = allWords.filter((w) => isLearned(state.vocab[w.id])).length;
    const earned = earnedBadges(badgeStats(state, plan, learned)).filter((id) => !state.badges.includes(id));
    if (earned.length) {
      setState((s) => ({ ...s, badges: [...s.badges, ...earned], pending: [...s.pending, ...earned.map((id) => ({ type: 'badge', id }))] }));
    }
  }, [plan, allWords, state.done, state.scores, state.writing, state.customWords, state.vocab]); // eslint-disable-line react-hooks/exhaustive-deps

  const actions = useMemo(() => ({
    saveSettings: (settings) => setState((s) => ({ ...s, settings: normaliseSettings({ ...s.settings, ...settings }) })),
    saveAi: (ai) => setState((s) => ({ ...s, settings: { ...s.settings, ai: { ...s.settings.ai, ...ai } } })),
    completeTask: (date, id) => setTask(date, id, true),
    undoTask: (date, id) => setTask(date, id, false),
    rateWord: (id, grade) => setState((s) => ({ ...s, vocab: { ...s.vocab, [id]: review(s.vocab[id], grade, todayKey()) } })),
    addWord: (w) => setState((s) => ({ ...s, customWords: [...s.customWords, { ...w, id: `c${Date.now().toString(36)}`, topic: 'My words', custom: true, added: todayKey() }] })),
    updateWord: (id, w) => setState((s) => ({ ...s, customWords: s.customWords.map((x) => (x.id === id ? { ...x, ...w } : x)) })),
    removeWord: (id) => setState((s) => {
      const vocab = { ...s.vocab };
      delete vocab[id];
      return { ...s, vocab, customWords: s.customWords.filter((x) => x.id !== id) };
    }),
    addScore: (score) => setState((s) => ({ ...s, scores: [...s.scores, { date: todayKey(), ...score }] })),
    addMistakes: (list) => setState((s) => ({ ...s, mistakes: [...s.mistakes, ...list.map((m) => ({ date: todayKey(), ...m }))].slice(-300) })),
    clearMistakes: () => setState((s) => ({ ...s, mistakes: [] })),
    saveWriting: (id, text, submitted = false) => setState((s) => ({
      ...s, writing: { ...s.writing, [id]: { ...s.writing[id], text, date: todayKey(), submitted: submitted || !!s.writing[id]?.submitted } },
    })),
    saveFeedback: (id, feedback) => setState((s) => ({ ...s, writing: { ...s.writing, [id]: { ...s.writing[id], feedback } } })),
    dismissReward: () => setState((s) => ({ ...s, pending: s.pending.slice(1) })),
    importData: (data) => setState({ ...EMPTY, ...data, settings: data.settings ? normaliseSettings(data.settings) : null }),
    resetAll: () => setState(EMPTY),
  }), [setTask]);

  const value = useMemo(() => ({ state, plan, allWords, ...actions }), [state, plan, allWords, actions]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export const useStore = () => useContext(Store);
