# Medication Management Dashboard

A carer-facing medication management tool, designed around a carer supporting someone with multiple disabilities.

Originated as a team entry for CodeForAll 2026 (Track 5, organised by Eli Lilly and Company). Now continued as a solo project, taking the hackathon prototype and building it into something that works rather than something that demonstrates.

This file is the source of truth for anyone, human or agent, working on this repo. `CLAUDE.md` is a one-line import of it so every tool reads the same document. Put project knowledge here, never in `CLAUDE.md`.

## Provenance

The first commit is the hackathon build exactly as the team delivered it. Everything after it is solo work. `git diff <first-commit>..main` is the record of what changed and by whom.

## Who this is for

**Asha**, 63, lives with conditions affecting her vision, mobility and cognition. **Meera**, her daughter, is her carer and manages her medication routine with no tools, no guidance and no shared system. The logistical and emotional load falls entirely on Meera.

The product goal: help a carer like Meera support a loved one's medication routine clearly and confidently, without navigating fragmented systems alone.

Both Asha and Meera are users. A change that helps one at the other's expense is a regression.

## Product boundaries

**The app must not provide medical advice or clinical guidance, and must not make healthcare decisions on a user's behalf.** The app records and presents what the carer entered. It never interprets.

This began as a rule in the hackathon brief and is kept as a deliberate product decision. A tool that logs and surfaces is useful, honest about what it is, and safe to ship. A tool that advises is a regulated medical device with a liability surface, built by someone unqualified to build it.

What crosses the line:

- Suggesting, calculating or adjusting a dose
- Warning about an interaction, a contraindication or a side effect
- Interpreting a symptom, or asking about symptoms in order to interpret them
- Presenting a logged pattern as a health conclusion, such as "adherence is poor, consider speaking to your GP"
- Copy phrased as instruction in the app's own voice, such as "Take this with food"

That last one is where accidental violations happen, and the fix is attribution. The app may display "Meera's note: take with food", because that is a record of what a carer entered. It may not display "Take with food" unattributed, because that is the app giving instruction.

The test: is the app acting as a notebook or as a clinician? Notebook is the only acceptable answer.

## Scope discipline

The product targets specific moments in a carer's routine, not the whole patient journey. One moment handled completely is worth more than five handled partially, both as a product and as a portfolio piece. Resist growth into a general health platform.

## Data model

Decided. These are the rules the schema follows, and the reasoning is kept because the reasoning is the point.

### Three concepts, kept separate

- **Medication** is a definition: name, strength, form, instructions, carer notes. No relationship to time.
- **Schedule** is intent: which medication, at what time of day, valid over a date range.
- **Dose event** is a record of something that happened, belonging to one scheduled occurrence.

The original export welded all three onto a single `Medication` type with a `status` field, which is why the app had no concept of tomorrow.

### Derive occurrences, do not materialise them

A dose event is stored **only when a dose is acted on**. A day's doses are computed by applying the schedules in force on that date and matching them against whatever events exist.

Pending is therefore an absence, never a stored value. So are "due soon" and "overdue", which are functions of the schedule and the current time. Nothing ticks rows over in the background and nothing can drift out of date.

Storage grows with what happened rather than with the passage of time, and there is no generation job and no horizon to maintain.

### Occurrence key

An event is identified by its medication, its local date, and its schedule slot. For example medication 3, 2026-10-11, 08:00.

This is a natural composite key, not a surrogate id. It makes logging idempotent: a second write for the same occurrence lands on the same key rather than creating a duplicate. That matters because mis-taps are expected, which is the same reason the 44px target floor exists.

### Schedules are superseded, never edited

**Never update a schedule row in place.** To change a schedule, close the current one with an end date and create a new one starting from the change.

If a schedule is edited in place, resolving a past date produces slots that no longer match the events recorded against the old slots, and history silently disappears. Superseding means any past date resolves through the schedule that was in force on that date, so recorded events keep matching and the past stays true while the future changes freely.

### Wall clock versus instant

