# Decisions

A record of choices made on this project: what was chosen, what the alternative was, and why. Newest entries go at the bottom.

Format for each entry: date, the decision as a statement, the alternative that was rejected, and the reasoning. Keep them short. The reasoning is the point, not the ceremony.

---

## 2026-10-10: The app records, it never interprets

**Decision.** The app stores and presents what the carer entered. It does not give medical advice, clinical guidance, dosing suggestions, interaction warnings, or health conclusions drawn from logged data.

**Alternative.** Add the helpful-looking features a medication app is expected to have: interaction checks, adherence warnings, reminders phrased as instructions.

**Why.** This began as a constraint in the CodeForAll brief and is kept deliberately. A tool that logs and surfaces is useful and honest about what it is. A tool that advises is a regulated medical device with a liability surface, built by someone unqualified to build it. The test is whether the app is acting as a notebook or as a clinician.

---

## 2026-10-10: Local-first persistence with IndexedDB, behind a repository interface

**Decision.** All state persists to IndexedDB on the device, reached only through a repository interface. No backend, no accounts, no network layer.

**Alternative.** A backend with authentication, giving Asha and Meera a shared log across devices.

**Why.** A carer tool should not require an account to work, and nothing about Asha's routine needs to leave her daughter's device. IndexedDB over localStorage because dose events are an append-heavy log and localStorage is synchronous. The repository boundary matters more than the choice itself: swapping to a server later is one implementation rather than a refactor, so the decision stays cheap to reverse. A backend remains possible as a later phase, justified by the shared-log need rather than by wanting one.

---

## 2026-10-10: Medication, Schedule and DoseEvent are three separate concepts

**Decision.** A medication is a definition with no relationship to time. A schedule is intent, valid over a date range. A dose event records something that happened.

**Alternative.** Keep the original shape, a single `Medication` type carrying a `status` field.

**Why.** A status on the medication means one status forever, which is why the original app had no concept of tomorrow. Separating the three makes history, adherence over time, and a yesterday view reachable at all.

---

## 2026-10-10: Dose occurrences are derived, not materialised

**Decision.** A dose event is stored only when a dose is acted on. A day's doses are computed by applying the schedules in force on that date. Pending, due soon and overdue are derived from the schedule and the clock, never stored.

**Alternative.** Generate a row for every future scheduled dose, each starting pending, then update it.

**Why.** Storage grows with what happened rather than with the passage of time. There is no generation job and no horizon to maintain, nothing ticks rows over in the background, and nothing can drift out of date. Changing a schedule does not require rewriting rows for days that have not happened.

---

## 2026-10-10: Events are keyed by medication, local date and schedule slot

**Decision.** A natural composite key, for example medication 3 on 2026-10-11 at 08:00, rather than a surrogate id.

**Alternative.** Give every event a generated id.

**Why.** It makes logging idempotent. A second write for the same occurrence lands on the same key instead of creating a duplicate, which matters because mis-taps are expected from a user with reduced fine motor control. It is also the same reason the 44px target floor exists.

---

## 2026-10-10: Schedules are superseded, never edited in place

**Decision.** To change a schedule, close the current one with an end date and create a new one starting from the change.

**Alternative.** Update the schedule row in place, which is the obvious implementation.

**Why.** An in-place edit means resolving a past date produces slots that no longer match the events recorded against the old slots. Those rows still exist but are orphaned, so history silently disappears. Superseding means any past date resolves through the schedule that was in force then, so the past stays true while the future changes freely.

---

## 2026-10-10: Schedule times are wall clock, event timestamps are instants

**Decision.** A schedule's time of day is stored as a local time. An event's `recordedAt` is stored as UTC. Occurrences are keyed on local date plus local slot.

**Alternative.** Store scheduled doses as absolute instants.

**Why.** 8am means 8am regardless of what the clocks are doing. Storing scheduled doses as instants means an 8am dose silently becomes 7am or 9am when the clocks change, twice a year, with nobody noticing. Keying on the human-meaningful value avoids it entirely.

**Accepted limitation.** The autumn hour that occurs twice collides with itself under this key. Out of scope.

---

## 2026-10-10: Outcome and reason are separate stored fields

**Decision.** The outcome says whether a dose was given. A structured reason says why not, and is required when it was not. Both are stored.

