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
