// Turns a planned task into what the student sees: a title, a one-line
// detail, the page that does it, and the skill it belongs to (for colour).

import { GRAMMAR, WORDS, READING, LISTENING, TASK1, TASK2, PART1, CUE_CARDS } from '../data/index.js';

const CHARTS = { line: 'line graph', bar: 'bar chart', pie: 'pie charts', table: 'table', process: 'process diagram' };

// Skill / colour family for each kind of task
export const SKILL_OF = {
  vocab: 'vocab', grammar: 'grammar', reading: 'reading', listening: 'listening', writing: 'writing', speaking: 'speaking', talk: 'speaking',
  review: 'review', 'mock-listening': 'listening', 'mock-reading': 'reading', 'mock-writing': 'writing', 'mock-speaking': 'speaking',
  tips: 'reward', checklist: 'review',
};

export const LABEL_OF = {
  vocab: 'Vocabulary', grammar: 'Grammar', reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', talk: 'Speaking',
  review: 'Mistake clinic', 'mock-listening': 'Mock · Listening', 'mock-reading': 'Mock · Reading', 'mock-writing': 'Mock · Writing', 'mock-speaking': 'Mock · Speaking',
  tips: 'Exam eve', checklist: 'Exam eve',
};

export function describe(task, date) {
  const q = `?task=${date}~${task.id}`;
  const { kind, ref, variant } = task;
  switch (kind) {
    case 'vocab':
      if (variant === 'new') {
        const first = WORDS[ref.start];
        return { title: `${ref.count} new words`, detail: `${first?.topic ?? 'Vocabulary'} · plus the words due for review`, to: `/words/study${q}` };
      }
      return { title: 'Vocabulary review', detail: 'Only the words due today, plus any you added', to: `/words/study${q}` };
    case 'grammar':
      return { title: GRAMMAR[ref].title, detail: GRAMMAR[ref].summary, to: `/grammar/${GRAMMAR[ref].id}${q}` };
    case 'reading':
      return variant === 'app'
        ? { title: READING[ref].title, detail: `${READING[ref].level} · timed, then marked`, to: `/reading/${READING[ref].id}${q}` }
        : { title: 'A passage from your book', detail: 'Cambridge IELTS or an official test, then log your score', to: `/book/reading${q}` };
    case 'listening':
      return variant === 'app'
        ? { title: LISTENING[ref].title, detail: `${LISTENING[ref].level} · played once`, to: `/listening/${LISTENING[ref].id}${q}` }
        : { title: 'A section from your book', detail: 'Cambridge IELTS or an official test, then log your score', to: `/book/listening${q}` };
    case 'writing':
      return variant === 'task1'
        ? { title: `Task 1 · ${CHARTS[TASK1[ref].chart]}`, detail: 'At least 150 words · AI feedback available', to: `/writing/${TASK1[ref].id}${q}` }
        : { title: `Task 2 · ${TASK2[ref].kind.toLowerCase()} essay`, detail: 'At least 250 words · AI feedback available', to: `/writing/${TASK2[ref].id}${q}` };
    case 'speaking':
      if (variant === 'part1') return { title: `Part 1 · ${PART1[ref].topic}`, detail: 'Short, natural answers, recorded', to: `/speaking/part1/${ref}${q}` };
      if (variant === 'full') return { title: 'Full speaking test', detail: 'Parts 1–3 with the AI examiner or recorded', to: `/speaking/full/${ref}${q}` };
      return { title: 'Part 2 · cue card', detail: CUE_CARDS[ref].title, to: `/speaking/card/${ref}${q}` };
    case 'talk':
      return { title: '5-minute conversation', detail: 'Talk with the AI examiner about anything: daily fluency', to: `/talk${q}` };
    case 'review':
      return { title: 'Mistake clinic', detail: 'Go back over this week’s wrong answers, and ask the tutor why', to: `/review${q}` };
    case 'mock-listening':
      return variant === 'app'
        ? { title: 'Full Listening test', detail: '4 sections · 40 questions', to: `/mock/listening${q}` }
        : { title: 'Full Listening test from your book', detail: 'One sitting, then log your score', to: `/book/listening${q}&full=1` };
    case 'mock-reading':
      return variant === 'app'
        ? { title: 'Full Reading test', detail: '3 passages · 40 questions · 60 minutes', to: `/mock/reading${q}` }
        : { title: 'Full Reading test from your book', detail: 'One sitting, then log your score', to: `/book/reading${q}&full=1` };
    case 'mock-writing':
      return { title: 'Full Writing test', detail: 'Task 1 and Task 2 in 60 minutes', to: `/mock/writing/${ref}${q}` };
    case 'mock-speaking':
      return { title: 'Full Speaking test', detail: 'With the AI examiner, Parts 1–3', to: `/speaking/full/${ref}${q}` };
    case 'tips':
      return { title: 'Re-read your unlocked insights', detail: 'A calm review: no new material today', to: `/rewards${q}` };
    case 'checklist':
      return { title: 'Exam-day checklist', detail: 'ID, route and timing: get everything ready', to: `/exam-day${q}` };
    default:
      return { title: kind, detail: '', to: '/' };
  }
}

// "?task=2026-10-19~reading" → { date, id }
export function taskFromSearch(search) {
  const v = new URLSearchParams(search).get('task');
  if (!v) return null;
  const [date, id] = v.split('~');
  return date && id ? { date, id } : null;
}
