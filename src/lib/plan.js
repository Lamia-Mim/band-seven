// Builds a personal study plan, one entry per day from the start date to the
// day before the exam.
//
// Personalised by: days available, daily minutes, study days per week, current
// level, and a 1–5 self-rating per skill (weaker skills get more sessions).
//
// Each study day follows the routine high scorers use:
//   Warm-up   spaced-repetition vocabulary (every day, little and often)
//   Focus     the main skill session, timed, at test conditions
//   Practice  a second skill, alternating receptive and productive work
//   Speak     a few minutes of speaking every day: fluency is a daily habit
//   Review    go back over mistakes: where most of the improvement comes from
//
// Pure: same settings → same plan. A task is { id, kind, ref, variant, block, minutes }.

import { addDays, diffDays, fromKey } from './dates.js';

export const PHASES = [
  { id: 1, name: 'Foundation', focus: 'Grammar essentials, the test format and a vocabulary base.' },
  { id: 2, name: 'Skill building', focus: 'Every question type, with a clear strategy for each one.' },
  { id: 3, name: 'Exam practice', focus: 'Timed sections, a full mock every week, and fixing weak spots.' },
  { id: 4, name: 'Final stretch', focus: 'Two mocks a week, light review, and rest before the exam.' },
];

export const SKILLS = ['reading', 'listening', 'writing', 'speaking'];

export const DEFAULT_SETTINGS = {
  minutes: 60, daysPerWeek: 6, restDay: 5, target: 7, level: 'mid',
  ratings: { reading: 3, listening: 3, writing: 3, speaking: 3 },
};

// How many words a day, and how many skill sessions, for each daily time budget
const BUDGET = {
  30: { words: 8, sessions: 1 },
  60: { words: 12, sessions: 2 },
  90: { words: 15, sessions: 3 },
  120: { words: 20, sessions: 4 },
};

// Shorter runways skip or shorten the Foundation phase
function phaseShares(n, level) {
  let s = n >= 56 ? [0.25, 0.35, 0.27, 0.13] : n >= 28 ? [0.15, 0.35, 0.35, 0.15] : n >= 14 ? [0, 0.3, 0.45, 0.25] : [0, 0, 0.6, 0.4];
  if (level === 'high' && s[0] > 0) s = [s[0] / 2, s[1] + s[0] / 2, s[2], s[3]];
  return s;
}

export function normaliseSettings(s) {
  const out = { ...DEFAULT_SETTINGS, ...s, ratings: { ...DEFAULT_SETTINGS.ratings, ...s.ratings } };
  if (s.load && !s.minutes) out.minutes = s.load === 4 ? 120 : 60; // plans made before personalisation
  if (!BUDGET[out.minutes]) out.minutes = 60;
  return out;
}

export function restDays(settings) {
  if (settings.daysPerWeek >= 7) return [];
  if (settings.daysPerWeek === 6) return [settings.restDay];
  return [settings.restDay, (settings.restDay + 1) % 7];
}

