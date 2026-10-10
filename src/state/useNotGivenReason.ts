import { useState } from "react";
import type { NotGivenReason, OccurrenceKey, RecordedBy } from "../model/types";

// The reason dialog: which dose it is open for, and the reason chosen so far.
// Nothing is logged until a reason has been picked and saved.
export function useNotGivenReason({
  markNotGiven,
}: {
  markNotGiven: (dose: OccurrenceKey, reason: NotGivenReason, recordedBy: RecordedBy) => void;
}) {
  const [reasonFor, setReasonFor] = useState<{
    dose: OccurrenceKey;
    recordedBy: RecordedBy;
  } | null>(null);
  const [reason, setReason] = useState<NotGivenReason | "">("");

  const saveNotGiven = () => {
    if (!reasonFor || !reason) return;
    markNotGiven(reasonFor.dose, reason, reasonFor.recordedBy);
    setReasonFor(null);
    setReason("");
  };

  return { reason, reasonFor, saveNotGiven, setReason, setReasonFor };
}
