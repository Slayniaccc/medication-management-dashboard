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