**Alternative.** The original `pending | taken | missed` enum.

**Why.** `missed` flattened facts that are not alike. Asha refusing is her exercising autonomy. A dose withheld following clinical advice is a correct and deliberate action. A carer being unable to administer is a signal about Meera's capacity, not Asha's. The original code collected a reason from a list of seven and then discarded it, which destroyed the most useful data in the app.

---

## 2026-10-10: Accessibility settings scope to the patient view, not the document root

**Decision.** `data-theme`, `data-text-size`, `data-colour-safe` and `data-simplified-layout` are set on the patient view root element. `data-reduced-motion` stays on `<html>`.

**Alternative.** Put all five on `<html>` so everything inherits them.

**Why.** These are Asha's settings: high contrast, large text, simplified layout. Meera is a sighted carer using the carer screens who wants density and information. Applying Asha's settings globally would degrade the carer's experience every time her accessibility needs were configured, which is exactly the regression the project rules out. Reduced motion is the exception because motion sensitivity concerns whoever is holding the device, and it should follow the OS preference anyway.

---

## 2026-10-10: Boolean data attributes are presence-based

**Decision.** Set the attribute when true, remove it when false. CSS matches bare `[data-colour-safe]`.

**Alternative.** Always present with a `"true"` or `"false"` value.

**Why.** Less verbose, and it removes a class of bug where a selector like `[data-colour-safe=true]` silently never matches because of a quoting mistake. It is also how HTML's own boolean attributes work.

---

## 2026-10-10: The DOM attribute is `data-theme`, not `data-patient-theme`

**Decision.** The state variable stays `patientTheme`; the attribute it writes is `data-theme`.

**Alternative.** Match the internal name.

**Why.** Internal naming and the public DOM contract do not have to agree, and `patient` is an implementation detail leaking outward. The scoping decision above already makes it unambiguous which subtree it applies to.

---

## 2026-10-10: Colour tokens are named by role, and near-duplicate values are collapsed

**Decision.** `src/index.css` defines one vocabulary in `@theme`, named for what a colour does: `page`, `surface`, `ink`, `line`, `primary`, `inverse`, `accent`, `danger`, `given`, `not-given`, `focus`, and their variants. Every screen uses these and no screen carries a hex value. Where the export had several values a shade apart doing the same job (four near-identical light greys, three divider greys, two reds for not-given text), they became one token.

**Alternative.** One token per existing hex value, which changes nothing visually but only renames the problem: a theme would have to override sixty values that mean a dozen things.

**Why.** A theme can only restyle what has a role. The collapsed values differ by amounts nobody would notice, and where two candidates existed the one with more contrast was kept. `given` and `not-given` are separate tokens from `accent` and `danger` even though they share values in the light theme, because a dose status is a different thing from a button and colour-safe mode needs to move one without the other.

**Accepted limitation.** Each theme block sets its tokens outright rather than deriving one token from another. A token written as `var(--other)` in `@theme` resolves at `:root` and would ignore an override further down the tree.

---

## 2026-10-10: Colour-safe mode moves dose status off the red/green axis

**Decision.** With `data-colour-safe` present, `given` and `not-given` resolve to blue and orange instead of green and red, in every theme.

**Alternative.** Leave the setting as it was: a flag that only added a badge reading "Icons and labels enabled", on a view that already shows an icon and a label for every status whether the setting is on or not.

**Why.** A setting has to change what is rendered or it is decoration. Icons and labels are not optional extras to switch on, they are the baseline, so the only thing left for this setting to do honestly is fix the palette. Red and green are the pair most often confused; blue and orange stay distinct under the common forms of colour vision deficiency.

---

## 2026-10-10: Text size scales Tailwind's type scale, not individual elements

**Decision.** `data-text-size` overrides the `--text-*` variables on the patient view root: 1.125 times for large, 1.25 times for extra large. Fixed line heights in the patient view became relative ones so they follow.

**Alternative.** The export's approach, a string of `[&_p]:!text-lg` selectors forcing sizes onto every paragraph, span and button with `!important`.

**Why.** The old selectors flattened the hierarchy, since small print and body text were forced to the same size, and they silently missed any element type nobody listed. Scaling the tokens keeps every size in proportion and covers anything added later. The multipliers match the sizes body text was already being forced to.

---