- A schedule's time of day is **wall clock**. 8am means 8am regardless of what the clocks are doing. Store it as a local time.
- An event's `recordedAt` is an **instant**. Store it as UTC.

Storing scheduled doses as absolute instants means that when the clocks change, an 8am dose silently becomes a 7am or 9am dose, twice a year, and nobody notices. Keying occurrences on local date plus local slot avoids this because the key is the human-meaningful thing, and the instant is derived for display and sorting.

Known accepted limitation: the autumn hour that occurs twice collides with itself under this key. Out of scope.

### Dose event fields

- The medication and the occurrence key
- An outcome, from a small set describing whether the dose was given
- A structured reason, **required when a dose was not given**
- An optional free-text note
- `recordedAt`, the instant the carer logged it
- `recordedBy`

`recordedAt` is deliberately separate from the scheduled time. The gap between them is information: logging at 8:05 for an 8:00 dose is a routine running smoothly, and logging at 11pm for the same dose is a routine under strain. Same outcome, different story, and only visible if both are kept.

### Outcomes and reasons are separate fields

The original `pending | taken | missed` flattened facts that are not alike. Asha refusing is her exercising autonomy. A dose withheld following clinical advice is a correct and deliberate action. "I was unable to administer the medicine" is a signal about Meera's capacity, not about Asha. Those are three different things and must not share one value.

The outcome says whether the dose was given. The reason says why not. Both are stored.

### Presentation does not live in data

Medication colour is stored as a semantic token, never as a Tailwind class or a hex value. Data carrying `bg-[#E27064]` cannot be recoloured by high-contrast mode, which breaks the first invariant below.

## Persistence

Decided: **local-first, IndexedDB, behind a repository interface.** No backend, no auth, no network layer.

Reasoning. A carer tool should not require an account to work, and nothing about Asha's routine needs to leave her daughter's device. Choosing this deliberately and saying so is stronger than an unfinished API. IndexedDB rather than localStorage because dose events are an append-heavy log and localStorage is synchronous.

The repository interface matters more than the choice. All persistence goes through it, so no component touches storage directly, and swapping to a server later is one implementation rather than a refactor. The point is that the decision stays cheap to reverse.

## Invariants

Properties of the code that must hold. Breaking one produces code that builds clean, looks correct, and is wrong.

- **Every accessibility setting must drive the rendered output.** Theme, text size, colour-safe mode, reduced motion and simplified layout must each resolve to a root attribute or design token the UI actually reads. A setting held only in component state is decoration.
- **A dose is an event in time, never a status on a medication.** See the data model above.
- **Schedules are superseded, never mutated.**
- **Minimum interactive target is 44x44 CSS pixels.** WCAG 2.2 AA floors at 24x24, but Asha has reduced grip strength and limited fine motor control, so 44 is this project's floor. No exceptions for icon buttons.
- **No action may require dragging, pinching, a long press, or two hands.** Any such gesture needs a single-tap equivalent that is equally discoverable.
- **Changing view must be announced.** The app swaps rendered views rather than navigating, so a screen reader user gets no signal unless focus moves to the new view's heading and a polite live region announces the change. Both, not either.
- **Synthesised speech must never compete with a real screen reader.** Read-aloud defaults off, or is presented clearly as an alternative to assistive technology rather than an addition to it.
- **A recorded reason is never discarded.** If the UI collects it, the model stores it.
- **Destructive actions are confirmable and recoverable.** Meera is often tired and in a hurry.

## Accessibility

Accessibility is the point of this project, not a compliance exercise. It is a tested property.

Full WCAG 2.2 detail lives in the `accessibility` skill rather than in this file, so it loads when relevant instead of taxing every turn. The floor:

- Contrast 4.5:1 for body text, 3:1 for large text, UI components and focus rings, verified in every theme the app offers rather than only the default
- Visible `:focus-visible` on everything interactive, never `outline: none` without a replacement
- Usable at 200% zoom with no loss of content or function
- `prefers-reduced-motion` honoured in CSS, independently of the in-app toggle
- Form errors announced via a live region or `role="alert"`, `aria-invalid` on the field, focus moved to the first error on submit
- A keyboard-only pass and a real screen reader pass, VoiceOver or NVDA, before any release

