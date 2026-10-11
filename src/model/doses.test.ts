import { describe, expect, it } from "vitest";
import { createMemoryRepository } from "../storage/memoryRepository";
import { doseStatus, minutesAfterScheduled, occurrenceKey, occurrencesOn, recordDose } from "./doses";
import { closeSchedule, isInForce, supersedeSchedule } from "./schedules";
import { localDateOf, toInstant, wallClockDate } from "./time";
import type { LocalDate } from "./time";
import type { DoseEvent, Schedule } from "./types";

const morning: Schedule = {
  id: "schedule-a",
  medicationId: "medicine-a",
  timeOfDay: "08:00",
  startDate: "2026-06-01",
  endDate: null,
};

const given = (date: LocalDate, loggedAt: string): DoseEvent => ({
  medicationId: "medicine-a",
  date,
  timeOfDay: "08:00",
  outcome: "given",
  recordedAt: toInstant(new Date(loggedAt)),
  recordedBy: "carer",
});

describe("occurrence key", () => {
  it("is the same for the same medicine, date and slot", () => {
    const first = given("2026-06-02", "2026-06-02T08:02:00");
    const second = given("2026-06-02", "2026-06-02T08:03:00");
    expect(occurrenceKey(first)).toBe(occurrenceKey(second));
  });

  it("differs when the medicine, the date or the slot differs", () => {
    const base = { medicationId: "medicine-a", date: "2026-06-02", timeOfDay: "08:00" } as const;
    const keys = new Set([
      occurrenceKey(base),
      occurrenceKey({ ...base, medicationId: "medicine-b" }),
      occurrenceKey({ ...base, date: "2026-06-03" }),
      occurrenceKey({ ...base, timeOfDay: "20:00" }),
    ]);
    expect(keys.size).toBe(4);
  });

  it("makes logging idempotent: a second tap does not add a second event", () => {
    const tap = given("2026-06-02", "2026-06-02T08:02:00");
    const once = recordDose([], tap);
    const twice = recordDose(once, tap);
    expect(twice).toEqual(once);
    expect(twice).toHaveLength(1);
  });

  it("lands a second write for the same dose on the same record, and the later one stands", () => {
    const first = given("2026-06-02", "2026-06-02T08:02:00");
    const second: DoseEvent = {
      ...first,
      outcome: "not-given",
      reason: "refused",
      recordedAt: toInstant(new Date("2026-06-02T08:10:00")),
    };
    const events = recordDose(recordDose([], first), second);
    expect(events).toEqual([second]);

    const [dose] = occurrencesOn("2026-06-02", [morning], events);
    expect(dose.event).toEqual(second);
  });

  it("keeps doses of other medicines, dates and slots apart", () => {
    const events = [
      given("2026-06-02", "2026-06-02T08:02:00"),
      given("2026-06-03", "2026-06-03T08:02:00"),
      { ...given("2026-06-02", "2026-06-02T20:02:00"), timeOfDay: "20:00" as const },
      { ...given("2026-06-02", "2026-06-02T08:02:00"), medicationId: "medicine-b" },
    ].reduce(recordDose, [] as DoseEvent[]);
    expect(events).toHaveLength(4);
  });

  it("does not change the list it was given", () => {
    const before: DoseEvent[] = [given("2026-06-02", "2026-06-02T08:02:00")];
    const copy = [...before];
    recordDose(before, given("2026-06-02", "2026-06-02T09:00:00"));
    expect(before).toEqual(copy);
  });

  it("is idempotent in storage as well as in the model", async () => {
    const repository = createMemoryRepository({
      medications: [],
      schedules: [morning],
      events: [],
      details: {} as never,
    });
    const tap = given("2026-06-02", "2026-06-02T08:02:00");
    await repository.recordDose(tap);
    await repository.recordDose(tap);
    expect((await repository.load()).events).toEqual([tap]);
  });
});

