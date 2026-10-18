# Band Seven

A daily IELTS Academic study plan that works in the browser, free, with no account or API key.

Live: https://lamia-mim.github.io/band-seven/

Set your exam date and how many sections you want each day (2 or all 4). The app builds a plan up to the day before the exam, in four phases: Foundation, Skill building, Exam practice and Final stretch. Every day has a short list of tasks. Finish them all to unlock the next reward.

## What's inside

- **Daily plan.** Two sections a day (Reading + Speaking, then Listening + Writing) or all four. Vocabulary every day, grammar in the first phase, a weekly review day, and weekly mock tests in the last two phases.
- **Grammar.** 12 lessons from the basics, each with the mistakes Bangla speakers make most often and a quiz.
- **Vocabulary.** 300 academic and topic words with Bangla meanings, synonyms and examples. Flashcards use spaced repetition.
- **Reading.** Three original Academic passages (40 questions: True/False/Not Given, headings, matching, completion, multiple choice), marked automatically with a band estimate.
- **Listening.** Four original sections in IELTS order (40 questions), read aloud by the browser's built-in voices.
- **Writing.** Six Task 1 visuals drawn from data and 24 Task 2 prompts, with a timer, a word count, a Band 7 checklist and model answers that unlock after you submit your own.
- **Speaking.** 15 Part 1 topics and 40 cue cards with Part 3 questions. Your answers are recorded on the device and, in Chrome and Edge, transcribed to count words per minute, filler words and vocabulary variety.
- **Mock tests.** A full Listening and Reading test with band conversion, timed Writing and Speaking tests, and score entry for tests from Cambridge books.
- **Rewards.** An Examiner Secret card for every finished day, a Band 7 phrase pack for every 7-day streak, and a guide at the end of each phase.
- **Library.** Keep your own PDFs and images in the browser (IndexedDB). They are never uploaded.
- **Works offline.** Installable as a PWA. Progress is stored on the device; Settings has backup and restore.

The Cambridge IELTS books are copyrighted, so they are not included. Students can add copies they own to their Library, and the app links to free official practice material.

## Stack

React 18, Vite, React Router (hash routing for GitHub Pages), vite-plugin-pwa, idb-keyval. Browser APIs: Web Speech (speech synthesis and recognition), MediaRecorder, IndexedDB.

The plan generator ([`src/lib/plan.js`](src/lib/plan.js)), rewards ([`src/lib/progress.js`](src/lib/progress.js)), spaced repetition, band conversion and marking are pure functions with unit tests.

## Develop

```sh
npm install
npm run dev
npm test        # plan, rewards, marking, bands and content checks
npm run deploy  # build and publish to the gh-pages branch
```