export function buildPlan(rawSettings, pools) {
  const settings = normaliseSettings(rawSettings);
  const n = Math.max(1, diffDays(settings.startDate, settings.examDate));
  const shares = phaseShares(n, settings.level);
  let acc = 0;
  const ends = shares.map((share, i) => {
    acc += share;
    return i === shares.length - 1 ? n : Math.min(n, Math.round(n * acc));
  });
  const budget = BUDGET[settings.minutes];
  const rest = restDays(settings);

  // Weighted rotation of skills: a skill rated 1 comes up about twice as often as one rated 5
  const weight = Object.fromEntries(SKILLS.map((k) => [k, 1 + (5 - settings.ratings[k]) / 2]));
  const credit = Object.fromEntries(SKILLS.map((k) => [k, 0]));
  const nextSkill = (exclude) => {
    const total = SKILLS.reduce((a, k) => a + weight[k], 0);
    SKILLS.forEach((k) => (credit[k] += weight[k]));
    const pick = SKILLS.filter((k) => !exclude.includes(k)).sort((a, b) => credit[b] - credit[a])[0];
    credit[pick] -= total;
    return pick;
  };

  const seq = { word: 0, grammar: 0, reading: 0, listening: 0, writing: 0, w1: 0, w2: 0, speaking: 0, p1: 0, p2: 0, mock: 0, mockLR: 0, studyInWeek: 0 };
  const days = [];

  for (let i = 0; i < n; i++) {
    const date = addDays(settings.startDate, i);
    const phase = ends.findIndex((e) => i < e) + 1;
    const weekday = fromKey(date).getDay();
    const block7 = i % 7;
    let type = 'study';
    if (i === n - 1 && n > 3) type = 'eve';
    else if (rest.includes(weekday)) type = 'rest';
    else if (phase >= 3 && block7 === 6) type = 'mock';
    else if (phase === 4 && block7 === 3) type = 'mock';
    else if (phase <= 2 && block7 === 6) type = 'review';

    const tasks = [];
    const add = (kind, block, minutes, ref = null, variant = null) => tasks.push({ id: kind, kind, block, minutes, ref, variant });

    if (type === 'rest') {
      days.push({ index: i, date, phase, type, tasks });
      continue;
    }

    // Warm-up: vocabulary every working day; new words until the final stretch
    if (type === 'study' && phase < 4 && seq.word < pools.words) {
      const count = Math.min(budget.words, pools.words - seq.word);
      add('vocab', 'Warm-up', Math.round(count * 1.1), { start: seq.word, count }, 'new');
      seq.word += count;
    } else add('vocab', 'Warm-up', 8, null, 'review');

    if (type === 'study') {
      if (phase === 1 && (settings.minutes >= 60 || i % 2 === 0)) add('grammar', 'Foundation', 15, seq.grammar++ % pools.grammar);

      const chosen = [];
      for (let s = 0; s < budget.sessions; s++) chosen.push(nextSkill(chosen));
      chosen.forEach((skill, k) => {
        const block = k === 0 ? 'Focus' : 'Practice';
        if (skill === 'reading' || skill === 'listening') {
          const j = seq[skill]++;
          add(skill, block, skill === 'reading' ? 20 : 12, j < pools[skill] ? j : null, j < pools[skill] ? 'app' : 'book');
        } else if (skill === 'writing') {
          const j = seq.writing++;
          const task1 = phase <= 2 ? j % 2 === 0 : j % 3 === 0;
          task1 ? add('writing', block, 20, seq.w1++ % pools.task1, 'task1') : add('writing', block, 40, seq.w2++ % pools.task2, 'task2');
        } else {
          const j = seq.speaking++;
          j % 3 === 2 ? add('speaking', block, 8, seq.p1++ % pools.part1, 'part1') : add('speaking', block, 10, seq.p2++ % pools.cueCards, 'part2');
        }
      });

      // A short daily conversation whenever there's time and no speaking session today
      if (settings.minutes >= 60 && !chosen.includes('speaking')) add('talk', 'Speak', 5);
      // Review mistakes every day on the longer plans
      if (settings.minutes >= 90) add('review', 'Review', 10);
    } else if (type === 'review') {
      add('review', 'Review', 20);
      add('speaking', 'Speak', 15, seq.p2++ % pools.cueCards, 'full');
    } else if (type === 'mock') {
      if (seq.mock++ % 2 === 0) {
        const variant = seq.mockLR++ < pools.mocks ? 'app' : 'book';
        add('mock-listening', 'Mock test', 35, 0, variant);
        add('mock-reading', 'Mock test', 60, 0, variant);
      } else {
        add('mock-writing', 'Mock test', 60, seq.w2++ % pools.task2, 'full');
        add('mock-speaking', 'Mock test', 15, seq.p2++ % pools.cueCards, 'full');
      }
    } else {
      add('tips', 'Calm review', 15);
      add('checklist', 'Get ready', 10);
    }

    days.push({ index: i, date, phase, type, tasks });
  }

  return { n, ends, days, startDate: settings.startDate, examDate: settings.examDate, settings };
}

export function dayOf(plan, date) {
  const i = diffDays(plan.startDate, date);
  return i >= 0 && i < plan.n ? plan.days[i] : null;
}

export function phaseRange(plan, phaseId) {
  const start = phaseId === 1 ? 0 : plan.ends[phaseId - 2];
  const end = plan.ends[phaseId - 1] - 1;
  return { start, end, empty: end < start, startDate: plan.days[start]?.date, endDate: plan.days[end]?.date };
}

// A one-paragraph summary of what the plan will do, for onboarding and settings
export function summarise(plan) {
  const count = (t) => plan.days.filter((d) => d.type === t).length;
  const sessions = { reading: 0, listening: 0, writing: 0, speaking: 0 };
  for (const d of plan.days) for (const t of d.tasks) if (sessions[t.kind] != null) sessions[t.kind]++;
  const words = plan.days.reduce((a, d) => a + (d.tasks.find((t) => t.variant === 'new')?.ref.count || 0), 0);
  return { study: count('study'), rest: count('rest'), mocks: count('mock'), review: count('review'), sessions, words };
}