## 2026-10-10: Simplified layout is read from the attribute by a CSS variant

**Decision.** A `simplified:` variant matches inside `[data-simplified-layout]`. Secondary sections are always rendered and carry `simplified:hidden`.

**Alternative.** Keep the conditional render driven by component state, with the attribute alongside it as a second, unread source.

**Why.** One source for the setting, and it is the same one the other three patient settings use. `display: none` removes the section from the accessibility tree as well, so a screen reader user gets the same simplified page.

---

## 2026-10-10: A schedule holds one time of day, and its end date is exclusive

**Decision.** A schedule is one medication at one time of day, every day, from `startDate` up to but not including `endDate`. A medicine given twice a day has two schedules. Superseding sets the old schedule's `endDate` and the new schedule's `startDate` to the same date.

**Alternative.** One schedule per medication carrying a list of times, with an inclusive end date.

**Why.** With a list, moving the morning dose would supersede the evening dose along with it. One slot per schedule keeps a change as small as the thing that changed. The exclusive end means the two halves of a supersession share one date with no gap, no overlap and no day arithmetic, which is where off-by-one errors would otherwise live. Days of the week are not modelled: nothing in the app collects them yet.

---

## 2026-10-10: A recorded event is shown even when no schedule in force accounts for it

**Decision.** A day's occurrences are the slots of the schedules in force, plus any event recorded for that date whose slot none of them produces. Those carry a null schedule id.

**Alternative.** Resolve strictly through schedules and drop events that do not match.

**Why.** Supersession protects the past only if the change starts after the last recorded event. If Meera logs the 08:00 dose and then moves it to 09:00 starting the same day, the strict version hides what she logged. That is the failure supersession exists to prevent, so the read side does not depend on every caller choosing the date well.

---

## 2026-10-10: Logging the same occurrence again replaces the event, provisionally

**Decision.** `recordDose` replaces whatever is stored at the occurrence key. The latest write wins and the earlier one is not kept.

**Alternative.** Append corrections and read the latest, keeping the mistake as an audit trail.

**Why.** This is the correction question AGENTS.md lists as still open, and it is not being closed here. The model needed some behaviour for a second write, and replacing is what the natural key gives directly. Every read goes through `occurrencesOn`, so moving to append-only later changes `recordDose` and that one lookup. There is no function for removing an event yet, so a dose logged by mistake can be changed to the other outcome but not put back to pending. That belongs with the correction decision.

---

## 2026-10-10: Due soon starts 30 minutes before a dose, overdue 60 minutes after

**Decision.** An unrecorded dose is pending until 30 minutes before its time, due soon from then until 60 minutes after, and overdue beyond that. Both numbers are a parameter with these defaults.

**Alternative.** Overdue from the minute the scheduled time passes.

**Why.** Logging at 8:05 for an 8:00 dose is a routine running smoothly, and a screen that says overdue at 8:01 tells Meera otherwise. The window describes the clock, not the medicine: it is the same for every dose and says nothing about whether a late dose should still be given.

---

## 2026-10-10: `recordedBy` is a role, and identifiers are strings supplied by the caller

**Decision.** `recordedBy` is `carer` or `patient`. Medication and schedule ids are opaque strings passed in, never generated inside the model.

**Alternative.** Store a person's name in `recordedBy`, and keep numeric ids from `Date.now()`.

**Why.** With no accounts, the role is the only thing actually known, and a name would go stale when the carer details are edited. Generating an id needs a clock or randomness, which would stop the model functions being pure; taking it as an argument leaves that to the edge and retires the `Date.now()` collision when the UI is wired.

---

## 2026-10-10: Not-given reasons are a fixed set of seven, and medication keeps `purpose`

**Decision.** The reason is one of `refused`, `asleep`, `unwell`, `unavailable`, `withheld-on-clinical-advice`, `carer-unable`, `other`. The wording shown for each stays in the UI. `Medication` has the fields listed in AGENTS.md plus `purpose`, `colour` and an optional image.

**Alternative.** Store the sentence the carer picked, and drop `purpose` to match the listed fields exactly.

**Why.** The seven are the options the reason dialog already offers. The sentences contain the patient's name, so storing them would bake a display string into the record. `purpose` is carer-entered and already on screen, so dropping it would lose something the carer wrote. The existing "10 mg · 1 tablet" string splits into `strength` and `form`.

