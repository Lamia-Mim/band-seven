import { describe, expect, it } from 'vitest';
import { buildPlan, dayOf, PHASES } from '../src/lib/plan.js';
import { rewardsFor, streak, isDayDone } from '../src/lib/progress.js';
import { review, isDue } from '../src/lib/srs.js';
import { bandFor, overallBand } from '../src/lib/band.js';
import { scoreGroups, normalise } from '../src/lib/score.js';
import { describe as describeTask } from '../src/lib/tasks.js';
import { POOLS } from '../src/data/index.js';

// Lamia's plan: start 19 Oct 2026, exam 8 Jan 2027
const MINE = { startDate: '2026-10-19', examDate: '2027-01-08', load: 2 };

describe('plan', () => {
  const plan = buildPlan(MINE, POOLS);

  it('runs from the start date to the day before the exam', () => {
    expect(plan.n).toBe(81);
    expect(plan.days[0].date).toBe('2026-10-19');
    expect(plan.days.at(-1).date).toBe('2027-01-07');
  });

  it('has four phases in order, ending with the plan', () => {
    expect(plan.ends.at(-1)).toBe(81);
    for (let i = 1; i < plan.ends.length; i++) expect(plan.ends[i]).toBeGreaterThan(plan.ends[i - 1]);
    expect(new Set(plan.days.map((d) => d.phase))).toEqual(new Set(PHASES.map((p) => p.id)));
  });

  it('gives every day a vocabulary task and unique task ids', () => {
    for (const d of plan.days) {
      expect(d.tasks.some((t) => t.kind === 'vocab')).toBe(true);
      expect(new Set(d.tasks.map((t) => t.id)).size).toBe(d.tasks.length);
    }
  });

  it('with 2 sections a day, covers all four skills every two study days', () => {
    const study = plan.days.filter((d) => d.type === 'study').slice(0, 2);
    const kinds = study.flatMap((d) => d.tasks.map((t) => t.kind));
    for (const k of ['reading', 'listening', 'writing', 'speaking']) expect(kinds).toContain(k);
  });

  it('with 4 sections a day, has all four skills on every study day', () => {
    const p4 = buildPlan({ ...MINE, load: 4 }, POOLS);
    for (const d of p4.days.filter((x) => x.type === 'study')) {
      for (const k of ['reading', 'listening', 'writing', 'speaking']) expect(d.tasks.map((t) => t.kind)).toContain(k);
    }
  });

  it('has mock days only in phases 3 and 4, and a rest day last', () => {
    for (const d of plan.days.filter((x) => x.type === 'mock')) expect(d.phase).toBeGreaterThanOrEqual(3);
    expect(plan.days.at(-1).type).toBe('rest');
    expect(plan.days.filter((d) => d.type === 'mock').length).toBeGreaterThanOrEqual(4);
  });

  it('only refers to content that exists, and every task can be described', () => {
    for (const p of [plan, buildPlan({ ...MINE, load: 4 }, POOLS)]) {
      for (const d of p.days) {
        for (const t of d.tasks) {
          const out = describeTask(t, d.date);
          expect(out.title).toBeTruthy();
          expect(out.to).toMatch(/^\//);
        }
      }
    }
  });

  it('finds a day by date', () => {
    expect(dayOf(plan, '2026-10-19').index).toBe(0);
    expect(dayOf(plan, '2027-01-08')).toBeNull();
  });

  it('works for a default 12-week plan', () => {
    const p = buildPlan({ startDate: '2026-11-01', examDate: '2027-01-24', load: 2 }, POOLS);
    expect(p.n).toBe(84);
  });
});

describe('rewards and streaks', () => {
  const plan = buildPlan(MINE, POOLS);
  const finishDay = (done, d) => ({ ...done, [d.date]: d.tasks.map((t) => t.id) });
  const counts = { tips: 84, packs: 6 };

  it('unlocks one tip per finished day, and nothing for a half-finished one', () => {
    let done = { [plan.days[0].date]: [plan.days[0].tasks[0].id] };
    let unlocked = { tips: 0, packs: 0, guides: [] };
    expect(rewardsFor(plan, done, plan.days[0].date, unlocked, counts).events).toEqual([]);
    done = finishDay(done, plan.days[0]);
    const r = rewardsFor(plan, done, plan.days[0].date, unlocked, counts);
    expect(r.events).toEqual([{ type: 'tip', index: 0 }]);
    expect(r.unlocked.tips).toBe(1);
  });

  it('gives a phrase pack on day 7 of a streak, and the phase guide at a phase end', () => {
    let done = {};
    let unlocked = { tips: 0, packs: 0, guides: [] };
    const events = [];
    for (const d of plan.days.slice(0, plan.ends[0])) {
      done = finishDay(done, d);
      const r = rewardsFor(plan, done, d.date, unlocked, counts);
      unlocked = r.unlocked;
      events.push(...r.events);
    }
    expect(events.filter((e) => e.type === 'pack')).toHaveLength(Math.floor(plan.ends[0] / 7));
    expect(events.filter((e) => e.type === 'guide')).toEqual([{ type: 'guide', index: 0 }]);
    expect(streak(plan, done, plan.days[plan.ends[0] - 1].date)).toBe(plan.ends[0]);
    expect(isDayDone(plan.days[0], done)).toBe(true);
  });

  it('a broken streak restarts', () => {
    const done = finishDay(finishDay({}, plan.days[0]), plan.days[2]);
    expect(streak(plan, done, plan.days[2].date)).toBe(1);
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

describe('bands', () => {
  it('converts raw scores with the usual tables', () => {
    expect(bandFor('listening', 30)).toBe(7);
    expect(bandFor('listening', 29)).toBe(6.5);
    expect(bandFor('reading', 30)).toBe(7);
    expect(bandFor('reading', 40)).toBe(9);
    expect(bandFor('reading', 10, 13)).toBe(7); // 10/13 ≈ 31/40
  });

  it('rounds the overall band like IELTS', () => {
    expect(overallBand([6.5, 6.5, 5, 7])).toBe(6.5); // 6.25 → 6.5
    expect(overallBand([6.5, 6.5, 6.5, 7.5])).toBe(7); // 6.75 → 7
    expect(overallBand([6, 6, 6, 6.5])).toBe(6); // 6.125 → 6
  });
});

describe('marking', () => {
  it('accepts gap answers regardless of case, spaces and a final full stop', () => {
    expect(normalise('  Rubber   Tyre. ')).toBe('rubber tyre');
    const groups = [{ type: 'gap', items: [{ n: 1, prompt: '', answer: ['rubber tyre', 'tyre'] }] }, { type: 'tfng', items: [{ n: 2, prompt: '', answer: 'NOT GIVEN' }] }];
    expect(scoreGroups(groups, { 1: 'Rubber tyre', 2: 'FALSE' }).raw).toBe(1);
    expect(scoreGroups(groups, { 1: 'rubber tire', 2: 'NOT GIVEN' }).raw).toBe(1);
  });
});
