import { describe, expect, it } from 'vitest';
import { buildPlan, dayOf, normaliseSettings, summarise, PHASES, DEFAULT_SETTINGS } from '../src/lib/plan.js';
import { rewardsFor, streak, isDayDone, xpFor, levelFor, LEVELS, earnedBadges, BADGES } from '../src/lib/progress.js';
import { review, isDue } from '../src/lib/srs.js';
import { bandFor, overallBand } from '../src/lib/band.js';
import { scoreGroups, normalise } from '../src/lib/score.js';
import { describe as describeTask } from '../src/lib/tasks.js';
import { POOLS } from '../src/data/index.js';

// Lamia's plan: start 19 Oct 2026, exam 8 Jan 2027, an hour a day, Fridays off
const MINE = { ...DEFAULT_SETTINGS, startDate: '2026-10-19', examDate: '2027-01-08' };
const sessions = (plan, kind) => plan.days.reduce((a, d) => a + d.tasks.filter((t) => t.kind === kind).length, 0);

describe('plan', () => {
  const plan = buildPlan(MINE, POOLS);

  it('runs from the start date to the day before the exam, ending with exam eve', () => {
    expect(plan.n).toBe(81);
    expect(plan.days[0].date).toBe('2026-10-19');
    expect(plan.days.at(-1).date).toBe('2027-01-07');
    expect(plan.days.at(-1).type).toBe('eve');
  });

  it('keeps the chosen day off free', () => {
    const fridays = plan.days.filter((d) => new Date(`${d.date}T12:00`).getDay() === 5 && d.type !== 'eve');
    expect(fridays.length).toBeGreaterThan(10);
    for (const d of fridays) { expect(d.type).toBe('rest'); expect(d.tasks).toEqual([]); }
  });

  it('has four phases in order and every working day has vocabulary', () => {
    expect(plan.ends.at(-1)).toBe(81);
    expect(new Set(plan.days.map((d) => d.phase))).toEqual(new Set(PHASES.map((p) => p.id)));
    for (const d of plan.days.filter((x) => x.type !== 'rest')) {
      expect(d.tasks.some((t) => t.kind === 'vocab')).toBe(true);
      expect(new Set(d.tasks.map((t) => t.id)).size).toBe(d.tasks.length);
    }
  });

  it('gives weaker skills more sessions', () => {
    const p = buildPlan({ ...MINE, ratings: { reading: 5, listening: 4, writing: 1, speaking: 3 } }, POOLS);
    expect(sessions(p, 'writing')).toBeGreaterThan(sessions(p, 'reading') * 1.5);
  });

  it('fits the daily time: 120 minutes means all four skills each study day', () => {
    const p = buildPlan({ ...MINE, minutes: 120 }, POOLS);
    for (const d of p.days.filter((x) => x.type === 'study')) {
      for (const k of ['reading', 'listening', 'writing', 'speaking']) expect(d.tasks.map((t) => t.kind)).toContain(k);
    }
    const p30 = buildPlan({ ...MINE, minutes: 30 }, POOLS);
    for (const d of p30.days.filter((x) => x.type === 'study')) {
      expect(d.tasks.filter((t) => ['reading', 'listening', 'writing', 'speaking'].includes(t.kind))).toHaveLength(1);
    }
  });

  it('adds daily speaking when there is time and no speaking session', () => {
    for (const d of plan.days.filter((x) => x.type === 'study')) {
      const kinds = d.tasks.map((t) => t.kind);
      expect(kinds.includes('speaking') || kinds.includes('talk')).toBe(true);
    }
  });

  it('skips the foundations when time is short, and shortens them for strong students', () => {
    const short = buildPlan({ ...MINE, examDate: '2026-11-08' }, POOLS);
    expect(short.days.some((d) => d.phase === 1)).toBe(false);
    const high = buildPlan({ ...MINE, level: 'high' }, POOLS);
    expect(high.ends[0]).toBeLessThan(plan.ends[0]);
  });

  it('introduces each word once, never more than exist', () => {
    const seen = [];
    for (const d of plan.days) for (const t of d.tasks) if (t.variant === 'new') for (let i = 0; i < t.ref.count; i++) seen.push(t.ref.start + i);
    expect(new Set(seen).size).toBe(seen.length);
    expect(Math.max(...seen)).toBeLessThan(POOLS.words);
    expect(summarise(plan).words).toBe(seen.length);
  });

  it('only refers to content that exists, for every configuration', () => {
    for (const minutes of [30, 60, 90, 120]) {
      for (const daysPerWeek of [5, 6, 7]) {
        const p = buildPlan({ ...MINE, minutes, daysPerWeek }, POOLS);
        for (const d of p.days) for (const t of d.tasks) {
          const out = describeTask(t, d.date);
          expect(out.title, `${t.kind} ${d.date}`).toBeTruthy();
          expect(out.to).toMatch(/^\//);
        }
      }
    }
  });

  it('upgrades plans made before personalisation', () => {
    expect(normaliseSettings({ startDate: '2026-10-18', examDate: '2027-01-08', load: 4 }).minutes).toBe(120);
    expect(normaliseSettings({ startDate: '2026-10-18', examDate: '2027-01-08', load: 2 }).minutes).toBe(60);
  });

  it('finds a day by date', () => {
    expect(dayOf(plan, '2026-10-19').index).toBe(0);
    expect(dayOf(plan, '2027-01-08')).toBeNull();
  });
});

describe('rewards, streaks and levels', () => {
  const plan = buildPlan({ ...MINE, daysPerWeek: 7 }, POOLS);
  const finishDay = (done, d) => ({ ...done, [d.date]: d.tasks.map((t) => t.id) });
  const counts = { tips: 84, packs: 6 };
  const fresh = () => ({ tips: 0, packs: 0, guides: [], shields: 0 });

  it('unlocks an insight per finished day, and nothing for a half-finished one', () => {
    let done = { [plan.days[0].date]: [plan.days[0].tasks[0].id] };
    expect(rewardsFor(plan, done, plan.days[0].date, fresh(), counts).events).toEqual([]);
    done = finishDay(done, plan.days[0]);
    const r = rewardsFor(plan, done, plan.days[0].date, fresh(), counts);
    expect(r.events).toEqual([{ type: 'tip', index: 0 }]);
  });

  it('a 7-day streak earns a phrase pack and a streak shield', () => {
    let done = {}, unlocked = fresh();
    const events = [];
    for (const d of plan.days.slice(0, 7)) {
      done = finishDay(done, d);
      const r = rewardsFor(plan, done, d.date, unlocked, counts);
      unlocked = r.unlocked;
      events.push(...r.events);
    }
    expect(events.filter((e) => e.type === 'pack')).toHaveLength(1);
    expect(events.filter((e) => e.type === 'shield')).toEqual([{ type: 'shield', count: 1 }]);
    expect(unlocked.shields).toBe(1);
  });

  it('rest days don’t break a streak, missed days do, shields keep it', () => {
    const p6 = buildPlan(MINE, POOLS);
    const work = p6.days.filter((d) => d.type !== 'rest').slice(0, 8);
    let done = {};
    work.forEach((d) => (done = finishDay(done, d)));
    expect(streak(p6, done, work.at(-1).date)).toBe(8);
    const gap = { ...done };
    delete gap[work[3].date];
    expect(streak(p6, gap, work.at(-1).date)).toBe(4);
    expect(streak(p6, gap, work.at(-1).date, [work[3].date])).toBe(8);
  });

  it('turns XP into levels', () => {
    expect(levelFor(0)).toMatchObject({ level: 1, name: LEVELS[0].name });
    expect(levelFor(LEVELS[1].min).level).toBe(2);
    expect(levelFor(999999).level).toBe(LEVELS.length);
    const done = finishDay({}, plan.days[0]);
    expect(xpFor(plan, done)).toBeGreaterThan(25);
    expect(isDayDone(plan.days[0], done)).toBe(true);
  });

  it('awards badges from stats', () => {
    const none = { days: 0, bestStreak: 0, learned: 0, ownWords: 0, essays: 0, mocks: 0, bestReading: 0, bestListening: 0, speaking: 0, talks: 0 };
    expect(earnedBadges(none)).toEqual([]);
    expect(earnedBadges({ ...none, days: 1, bestStreak: 7, bestReading: 7.5 })).toEqual(['first-day', 'streak-7', 'reading-7']);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });
});

describe('spaced repetition', () => {
  it('moves up a box when known and back to box 1 when not', () => {
    const a = review(undefined, 'good', '2026-10-19');
    expect(a).toMatchObject({ box: 1, due: '2026-10-20' });
    const b = review(a, 'good', '2026-10-20');
    expect(b).toMatchObject({ box: 2, due: '2026-10-23' });
    const c = review(b, 'again', '2026-10-23');
    expect(c).toMatchObject({ box: 1, due: '2026-10-23' });
    expect(isDue(c, '2026-10-23')).toBe(true);
  });
});

describe('bands and marking', () => {
  it('converts raw scores with the usual tables', () => {
    expect(bandFor('listening', 30)).toBe(7);
    expect(bandFor('listening', 29)).toBe(6.5);
    expect(bandFor('reading', 30)).toBe(7);
    expect(bandFor('reading', 10, 13)).toBe(7);
  });
  it('rounds the overall band like IELTS', () => {
    expect(overallBand([6.5, 6.5, 5, 7])).toBe(6.5);
    expect(overallBand([6.5, 6.5, 6.5, 7.5])).toBe(7);
    expect(overallBand([6, 6, 6, 6.5])).toBe(6);
  });
  it('accepts gap answers regardless of case, spaces and a final full stop', () => {
    expect(normalise('  Rubber   Tyre. ')).toBe('rubber tyre');
    const groups = [{ type: 'gap', items: [{ n: 1, prompt: '', answer: ['rubber tyre', 'tyre'] }] }, { type: 'tfng', items: [{ n: 2, prompt: '', answer: 'NOT GIVEN' }] }];
    expect(scoreGroups(groups, { 1: 'Rubber tyre', 2: 'FALSE' }).raw).toBe(1);
  });
});