---

## 2026-10-10: The dashboard lists doses, not medications

**Decision.** "Today's prescriptions" renders one card per occurrence derived for today, and each card logs against its own occurrence key. A medicine given twice a day has two cards.

**Alternative.** Keep one card per medication and log against its first reminder time.

**Why.** One card per medication is the old shape with the status moved sideways: the second dose of the day would have no way to be logged. The cards carry the time in their accessible names so two doses of one medicine are told apart by a screen reader.

---

## 2026-10-10: Removing a prescription ends its schedules and keeps the definition

**Decision.** "Remove" closes the medication's open schedules from today. The medication record stays, and the prescriptions list shows only medications with a schedule in force.

**Alternative.** Delete the medication, as the export did.

**Why.** Dose events refer to a medication by id, so deleting it leaves log rows that cannot be named. Closing schedules is the same supersession rule applied to stopping a medicine: the past still resolves and nothing is destroyed, which also means an undo can be added later without a data change. The missing confirmation is listed under Known issues rather than fixed here.

---

## 2026-10-10: The clock is state, read every 30 seconds

**Decision.** `App` holds `now` and refreshes it on a 30 second interval. Due soon, overdue, today's date and the next dose are computed from it on each render.

**Alternative.** Compute from `new Date()` during render and rely on other state changes to re-render.

**Why.** Without a tick, a dashboard left open stays on "due soon" until something else happens to redraw it. Holding the time as state is not storing a status: nothing derived from it is written anywhere.

---

## 2026-10-10: Due soon and overdue are shown to the carer only

**Decision.** The labels appear on the carer dashboard. The patient view shows the next unlogged dose and its time, with no label.

**Alternative.** Show the same labels in both views.

**Why.** "Overdue" in front of Asha, who may not be the one who can act on it, reads as an instruction to take something now. Meera is the person the label informs. Overdue uses the highlight colour rather than the danger colour because a late dose is a fact about the clock, not an error.

---

## 2026-10-10: A dose logged from the patient view is recorded by the patient

**Decision.** `recordedBy` is `patient` for both patient view buttons, including "I did not take it", which hands over to the carer's reason dialog. Everything logged from the dashboard is `carer`.

**Alternative.** Record `carer` whenever the reason dialog is used, since the dialog is on the carer dashboard.

**Why.** The field should say who started the record. The flow through the carer's dialog is a leftover of the export and is worded for Meera, so this is the weakest call in this change and worth revisiting when the patient view gets its own flow.

---

## 2026-10-10: Prescription instructions are shown in the patient view with attribution, and no default is invented

**Decision.** The patient view's next-dose card shows the instructions as "Meera's note: ..." using the carer's name. A prescription added without instructions stores an empty string, where the export stored "Follow the prescription instructions". Read-aloud speaks the name, strength, form and time only.

**Alternative.** Keep the hardcoded "Take with breakfast and a full glass of water" and the placeholder sentence.

**Why.** The card had to stop being hardcoded to Medicine 2, so the sentence had to come from data, and unattributed it is the app giving instruction. A placeholder instruction written by the app is the same problem stored in the record. Instructions elsewhere on the carer screens are still unattributed and are left for the copy pass.

---

## 2026-10-10: New ids come from `crypto.randomUUID()`

**Decision.** Medication and schedule ids for prescriptions added at runtime are generated with `crypto.randomUUID()` in the event handler, outside the state updater.

**Alternative.** A counter, or `Date.now()` as before.

**Why.** It is built into the browser, so no dependency, and it does not collide or leak a timestamp. It needs a secure context, which localhost and any HTTPS host are. Generating outside the updater keeps the updater pure, so React running it twice in development cannot create two ids.

---

## 2026-10-10: Everything is read before the first render, and each change is written as it is made

**Decision.** `main.tsx` opens the repository and loads a snapshot before React renders anything, then passes both to `App`. After that the repository is only written to: one call per thing the carer did, such as `recordDose` or `addPrescription`, each resolving when its transaction completes.

**Alternative.** Render immediately with empty state and fill it in from an effect, or write the whole state back whenever anything changes.

