// App state, saved in localStorage on this device. Everything the student
// does goes through the actions below.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildPlan } from './plan.js';
import { rewardsFor } from './progress.js';
import { review } from './srs.js';
import { todayKey } from './dates.js';
import { POOLS } from '../data/index.js';
import { TIPS, PHRASE_PACKS } from '../data/rewards.js';

const KEY = 'band7';

const EMPTY = {
  version: 1,
  settings: null, // set during onboarding: { startDate, examDate, load, name, theme }
  done: {},       // date → ids of finished tasks
  rewarded: {},   // dates whose rewards were already given
  unlocked: { tips: 0, packs: 0, guides: [] },
  vocab: {},      // word id → { box, due, seen }
  scores: [],     // { date, section, label, raw, total, band }
  writing: {},    // prompt id → { text, date, submitted }
  mistakes: [],   // { date, source, prompt, yours, answer }
  pending: [],    // reward events waiting to be shown
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    return saved ? { ...EMPTY, ...saved, unlocked: { ...EMPTY.unlocked, ...saved.unlocked } } : EMPTY;
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

  const setTask = useCallback((date, id, finished = true) => {
    setState((s) => {
      const list = new Set(s.done[date] || []);
      finished ? list.add(id) : list.delete(id);
      const done = { ...s.done, [date]: [...list] };
      let next = { ...s, done };
      if (finished && plan && !s.rewarded[date]) {
        const r = rewardsFor(plan, done, date, s.unlocked, { tips: TIPS.length, packs: PHRASE_PACKS.length });
        if (r.events.length) {
          next = { ...next, unlocked: r.unlocked, rewarded: { ...s.rewarded, [date]: true }, pending: [...s.pending, ...r.events] };
        }
      }
      return next;
    });
  }, [plan]);

  const actions = useMemo(() => ({
    saveSettings: (settings) => setState((s) => ({ ...s, settings: { ...s.settings, ...settings } })),
    completeTask: (date, id) => setTask(date, id, true),
    undoTask: (date, id) => setTask(date, id, false),
    rateWord: (id, grade) => setState((s) => ({ ...s, vocab: { ...s.vocab, [id]: review(s.vocab[id], grade, todayKey()) } })),
    addScore: (score) => setState((s) => ({ ...s, scores: [...s.scores, { date: todayKey(), ...score }] })),
    addMistakes: (list) => setState((s) => ({ ...s, mistakes: [...s.mistakes, ...list.map((m) => ({ date: todayKey(), ...m }))].slice(-300) })),
    clearMistakes: () => setState((s) => ({ ...s, mistakes: [] })),
    saveWriting: (id, text, submitted = false) => setState((s) => ({
      ...s, writing: { ...s.writing, [id]: { text, date: todayKey(), submitted: submitted || !!s.writing[id]?.submitted } },
    })),
    dismissReward: () => setState((s) => ({ ...s, pending: s.pending.slice(1) })),
    importData: (data) => setState({ ...EMPTY, ...data }),
    resetAll: () => setState(EMPTY),
  }), [setTask]);

  const value = useMemo(() => ({ state, plan, ...actions }), [state, plan, actions]);
  return <Store.Provider value={value}>{children}</Store.Provider>;
}

export const useStore = () => useContext(Store);