describe("a dose is pending by absence", () => {
  it("derives a day's doses from the schedules in force, with no event stored", () => {
    const evening: Schedule = { ...morning, id: "schedule-b", timeOfDay: "20:00" };
    const doses = occurrencesOn("2026-06-02", [evening, morning], []);
    expect(doses.map((dose) => [dose.timeOfDay, dose.event])).toEqual([
      ["08:00", null],
      ["20:00", null],
    ]);
  });

  it("has nothing to show before a schedule starts", () => {
    expect(occurrencesOn("2026-05-31", [morning], [])).toEqual([]);
  });

  it("places an unlogged dose by the clock alone", () => {
    const [dose] = occurrencesOn("2026-06-02", [morning], []);
    expect(doseStatus(dose, new Date("2026-06-02T07:00:00"))).toBe("pending");
    expect(doseStatus(dose, new Date("2026-06-02T07:30:00"))).toBe("due-soon");
    expect(doseStatus(dose, new Date("2026-06-02T08:59:00"))).toBe("due-soon");
    expect(doseStatus(dose, new Date("2026-06-02T09:00:00"))).toBe("overdue");
  });

  it("keeps the gap between the scheduled time and when it was logged", () => {
    expect(minutesAfterScheduled(given("2026-06-02", "2026-06-02T08:05:00"))).toBe(5);
    expect(minutesAfterScheduled(given("2026-06-02", "2026-06-02T12:00:00"))).toBe(240);
  });
});

describe("superseding a schedule", () => {
  // 08:00 for three days, then moved to 09:00 from the fourth.
  const events = [
    given("2026-06-01", "2026-06-01T08:01:00"),
    given("2026-06-02", "2026-06-02T08:04:00"),
    given("2026-06-03", "2026-06-03T08:02:00"),
  ];
  const changed = supersedeSchedule(
    [morning],
    morning.id,
    { id: "schedule-a2", timeOfDay: "09:00" },
    "2026-06-04",
  );

  it("closes the old schedule and opens a new one on the same date", () => {
    expect(changed).toEqual([
      { ...morning, endDate: "2026-06-04" },
      {
        id: "schedule-a2",
        medicationId: "medicine-a",
        timeOfDay: "09:00",
        startDate: "2026-06-04",
        endDate: null,
      },
    ]);
  });

  it("leaves the schedule it was given untouched", () => {
    expect(morning.endDate).toBeNull();
    expect(morning.timeOfDay).toBe("08:00");
  });

  it("resolves past dates through the schedule that was in force, so their events still match", () => {
    for (const event of events) {
      const doses = occurrencesOn(event.date, changed, events);
      expect(doses).toEqual([
        {
          medicationId: "medicine-a",
          date: event.date,
          timeOfDay: "08:00",
          scheduleId: "schedule-a",
          event,
        },
      ]);
    }
  });

  it("resolves the change date and later through the new schedule", () => {
    for (const date of ["2026-06-04", "2026-06-05"] as const) {
      const doses = occurrencesOn(date, changed, events);
      expect(doses).toHaveLength(1);
      expect(doses[0]).toMatchObject({ timeOfDay: "09:00", scheduleId: "schedule-a2", event: null });
    }
  });

  it("has exactly one schedule in force on every date, with no gap and no overlap", () => {
    for (const date of ["2026-06-03", "2026-06-04", "2026-06-05"] as const) {
      expect(changed.filter((schedule) => isInForce(schedule, date))).toHaveLength(1);
    }
  });

  it("would lose the past if the schedule were edited in place instead", () => {
    // The mistake this rule exists to prevent, kept as a test so the reason
    // stays visible: the old slot is gone, so the events no longer belong to
    // any schedule.
    const edited: Schedule[] = [{ ...morning, timeOfDay: "09:00" }];
    const [dose] = occurrencesOn("2026-06-02", edited, []);
    expect(dose.timeOfDay).toBe("09:00");
    expect(occurrenceKey(dose)).not.toBe(occurrenceKey(events[1]));
  });

  it("still shows an event logged on the change date before the change was made", () => {
    const early = given("2026-06-04", "2026-06-04T08:03:00");
    const doses = occurrencesOn("2026-06-04", changed, [...events, early]);
    expect(doses.map((dose) => [dose.timeOfDay, dose.scheduleId, dose.event])).toEqual([
      ["08:00", null, early],
      ["09:00", "schedule-a2", null],
    ]);
  });

  it("keeps resolving logged doses after a medicine is stopped", () => {
    const stopped = closeSchedule([morning], morning.id, "2026-06-04");
    expect(occurrencesOn("2026-06-03", stopped, events)[0].event).toEqual(events[2]);
    expect(occurrencesOn("2026-06-04", stopped, events)).toEqual([]);
  });

  it("refuses to close a schedule twice or before it starts", () => {
    expect(() => closeSchedule(changed, morning.id, "2026-06-05")).toThrow(RangeError);
    expect(() => closeSchedule([morning], morning.id, "2026-05-01")).toThrow(RangeError);
  });
});

