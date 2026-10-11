import { useState } from "react";
import type { NotGivenReason, OccurrenceKey, RecordedBy } from "../model/types";

type ReasonFor = { dose: OccurrenceKey; recordedBy: RecordedBy };

// The reason dialog: which dose it is open for, and the reason chosen so far.
// Nothing is logged until a reason has been picked and saved.
export function useNotGivenReason({
  markNotGiven,
}: {
  markNotGiven: (dose: OccurrenceKey, reason: NotGivenReason, recordedBy: RecordedBy) => void;
}) {
  const [reasonFor, setReasonForState] = useState<ReasonFor | null>(null);
  const [reason, setReason] = useState<NotGivenReason | "">("");

  // Opening or closing starts from no choice, so a reason picked for one dose
  // and then cancelled is not waiting, already selected, on the next.
  const setReasonFor = (value: ReasonFor | null) => {
    setReasonForState(value);
    setReason("");
  };

  const saveNotGiven = () => {
    if (!reasonFor || !reason) return;
    markNotGiven(reasonFor.dose, reason, reasonFor.recordedBy);
    setReasonFor(null);
  };

  return { reason, reasonFor, saveNotGiven, setReason, setReasonFor };
}