Automated tools catch a subset. A clean axe or Lighthouse run is not conformance and is not evidence that Asha can use this. Write up the manual passes; the record of them is part of the work.

## Stack and commands

React 19, Vite, Tailwind CSS v4 via `@tailwindcss/vite`, TypeScript, oxfmt. Versions live in `package.json` and are not restated here.

```
pnpm install
pnpm dev       # dev server
pnpm build     # production build, must pass clean
pnpm check     # typecheck and build, the gate
pnpm format    # oxfmt
```

Tailwind v4 is configured through the Vite plugin and `src/index.css`. There is deliberately no `tailwind.config.js` and no PostCSS config. Theme customisation and `@font-face` rules belong in `src/index.css`.

## Skills

Three skills carry the detail that would otherwise bloat this file. They load on demand, so the depth is available when it is relevant and costs nothing when it is not.

- **`accessibility`** is committed in this repo at `.claude/skills/accessibility/`, so it is available to anyone who clones. WCAG 2.2 reference and an evidence-led audit workflow. Use it before and after any change that touches the UI, with the dev server running so it can audit a rendered page rather than infer from source.
- **`screen-reader-pass`** is the manual NVDA and VoiceOver procedure, the task list to walk, and the write-up format. Use it before any release. Its output belongs in `docs/accessibility/`.
- **`codeforall-review`** reviews the whole project against the product boundary, the data model invariants and the conventions in this file. Use it before showing the repo to anyone.

The last two are account-level rather than committed. Copy them into `.claude/skills/` if they should travel with the repo.

Invoke a specific one by name rather than relying on automatic matching, since all three overlap on the word accessibility.

## Structure

The project began as a Figma Make export, so `src/App.tsx` currently holds the entire application: every screen, all state, and the icon set. It is being decomposed, so treat any structure description as provisional and read the directory rather than trusting a map.

Stable points:

- `src/main.tsx` mounts the app and imports `src/index.css`
- `src/index.css` is the only global stylesheet and the Tailwind entry point
- `index.html` is the Vite shell

## Current state

Honest inventory, so nobody mistakes a placeholder for a bug or a stub for a feature.

Keep this section and Known issues accurate as work lands. They are the only parts of this file that change during normal work.

- The five accessibility settings drive the rendered output. Theme, text size, colour-safe and simplified layout are attributes on the patient view root, read by the semantic tokens and the `simplified` variant in `src/index.css`. Reduced motion is an attribute on `<html>`
- Every screen uses the semantic colour tokens. The high-contrast, dark and colour-safe token values have not been measured for contrast or checked in a browser yet
- The codebase has never been run through `pnpm format`. Running it restyles every file, so it has been left alone until that is done as its own change
- Medication data, patient profile, carer details and consent record are seeded in memory and reset on refresh
- No persistence layer yet
- No tests
- Dose state still lives on the medication object, contradicting the data model above
- Schedule times are still stored as display strings (`time: "8:00"`, `period: "AM"`) and parsed with `split(" ")`
- `.figma/make/` is leftover harness tooling from the export and is unused

## Known issues

- **`saveMissed` discards the reason.** It sets a status and clears the reason state without storing it, while showing a toast claiming the reason was saved. The current model has nowhere to put it. Fixed by the dose event model.
- `id: Date.now()` is used for new medications, which collides within a millisecond and leaks a timestamp as identity.
- `reminderTimes` exists only on medications added at runtime, not on seeded ones, so the shape is inconsistent.

## Still open

**Correction semantics.** When a carer logs the wrong thing, does the event get overwritten, or is a correction appended with the latest winning? Overwriting is simpler and loses the mistake. Append-only gives a full audit trail and is what a clinical system would do, at the cost of more work everywhere that reads events. Not yet decided. Record the decision here when it is made.

## Conventions