// The suite runs in Europe/London (see vite.config.ts). In 2026 the clocks go
// forward on 29 March and back on 25 October.
describe("across a daylight saving boundary", () => {
  const allYear: Schedule = { ...morning, startDate: "2026-01-01" };
  const hoursBetween = (a: LocalDate, b: LocalDate) =>
    (wallClockDate(b, "08:00").getTime() - wallClockDate(a, "08:00").getTime()) / 3_600_000;

  it("is running in a zone where the clocks change", () => {
    expect(new Date(2026, 0, 15).getTimezoneOffset()).toBe(0);
    expect(new Date(2026, 6, 15).getTimezoneOffset()).toBe(-60);
  });

  it.each([
    ["spring forward", "2026-03-28", "2026-03-29", "2026-03-30", 23],
    ["autumn back", "2026-10-24", "2026-10-25", "2026-10-26", 25],
  ] as const)("keeps an 08:00 dose at 08:00 through %s", (_name, before, on, after, hours) => {
    for (const date of [before, on, after]) {
      const [dose] = occurrencesOn(date, [allYear], []);
      expect(dose.timeOfDay).toBe("08:00");
      const moment = wallClockDate(dose.date, dose.timeOfDay);
      expect(moment.getHours()).toBe(8);
      expect(moment.getMinutes()).toBe(0);
      expect(localDateOf(moment)).toBe(date);
    }
    // The instants are not 24 hours apart, which is the point: a schedule
    // stored as an instant and stepped by a day would have drifted by an hour.
    expect(hoursBetween(before, on)).toBe(hours);
    expect(hoursBetween(on, after)).toBe(24);
  });

  it("matches an event to its dose on the day the clocks change", () => {
    const event = given("2026-03-29", "2026-03-29T08:05:00");
    const [dose] = occurrencesOn("2026-03-29", [allYear], [event]);
    expect(dose.event).toEqual(event);
    expect(minutesAfterScheduled(event)).toBe(5);
    // Logged at 08:05 on the wall clock, which is 07:05 UTC once summer time starts.
    expect(event.recordedAt).toBe("2026-03-29T07:05:00.000Z");
  });

  it("measures due soon and overdue on the wall clock on the day the clocks change", () => {
    for (const date of ["2026-03-29", "2026-10-25"] as const) {
      const [dose] = occurrencesOn(date, [allYear], []);
      expect(doseStatus(dose, new Date(`${date}T07:29:00`))).toBe("pending");
      expect(doseStatus(dose, new Date(`${date}T07:30:00`))).toBe("due-soon");
      expect(doseStatus(dose, new Date(`${date}T09:00:00`))).toBe("overdue");
    }
  });

  it("takes the local date from the wall clock, not from UTC", () => {
    // Half past midnight in summer is still the previous day in UTC.
    expect(localDateOf(new Date("2026-07-01T00:30:00"))).toBe("2026-07-01");
    expect(new Date("2026-07-01T00:30:00").toISOString().slice(0, 10)).toBe("2026-06-30");
  });
});