**Why.** Rendering first means a moment where the dashboard shows no doses, or the default theme instead of Asha's high contrast one, before the stored values arrive. Reading a local database takes milliseconds, so waiting costs nothing visible and removes the loading state and the risk of an early write overwriting stored data with defaults. Writing per change keeps the interface shaped like the things a server would also accept, and means a dose event is one row put at its key rather than the whole log rewritten.

---

## 2026-10-10: The dose event store is keyed on the occurrence, and a medication is written with its schedules

**Decision.** The IndexedDB store for dose events uses the compound key date, time of day, medication id. Adding a prescription writes the medication and its schedules in one transaction.

**Alternative.** A generated key with the occurrence checked in code, and separate writes for the medication and each schedule.

**Why.** The occurrence key already makes logging idempotent in the model, and using it as the storage key makes the database enforce the same thing instead of trusting every caller. A medication stored without its schedules would exist but appear nowhere, so the two succeed or fail together.

---

## 2026-10-10: Profile, carer, consent and settings are one stored record

**Decision.** Everything that is not a medication, a schedule or a dose event is a single `Details` record. `App` compares it with what was last stored after each render and writes it when it differs. Reading merges the stored record over the defaults.

**Alternative.** A store or a record each for patient, carer, consent, accessibility settings and reminder preferences, written by each form.

**Why.** These are twenty-two independent fields held as separate pieces of state, edited in place with no save button on most of them. One record and one comparison persists all of them without touching every input, and cannot miss a field added later. Merging over defaults means a new field needs no migration. The cost is that the consent record is not separable from a theme choice in storage. That is acceptable while nothing reads them apart, and splitting it later is a change inside the repository.

---

## 2026-10-10: Demo data is seeded once, when the database is created

**Decision.** The three medicines, their schedules, two days of events and the Asha and Meera details are written in the same upgrade transaction that creates the stores.

**Alternative.** Seed whenever the stores are found empty, or ship with no data.

**Why.** Seeding on empty would bring the demo medicines back if every prescription were removed. Tying it to creation means it happens exactly once and cannot half-happen. Starting empty is the right end state, but the app has no first-run experience or empty states yet, so an empty database today would be a set of blank screens.

---

## 2026-10-10: When the database cannot be opened the app runs in memory and says so

**Decision.** If IndexedDB is missing or refuses to open, an in-memory repository is used for the visit, and a notice above every screen says that nothing changed will be kept. The same notice appears if a later write fails.

**Alternative.** Show an error instead of the app, or carry on silently.

**Why.** Meera can still read today's routine from a browser that will not store anything, which is better than a blank page. Carrying on silently is the worst option: she logs a dose, the screen agrees, and it is gone on the next visit. The notice lives in `main.tsx` rather than in `App` because the app has five separate screen roots and the notice has to be on all of them.

---

## 2026-10-10: A medicine photo is stored as a data URL

**Decision.** The photo chosen when adding a prescription is read with `FileReader` and kept in the medication record as a data URL.

**Alternative.** Keep using `URL.createObjectURL`, or store the file as a Blob and make an object URL each time the app loads.

**Why.** An object URL points at the memory of the page that made it, so once medications are persisted it would be a broken image after every refresh. A data URL is a plain string, so the record is self-contained and the `<img>` needs no change. A Blob would be smaller in storage but needs URLs created and revoked around every render of the image. The photo is not resized, which is listed under Known issues.

---

## 2026-10-10: Shared primitives are the markup that was already duplicated, and no more

**Decision.** `src/components/` holds five modules: `Icon`, `ToggleRow`, `Toast`, `Dialog` and `MedicationImage`. The first two were already components. The other three were the same markup written out twice in `App.tsx`: the toast, the dialog backdrop, panel and close button, and the medicine photo with its colour fallback. One component per file, named exports, no barrel file.

**Alternative.** Also extract `Button`, `Card` and `Avatar` primitives from the class strings repeated across the screens.

**Why.** The three that were extracted each had two copies that had to stay in step, and the dialog shell is where focus handling will have to go, so one copy is worth having before that work. Buttons and cards are different: there are about a dozen button class strings that differ in height, border weight and focus ring colour, and choosing variants for them is a design decision about which differences are intended, not a move. Doing it here would change how screens render inside a commit that is meant to change nothing. The avatars appear three times with three different colour pairs, which is not yet a pattern. The carer page shell stays in `App.tsx` because it closes over navigation state and belongs with the screen extraction.