- Prefer native interactive elements. A `<button>` gets focus, keyboard activation and correct semantics for free; a `div` with `role="button"` needs all three added by hand and usually ends up with two.
- Name things as a user would. Meera manages reminders, not notification schedules.
- An action keeps the same verb through its whole flow. A button reading "Log dose" produces a confirmation reading "Dose logged".
- Errors and empty states give direction, not apology. An empty screen is an invitation to act.
- No component touches storage directly. Everything goes through the repository.
- Use double quotes for strings containing apostrophes. An unescaped apostrophe in a single-quoted string breaks the build.
- Do not add a dependency without saying what it replaces and why hand-rolling is worse.

## Git

- **As few commits as possible.** Group related work into one commit rather than splitting it up. A whole feature area, or the same migration applied across several screens, is one commit. Never commit per file or per screen. Unrelated changes still stay separate.
- **Short imperative subject line**, under about 60 characters, no full stop. "Wire accessibility toggles to root attributes", not "wired up some toggle stuff and fixed a thing".
- **Always include a body.** Two to four lines, or a few short bullets, covering what changed and why. Enough that someone reading `git log` a month later understands the commit without opening the diff. It summarises, it does not list files, and it gives the reason wherever the reason is not obvious from the subject.
- **No trailers of any kind.** No co-author lines, no generated-with footers, no emoji. The history is the author's own work and should read that way.
- **Never commit a failing gate.** `pnpm check` passes first.
- **Commit and push when a unit of work is complete**, without being asked each time. Do not ask whether to commit; do ask before anything that rewrites history or force pushes.
- **Budget.** The project is expected to reach a finished state in roughly thirty commits in total. Size work accordingly: if a task would naturally produce three commits, it is one commit.

## Verification

Nothing is committed until these pass:

```
pnpm check     # typecheck and build
```

As they are added, the gate grows to include the test suite and the axe pass. Treat the gate as the definition of done, not as a formality run at the end.

A clean gate is not proof of correctness here. The invariants in this file are the subtle kind: a dose status written back onto a medication, a schedule updated in place, or contrast dropping below 4.5:1 all compile cleanly. Check those by reading, not by building.

## Unattended runs

Rules for headless runs (`claude -p`) and any session where nobody is available to answer a question. The file is the only thing holding the line, so it holds it strictly.

- **Decide, do not stall.** Where a choice is not already settled by this file, make it using the principles here and keep going. The tiebreaker is whichever option better serves Asha and Meera as described above.
- **Record every decision.** Put the reasoning in the commit body, and append an entry to `docs/DECISIONS.md`: the date, what was chosen, what the alternative was, and why. A decision nobody wrote down costs more later than the minute it saved. This log is the project's reasoning and it is expected to grow.
- **Flag the significant ones** in the run output, so a choice that is cheap to reverse now gets reviewed while it still is.
- **Stop only for these:** anything that contradicts an invariant, a product boundary, or a decision already recorded in this file; anything irreversible, meaning rewriting history, force pushing, deleting branches or deleting data; adding or upgrading a dependency.
- **Do not modify this file**, except the Current state and Known issues sections, which must be kept accurate as work lands. Everything else here, and everything under `.claude/`, is off limits.
- **If the gate fails** and the fix is not obviously within the scope of the task, revert the working tree rather than committing something broken or patching around it.
- **Scope stays where it was set.** Do the task asked, not the adjacent work that looked related.

## Working agreement

Implementation help is welcome. Judgment is not delegated.

- **Decisions get recorded, not skipped.** New architectural choices can be made as the work goes, provided the reasoning lands in `docs/DECISIONS.md` and the commit body. Changing a decision already recorded in this file is a conversation first.
- **Explain the reasoning alongside the change**, not just the result. The trade-off considered and rejected is as useful as the one taken.
- **Nothing lands unread.** Code that goes in is code the author has read and can explain. Work in pieces small enough for that to be true.
- **Say when a request conflicts with an invariant or a product boundary**, before doing it rather than after.
- **Prefer the smallest change that works.** No speculative abstraction, no refactoring adjacent code that was not asked about.
