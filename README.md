# AccessCare

A medication notebook for a carer and the person they support. It lists each day's doses, lets either of them log what happened to each one, and keeps that log on the device.

It is a notebook, not a clinician. It records what you enter and shows it back. It never gives medical advice.

## The problem

Asha is 63 and lives with conditions affecting her vision, mobility and cognition. Meera, her daughter, manages Asha's medication routine with no tools, no guidance and no shared system. The logistical load and the worry both land on Meera.

The moment this project targets is the one that repeats several times a day: a dose is due, something happens to it, and somebody needs to know afterwards what that was. Was it given? If not, why not? Who wrote that down, and when?

Both of them use the app, and they need different things from it:

- **Meera** needs to read the state of today at a glance when she is tired and in a hurry, and to log a dose in one press.
- **Asha** needs a view she can actually use: high contrast, large text, large targets, no gestures, and nothing that talks over her screen reader.

A change that helps one at the other's expense is a regression.

## What is built

- **Today's doses**, in time order, each logged as given or not given in one press. Due soon and overdue are worked out from the clock and shown to the carer only.
- **A reason for every dose not given**, chosen from seven and stored with the dose: did not want it, asleep, unwell, not available, withheld on clinical advice, carer not able, other. These are different facts and are kept apart.
- **A medicine log** showing when each dose was due, when it was logged and by whom. The gap between those two times is kept, because 8:05 for an 8:00 dose and 11pm for the same dose are different days.
- **Prescriptions** added from what the carer types. Removing one asks first, keeps everything already logged, and can be undone from a list of removed prescriptions.
- **A patient view** for Asha with its own theme (light, high contrast, dark), text size, simplified layout, colours that do not rely on red and green, and an optional read aloud button. It can be read-only, or she can log her own doses in her own words.
- **First run and an example.** A new device starts empty and asks for two names. There is also a made-up week to look around in, which is labelled as an example on every carer page and can be cleared.

## What is deliberately not built

**No medical advice.** The app does not suggest, calculate or adjust a dose, warn about interactions or side effects, interpret a symptom, or turn the log into a conclusion about anyone's health. Where an instruction appears on screen it is attributed, as in "Meera's note: with breakfast", because that is a record of what a carer wrote. Unattributed, the same words would be the app giving instruction.

This began as a rule of the hackathon brief and is kept as a product decision. A tool that logs and shows is useful, honest about what it is, and safe to ship. A tool that advises is a regulated medical device with a liability surface, built by someone unqualified to build it.

**No account, no server.** Everything is kept in IndexedDB in the browser. A carer tool should not need a sign-up to work, and nothing about Asha's routine needs to leave her daughter's device. All storage goes through one `Repository` interface (`src/storage/`), so moving to a server later would be one new implementation rather than a rewrite. The cost is real and stated in the app: another phone or computer will not show the same data.

**No alarms.** The app shows when each dose is due. It does not sound an alert or send a notification, and it says so wherever reminder times appear, because a promised alarm that never rings is worse than none.

**Nothing that only looks like it works.** The hackathon prototype had buttons that showed a confirmation and did nothing: snooze, export, email summaries, calls to an on-call doctor who did not exist. They have been removed rather than left in for show.

## How the data works

The reasoning is in [`docs/DECISIONS.md`](docs/DECISIONS.md). The short version:

- A **medication** is a definition, a **schedule** is intent over a date range, and a **dose event** is a record of something that happened. The prototype had all three on one object with a status field, which is why it had no concept of tomorrow.
- A dose event is stored **only when a dose is acted on**. Pending, due soon and overdue are never stored. They are worked out from the schedule and the clock, so nothing can drift out of date.
- An event is keyed by **medicine, local date and time slot**. Logging the same dose twice lands on the same record, so a mis-tap cannot create a duplicate.
- A schedule is **never edited**. To change a time, the old schedule is ended and a new one begins, so past days still resolve through the schedule that was in force and logged doses keep their place.
- A schedule's time is **wall clock** and an event's timestamp is an **instant**. An 8:00 dose stays at 8:00 when the clocks change.

Each of those is covered by a test in `src/model/doses.test.ts`.

## Accessibility

Accessibility is the point of the project, and the parts of it that can be checked by a machine are part of the gate:

- `src/accessibility.test.tsx` renders every view, dialog and failed form, with the example loaded and with nothing entered, and runs axe-core on each.
- `src/contrast.test.ts` checks every text, border and focus ring colour pairing in all three themes, with colour-safe mode on and off: 4.5:1 for text at any size, 3:1 for the rest.
- Every control is at least 44 by 44 CSS pixels, which is the project's floor rather than WCAG's 24. Nothing needs a drag, a pinch, a long press or two hands.
- A change of view moves focus to the new heading and is announced. Dialogs are native modal dialogs. Form errors are announced, tied to their field, and focus moves to the first.
- Read aloud is off unless switched on, speaks only when its button is pressed, and is offered in place of a screen reader, not on top of one.
- Reduced motion follows the device setting and the in-app setting independently, both in CSS.

**What has not been done.** A clean automated run is not conformance. The app has not yet had a keyboard-only pass, a screen reader pass with VoiceOver or NVDA, or a check at 200% zoom in a real browser. Those are the next piece of work, and until they are written up in `docs/accessibility/` nothing here is evidence that Asha can use it. The full list of what is known to be unfinished is in [`AGENTS.md`](AGENTS.md) under Current state and Known issues.

## Running it

Needs Node 22 and pnpm 10 (versions are pinned in `.mise.toml`).

```
pnpm install
pnpm dev       # dev server, prints the address to open
pnpm check     # typecheck, tests, and a production build: the gate
pnpm test      # the tests only
pnpm build     # production build into dist/
pnpm preview   # serve the production build locally
```

On first open, either enter two names or choose "Load the example" to see a week of data. The example is cleared from Settings.

## Deploying

The app is a static site. `.github/workflows/deploy.yml` publishes it to GitHub Pages on every push to `main`, after running the full gate.

One-time setup: in the repository on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**. After the next push to `main` (or a manual run of the workflow from the Actions tab), the site is at:

```
https://<your-username>.github.io/medication-management-dashboard/
```

A project site is served from a sub-path, so the workflow sets `BASE_PATH` to `/<repository-name>/` and `vite.config.ts` uses it as Vite's `base`. To build for a sub-path by hand, set the same variable:

```
BASE_PATH=/medication-management-dashboard/ pnpm build
```

Leave it unset for a host that serves the app from the root.

Data is stored per browser and per site address, so the deployed copy and a local copy do not share anything.

## Where it came from

AccessCare began as a team entry for CodeForAll 2026, Track 5, organised by Eli Lilly and Company. The first commit in this repository is the hackathon build exactly as the team delivered it. Everything after it is solo work, taking a prototype that demonstrated and making it into something that works.

```
git diff $(git rev-list --max-parents=0 HEAD)..main
```

is the record of what changed since.

## Repository map

- `AGENTS.md` is the source of truth for the project: who it is for, the product boundary, the data model, the invariants, and an honest inventory of the current state.
- `docs/DECISIONS.md` is every decision made along the way, with the alternative that was rejected and why.
- `src/model/` is the dose model as types and pure functions.
- `src/storage/` is the repository interface, its two implementations, and the example data.
- `src/state/` is the React state, as hooks.
- `src/screens/` and `src/components/` are the views.