The two medicine tiles were not quite identical: one fallback was a `div` with `aria-hidden` and the other a `span` without, and one photo had `shrink-0` and the other did not. `MedicationImage` uses a `span`, `aria-hidden` and `shrink-0` for both. The icon inside was already hidden from assistive technology, so nothing announced changes.

---

## 2026-10-10: Screens are separate components that take their data as props, and the move drops focus on navigation

**Decision.** Each screen is one component in `src/screens/`, with the carer page shell (`CarerPage`), the two dialogs, the navigation list and the time and reason formatting beside them. State stays in `App.tsx` and reaches the screens as props: the `Details` record for reading, the individual setters for writing, and one `shell` object that the six carer screens pass straight on to `CarerPage`. Props keep the names the values had in `App.tsx`, so the markup moved without being edited. The dialogs are passed to the dashboard as children, because they only ever open over it.

**Alternative.** Fold the twenty-two detail fields into one piece of state with a single update function, so a screen takes two props instead of fifteen. Or keep `CarerPage` in `App.tsx` wrapped around each screen's content, with the page titles held there.

**Why.** The long prop lists are temporary: moving state into hooks or a context is the next piece of work and removes them. Reshaping state here would have mixed a behaviour change into a move, and a move is only easy to check if it is nothing else. Every line of the old `App.tsx` other than imports and the wrapper calls is present unchanged in the new files.

The cost is real and is listed under Known issues. While everything was one component, React kept the navigation buttons in place between the dashboard and the six pages that share its layout, so keyboard focus stayed on the button that was pressed. Separate components are replaced whole, so focus is now dropped on every change of screen. Keeping `CarerPage` in `App.tsx` would have preserved it between the six carer pages but not to or from the dashboard, at the price of each screen's title living away from the screen. The old behaviour was not the right one either: the invariant is that focus moves to the new view's heading and the change is announced, which no screen does yet. That work fixes this properly, so the split was not bent around a behaviour that is about to be replaced.

---

## 2026-10-10: State lives in hooks that App.tsx composes, not in a context provider

**Decision.** `src/state/` holds eight hooks, one per kind of state: `useDetails` (patient, carer, consent and every setting), `useRoutine` (medications, schedules, dose events and everything derived from them), `useNavigation`, `useClock`, `useToast`, `usePrescriptionDraft`, `useNotGivenReason` and `useReadAloud`. `App.tsx` calls them, joins them up and passes the results to the screens as the same props as before. No screen file changed.

**Alternative.** A context provider that every screen reads from directly, which would remove the prop lists. Or one `useAppState` hook holding everything.

**Why.** Props only travel one level here, from `App` to a screen, so a context would not remove any drilling. It would remove typing at the cost of hiding what each screen depends on. With props, a screen's signature is the full list of what it reads and what it can change, which is what makes a screen checkable by reading it and is what tests will want. A single hook would have been the old `App.tsx` under a new name. Split by kind, the two hooks that write to the repository are easy to point at, and the dialog drafts that are deliberately not kept are visibly separate from the state that is.

The earlier entry on screen extraction said this work would remove the long prop lists. It does not, and that is a choice rather than an oversight. If they become a real cost, the hooks can sit behind a provider without changing them.

Three things moved rather than being copied. The save and toast calls that `App.tsx` made around each action now happen inside the hook that owns the action, so `useRoutine` takes `flashToast` and `onSaveFailed`. The table mapping navigation targets to screens was written out twice and is now one constant. `saveNotGiven` and `savePrescription` were each split in two: the dialog hook checks and clears the draft, and `useRoutine` builds and stores the record. The twenty-two detail fields are still twenty-two pieces of state, because the screens call their setters with updater functions and folding them into one record would have meant editing every screen.

---

## 2026-10-10: A change of view moves focus to the h1 and is announced from above the screens

**Decision.** Every view has one `<main id="main">` and one `<h1 id="view-heading" tabIndex={-1}>`. `useNavigation` watches the current screen, and when it changes it focuses the heading and passes the view's name up through an `onViewChange` prop. `Root` in `src/main.tsx` holds that name in a visually hidden `aria-live="polite"` region, and also renders the skip link as the first element in the document. Nothing happens on first load.

