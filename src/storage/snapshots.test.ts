import { describe, expect, it } from "vitest";
import { minutesAfterScheduled, occurrencesOn } from "../model/doses";
import { localDateOf, type LocalDate } from "../model/time";
import { emptySnapshot, exampleSnapshot, isFirstRun } from "./snapshots";

const now = new Date(2026, 5, 18, 8, 15);
const daysAgo = (days: number): LocalDate => localDateOf(new Date(2026, 5, 18 - days));

describe("a device that has never been used", () => {
  it("starts with nothing, and that is what first run means", () => {
    const empty = emptySnapshot();
    expect(empty.medications).toEqual([]);
    expect(empty.schedules).toEqual([]);
    expect(empty.events).toEqual([]);
    expect(isFirstRun(empty)).toBe(true);
  });

  it("is no longer first run once a name is entered or the example is loaded", () => {
    const empty = emptySnapshot();
    expect(isFirstRun({ ...empty, details: { ...empty.details, carerName: "Sam" } })).toBe(false);
    expect(isFirstRun(exampleSnapshot(now))).toBe(false);
  });
});

describe("the example week", () => {
  const { details, events, medications, schedules } = exampleSnapshot(now);

  it("says that it is an example, and keeps medicine names generic", () => {
    expect(details.exampleData).toBe(true);
    expect(medications.map((medication) => medication.name)).toEqual([
      "Medicine 1",
      "Medicine 2",
      "Medicine 3",
    ]);
  });

  it("covers the six days before today and leaves today to log", () => {
    expect([...new Set(events.map((event) => event.date))].sort()).toEqual(
      [6, 5, 4, 3, 2, 1].map(daysAgo),
    );
    expect(occurrencesOn(daysAgo(0), schedules, events).every((dose) => dose.event === null)).toBe(
      true,
    );
    expect(occurrencesOn(daysAgo(0), schedules, events)).toHaveLength(4);
  });

  it("has a dose given on time", () => {
    const onTime = events.filter(
      (event) => event.outcome === "given" && Math.abs(minutesAfterScheduled(event)) <= 10,
    );
    expect(onTime.length).toBeGreaterThan(0);
  });

  it("has one dose logged four hours late", () => {
    const late = events.filter((event) => minutesAfterScheduled(event) === 240);
    expect(late).toHaveLength(1);
    expect(late[0]).toMatchObject({ outcome: "given", timeOfDay: "13:00", date: daysAgo(4) });
  });

  it("has doses not given, each with its reason stored", () => {
    const notGiven = events.filter((event) => event.outcome === "not-given");
    expect(notGiven.map((event) => event.outcome === "not-given" && event.reason).sort()).toEqual([
      "asleep",
      "refused",
    ]);
  });

  it("has a schedule that changed mid-week by being superseded, not edited", () => {
    const medicineTwo = schedules.filter(
      (schedule) => schedule.medicationId === "example-medicine-2",
    );
    expect(medicineTwo).toEqual([
      expect.objectContaining({ timeOfDay: "08:30", startDate: daysAgo(6), endDate: daysAgo(3) }),
      expect.objectContaining({ timeOfDay: "09:00", startDate: daysAgo(3), endDate: null }),
    ]);
  });

  it("resolves every day through the schedule in force then, so no logged dose is orphaned", () => {
    for (const days of [6, 5, 4, 3, 2, 1]) {
      const doses = occurrencesOn(daysAgo(days), schedules, events);
      expect(doses).toHaveLength(4);
      for (const dose of doses) {
        expect(dose.scheduleId).not.toBeNull();
        expect(dose.event).not.toBeNull();
      }
      const medicineTwo = doses.find((dose) => dose.medicationId === "example-medicine-2")!;
      expect(medicineTwo.timeOfDay).toBe(days > 3 ? "08:30" : "09:00");
    }
  });
});
