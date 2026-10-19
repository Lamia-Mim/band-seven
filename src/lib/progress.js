// Completion, streaks, XP, levels, badges and rewards. Pure functions of the
// plan and the student's state, so they never drift out of sync.

import { addDays } from './dates.js';

// ---------- days and streaks ----------

export const isDayDone = (day, done) => !!day && day.tasks.length > 0 && day.tasks.every((t) => done[day.date]?.includes(t.id));
const isRest = (day) => day?.type === 'rest';

export function completedDays(plan, done) {
  return plan.days.filter((d) => isDayDone(d, done)).length;
}

// Consecutive finished study days up to `date` (or the day before, if today
// isn't finished). Rest days neither count nor break it; a shielded day keeps
// the streak alive.
export function streak(plan, done, date, shielded = []) {
  const byDate = new Map(plan.days.map((d) => [d.date, d]));
  const kept = (d) => isDayDone(d, done) || shielded.includes(d.date);
  let cursor = kept(byDate.get(date)) ? date : addDays(date, -1);
  let n = 0;
  while (byDate.has(cursor)) {
    const d = byDate.get(cursor);
    if (isRest(d)) { cursor = addDays(cursor, -1); continue; }
    if (!kept(d)) break;
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

// ---------- XP and levels ----------

export const XP = {
  vocab: 10, grammar: 15, reading: 25, listening: 20, writing: 30, speaking: 25, talk: 15, review: 15,
  'mock-listening': 50, 'mock-reading': 60, 'mock-writing': 60, 'mock-speaking': 40, tips: 10, checklist: 10,
};
export const DAY_BONUS = 25;

export const LEVELS = [
  { min: 0, name: 'Starter' }, { min: 150, name: 'Explorer' }, { min: 400, name: 'Builder' }, { min: 750, name: 'Achiever' },
  { min: 1200, name: 'Band 6 ready' }, { min: 1800, name: 'Band 6.5 ready' }, { min: 2500, name: 'Band 7 ready' },
  { min: 3300, name: 'High flyer' }, { min: 4200, name: 'Band 8 ready' }, { min: 5200, name: 'Master' },
];

export function xpFor(plan, done) {
  let xp = 0;
  for (const d of plan.days) {
    const list = done[d.date] || [];
    for (const t of d.tasks) if (list.includes(t.id)) xp += XP[t.kind] || 10;
    if (isDayDone(d, done)) xp += DAY_BONUS;
  }
  return xp;
}

export function levelFor(xp) {
  let i = 0;
  while (i < LEVELS.length - 1 && xp >= LEVELS[i + 1].min) i++;
  const next = LEVELS[i + 1];
  return {
    level: i + 1,
    name: LEVELS[i].name,
    xp,
    floor: LEVELS[i].min,
    next: next?.min ?? null,
    progress: next ? (xp - LEVELS[i].min) / (next.min - LEVELS[i].min) : 1,
  };
}

// ---------- day rewards ----------

// What finishing `date` unlocks (call once per day). Insights: the next card.
// Every 7-day streak: a phrase pack and a streak shield (max 3). Phase end: its guide.
export function rewardsFor(plan, done, date, unlocked, counts, shielded = []) {
  const day = plan.days.find((d) => d.date === date);
  if (!isDayDone(day, done)) return { unlocked, events: [] };
  const events = [];
  const next = { ...unlocked, guides: [...unlocked.guides] };

  if (unlocked.tips < counts.tips) {
    events.push({ type: 'tip', index: unlocked.tips });
    next.tips = unlocked.tips + 1;
  }
  const run = streak(plan, done, date, shielded);
  if (run > 0 && run % 7 === 0) {
    if (unlocked.packs < counts.packs) {
      events.push({ type: 'pack', index: unlocked.packs });
      next.packs = unlocked.packs + 1;
    }
    if ((unlocked.shields ?? 0) < 3) {
      events.push({ type: 'shield', count: (unlocked.shields ?? 0) + 1 });
      next.shields = (unlocked.shields ?? 0) + 1;
    }
  }
  const phaseEnd = plan.ends.indexOf(day.index + 1);
  if (phaseEnd !== -1 && !next.guides.includes(phaseEnd)) {
    events.push({ type: 'guide', index: phaseEnd });
    next.guides.push(phaseEnd);
  }
  return { unlocked: next, events };
}

// Past study days that were missed, in order, that a shield could cover
export function missedDays(plan, done, today, shielded) {
  return plan.days.filter((d) => d.date < today && !isRest(d) && d.tasks.length && !isDayDone(d, done) && !shielded.includes(d.date)).map((d) => d.date);
}

// ---------- badges ----------

export const BADGES = [
  { id: 'first-day', title: 'First step', desc: 'Finish your first full day.', test: (s) => s.days >= 1 },
  { id: 'streak-7', title: 'Week warrior', desc: 'Keep a 7-day streak.', test: (s) => s.bestStreak >= 7 },
  { id: 'streak-21', title: 'Habit formed', desc: 'Keep a 21-day streak.', test: (s) => s.bestStreak >= 21 },
  { id: 'words-50', title: 'Word collector', desc: 'Learn 50 words.', test: (s) => s.learned >= 50 },
  { id: 'words-150', title: 'Lexical range', desc: 'Learn 150 words.', test: (s) => s.learned >= 150 },
  { id: 'own-10', title: 'Curious mind', desc: 'Add 10 words of your own.', test: (s) => s.ownWords >= 10 },
  { id: 'essay-1', title: 'First essay', desc: 'Submit a writing task.', test: (s) => s.essays >= 1 },
  { id: 'essay-10', title: 'Writer', desc: 'Submit 10 writing tasks.', test: (s) => s.essays >= 10 },
  { id: 'mock-1', title: 'Test run', desc: 'Finish a full mock test.', test: (s) => s.mocks >= 1 },
  { id: 'mock-5', title: 'Exam ready', desc: 'Finish 5 full mock tests.', test: (s) => s.mocks >= 5 },
  { id: 'reading-7', title: 'Band 7 reader', desc: 'Score Band 7 or higher in Reading practice.', test: (s) => s.bestReading >= 7 },
  { id: 'listening-7', title: 'Band 7 listener', desc: 'Score Band 7 or higher in Listening practice.', test: (s) => s.bestListening >= 7 },
  { id: 'speak-10', title: 'Confident speaker', desc: 'Complete 10 speaking sessions.', test: (s) => s.speaking >= 10 },
  { id: 'talk-5', title: 'Conversation partner', desc: 'Have 5 conversations with the AI examiner.', test: (s) => s.talks >= 5 },
];

export function badgeStats(state, plan, learned) {
  let best = 0, run = 0;
  for (const d of plan.days) {
    if (isRest(d)) continue;
    run = isDayDone(d, state.done) || state.shielded.includes(d.date) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  const maxBand = (sec) => state.scores.filter((s) => s.section === sec && s.band != null).reduce((m, s) => Math.max(m, s.band), 0);
  return {
    days: completedDays(plan, state.done),
    bestStreak: best,
    learned,
    ownWords: state.customWords.length,
    essays: Object.values(state.writing).filter((w) => w.submitted).length,
    mocks: state.scores.filter((s) => s.label?.startsWith('Mock')).length,
    bestReading: maxBand('reading'),
    bestListening: maxBand('listening'),
    speaking: state.scores.filter((s) => s.section === 'speaking').length,
    talks: state.scores.filter((s) => s.section === 'talk').length,
  };
}

export const earnedBadges = (stats) => BADGES.filter((b) => b.test(stats)).map((b) => b.id);