**Alternative.** Give each screen a ref to its heading and focus it from the screen. Or render the live region inside each screen. Or announce the heading text rather than a separate name.

**Why.** The live region has to sit outside the screens: they are replaced whole, and a region that arrives already holding its text is not reliably spoken. `Root` already holds the storage notice for the same reason, and `App.tsx` stays free of markup. Finding the heading by a shared id costs one line per screen, where refs would add a prop to every screen for a single call. The announced name is the navigation label ("Dashboard", "Patient view") because two headings are greetings ("Good morning, Meera") that do not say where the reader is. On the six pages whose heading is the label, a screen reader may say the name twice, once for focus and once for the region. AGENTS.md asks for both, so that is accepted until the manual screen reader pass shows whether it is a nuisance.

The headings and the main landmark show the focus ring only under `:focus-visible`, so a mouse user does not see a ring appear on a heading they did not tab to. The ring on `main` is inset, because an outset one would be clipped by the edge of the window.

**Landmarks.** The desktop sidebar was an `<aside>`, which made the primary navigation a complementary landmark with a nav inside it. It is now the `<nav>` itself, labelled "Main", and covers the help, settings and account buttons too, since every control in it changes the view. The mobile strip carries the same label; only one of the two is displayed at any width. `<main>` used to wrap the mobile header and navigation, so a skip link to it skipped nothing. It now wraps the content only, which also makes the header a banner landmark. Two `<aside>` elements inside `<main>` that held ordinary content, the reminder controls and the carer column on the profile, became a labelled section and a `div`.

**Headings.** Checked by reading every screen: one h1 each, h2 for sections, h3 only on the dashboard's medicine cards and under one h2 on the profile. No level was skipped, so no heading changed level.

**Not done here.** The page title does not change with the view, and the dashboard's mobile navigation still does not mark the current page. The skip link and the announcement sit outside the patient view root, like the storage notice, so the link does not follow Asha's theme or text size. None of this has been run through a screen reader or a browser yet.

---

## 2026-10-10: Forms check on submit, with no disabled save buttons

**Decision.** The four forms (add prescription, not-given reason, patient setup, carer details) keep their save button enabled and check the form when it is pressed. Each field at fault gets a message directly under it in a `role="alert"`, `aria-invalid`, and `aria-describedby` pointing at the message, and focus moves to the first of them. `useFormErrors` takes the errors the form has right now and shows them only after a failed attempt, so a message disappears as soon as its field is put right and nothing has to clear it by hand. The form component owns its field ids, its rules and its messages.

**Alternative.** Keep the disabled buttons and add a hint saying what is missing. Or one error summary at the top of the form, focused on submit, with links to the fields. Or hold the errors in the dialog hooks that `App.tsx` calls, alongside the drafts.

**Why.** A disabled button was the whole of the old error handling, and it says nothing: it is skipped by the Tab key, it cannot be focused to find out why, and the setup one changed its own label instead of saying which field was the problem. Pressing a button and being told what to fix is something Meera can act on when tired and Asha can act on with a screen reader. A summary was rejected because the longest form has five possible errors and the others one or two, so a second copy of the messages is more to read and more to listen to than it saves. Messages under the fields put the direction where the fix is made.

The hook is called from the form rather than from `App.tsx`, which is new: screens held no state before this. The dialogs unmount when they close, so state held in the form resets itself, where state held in `App.tsx` would need clearing on every way out of the dialog. It also keeps eight more props off the screens. The draft values stay where they were.

**Rules.** No rule was invented beyond what the forms already demanded, with one exception. Add prescription and the reason dialog require what their disabled buttons required, and setup requires the consent date and tick. The carer's name is newly required, because it is the `h1` of the profile page and an empty heading is what focus lands on at every visit. Phone, email and age formats are not checked: a wrong rule that refuses a real phone number is worse than none.

**Markup.** The reason options are a `fieldset` with `role="radiogroup"`, because `aria-invalid` and `aria-required` are not supported on a plain group. Messages sit outside each `<label>` so they are not read as part of the field's name. The invalid border uses `aria-[invalid=true]:` so the attribute is the single source of the styling.

**Not done here.** Setup and carer details are stored as typed, so the check stops the form closing rather than stopping the save. Every message is announced at once and the first is then read again on focus. Enter does not submit, because none of the forms is a `<form>` element. The photo field reports no failure. None of this has been run through a screen reader or a browser yet.

