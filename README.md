# Band Seven

A personal IELTS Academic study plan in the browser, with an AI tutor and a voice speaking examiner. Free, no account.

Live: https://lamia-mim.github.io/band-seven/

A short setup asks for your exam date, level, target band, how each skill feels (1–5) and how much time you have each day (30–120 minutes, 5–7 days a week). The app builds a plan up to the day before the exam, in four phases (Foundation, Skill building, Exam practice, Final stretch) sized to the time you have, with your weakest skills practised most.

## What's inside

- **Daily routine.** Each day is a short timeline the way high scorers study: vocabulary warm-up, a grammar foundation, a timed focus session, a second skill, and daily speaking. Weekly review days early on, weekly full mocks later, rest days that don't break your streak, and a calm exam eve.
- **AI tutor.** Ask anything in English or Bangla, by text or voice. Every wrong Reading, Listening and grammar answer has a "Why?" button that explains the trap.
- **Voice room.** A full Speaking test (Parts 1–3 with a cue card and one minute to prepare) or a free conversation, spoken aloud and answered by voice, then band estimates and corrections.
- **AI writing feedback.** Criterion-by-criterion band estimates, top corrections and a paragraph rewritten to Band 7+.
- **Vocabulary.** 300 academic words with Bangla meanings, plus your own words (the AI can fill in the meaning, synonyms and an example). Flashcards use spaced repetition.
- **Practice content.** 12 grammar lessons, a full Reading and Listening test (original material), 6 Task 1 visuals, 24 Task 2 prompts, 15 Part 1 topics and 40 cue cards, a mock test centre and score entry for Cambridge books.
- **Rewards that teach.** XP and ten levels; each level unlocks a masterclass (essay blueprint, Band 6 vs Band 8, Part 2 story method, Listening traps, pronunciation for Bangla speakers…). Badges, a phrase pack and a streak shield every 7-day streak, an examiner insight for every finished day, and a guide at the end of each phase.
- **Library, offline, backup.** Keep your own PDFs and images on the device. Installable as a PWA.

### How the AI runs

Students choose in the app:

- **On this device** (default): an open model (Llama 3.2 1B, Qwen3 1.7B or 4B) runs in the browser with WebLLM and WebGPU. Free and private, but a 1–3 GB one-time download and a recent laptop or phone are needed.
- **Gemini** with the student's own free API key from Google AI Studio.
- **Claude** with the student's own Anthropic API key.

Keys stay in the browser's storage, are sent only to that provider, and are left out of backups. Speech uses the browser's built-in recognition and voices (best in Chrome and Edge); when recognition isn't available, the Voice room takes typed answers.

The Cambridge IELTS books are copyrighted, so they are not included. Students can add copies they own to their Library, and the app links to free official practice material.

## Stack

React 18, Vite, React Router (hash routing for GitHub Pages), vite-plugin-pwa, idb-keyval, WebLLM (in a Web Worker, loaded only when chosen), the Anthropic SDK and the Gemini REST API. Browser APIs: Web Speech, Web Audio (mic level for the voice orb), MediaRecorder, IndexedDB, WebGPU.

The plan generator ([`src/lib/plan.js`](src/lib/plan.js)), rewards ([`src/lib/progress.js`](src/lib/progress.js)), spaced repetition, band conversion and marking are pure functions with unit tests.

## Develop

```sh
npm install
npm run dev
npm test        # plan, rewards, levels, badges, marking, bands and content checks
npm run deploy  # build and publish to the gh-pages branch
```