---

## 2026-10-10: The 44px floor is a base rule as well as a class on each control, and the mobile navigation wraps

**Decision.** Every control found under 44 by 44 was resized where it is written, and `src/index.css` also sets a 44px minimum width and height on every `button`, `select`, `textarea` and text-like `input`. The mobile navigation strip wraps onto further rows instead of scrolling sideways.

**Alternative.** Fix the offenders only and rely on reading the class strings from then on. Keep the strip on one row and accept the sideways scroll as ordinary browser scrolling.

**Why.** The audit found most controls already at 44 or more, and five that were not: the switch in `ToggleRow` at 32 high, the logo button in the mobile header at 40, "Edit" on the carer card at 40, and two buttons in the dashboard block that is never displayed. That is what sizing by convention produces, so the floor is also stated once where a new button gets it without anyone remembering. It is a net and not the mechanism: a `min-h` or `min-w` utility still overrides it. Tick boxes, radio buttons and the file picker are left out because each sits inside a label of 48px or more, and the label is the target.

The switch keeps its 32px track as a picture inside a 44px button, so the settings screens look the same. Making the whole row the target was the larger change and would have nested the description inside the button's name.

The sideways strip was the one interaction that needed a drag. Reaching the last items meant a swipe on a touch screen, and with a mouse it meant dragging a scrollbar or holding shift while turning the wheel, which is two hands. Wrapping costs two or three rows of height on a phone and puts every destination one tap away. It also ends the strip scrolling back to its start on each change of screen, since there is nothing left to scroll.

**Checked and left alone.** No component handles pointer, touch or drag events, and nothing uses a long press. The file, date and select fields open the platform's own pickers on a single tap. The resize handle on a text area is a drag, but it is optional and the field works at the size given. The number field's stepper arrows are small, and typing does the same job.

**Not done here.** The sizes were read from the class strings and not measured in a browser, so nothing here confirms the rendered boxes at 200% zoom or at the larger text sizes. The gap between adjacent targets was not audited.

---

## 2026-10-11: Read aloud is off unless turned on, speaks only when pressed, and is offered in place of a screen reader

**Decision.** `readAloud` defaults to false. In patient setup it is labelled "Read aloud button, in place of a screen reader" and its description says who it is for. When on, the patient view shows one button, "Read next medicine aloud", which becomes "Stop reading" while the voice is going. Nothing is ever spoken unasked, and speech is cancelled when the patient view is left. Where the browser has no speech synthesis the button is not shown and the setting says so.

**Alternative.** Keep it on by default with a stop button. Or remove synthesised speech entirely and rely on real assistive technology.

**Why.** A screen reader user already hears the page, and a second voice over the first is worse than silence. The app cannot detect a screen reader, so the only safe default is off, and the only honest framing is that this is for someone who does not use one: Asha with low vision and no screen reader set up is exactly that person, which is why it was not removed. The button changes its label rather than using `aria-pressed`, so there is one state to announce and not two. The old "not supported" toast was raised on a view that renders no toast, so it was never seen; not offering the button is the direction that message failed to give.

**Not done here.** A database created before this change was seeded with the setting on and keeps it. Nothing has been listened to in a browser yet.

---

## 2026-10-11: Reduced motion is decided in the stylesheet only

**Decision.** The glide to the top on a change of view is `scroll-behavior: smooth` on `html`, and `useNavigation` calls `scrollTo` without a behaviour. The `prefers-reduced-motion` media query and the `html[data-reduced-motion]` rule each turn off transitions, animations and that scroll, and each works without the other.

**Alternative.** Keep passing `behavior: "smooth"` from script, chosen by the in-app setting, and add a `matchMedia` check beside it.

**Why.** An explicit `behavior` passed to `scrollTo` overrides the stylesheet, so the scroll followed the in-app toggle and ignored the device's preference. A second check in script would have fixed that by keeping two sources in step by hand. With no behaviour passed, the stylesheet is the only place motion is decided and both sources are already there. The attribute rule also did not match `html` itself, only its descendants, and the root is where the window's scroll behaviour is read from. Every other moving thing in the app is a Tailwind `transition` utility, checked by searching for them: there are no keyframe animations and no other scroll calls.
