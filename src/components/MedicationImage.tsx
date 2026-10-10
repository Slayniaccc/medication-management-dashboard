import type { Medication, MedicationColour } from "../model/types";
import { Icon } from "./Icon";

// Tailwind only generates classes it can see written out in full.
const medicationColourClass: Record<MedicationColour, string> = {
  coral: "bg-med-coral",
  teal: "bg-med-teal",
  ochre: "bg-med-ochre",
  indigo: "bg-med-indigo",
};

const sizeClass = {
  small: { box: "h-12 w-12", icon: "h-6 w-6" },
  large: { box: "h-16 w-16", icon: "h-7 w-7" },
};

// The photo the carer chose, or the medicine's colour when there is none.
export function MedicationImage({
  className = "",
  medication,
  size,
}: {
  className?: string;
  medication: Medication;
  size: keyof typeof sizeClass;
}) {
  const { box, icon } = sizeClass[size];
  return medication.imageUrl ? (
    <img
      alt={`${medication.name} packaging`}
      className={`${box} shrink-0 rounded-xl border border-line-strong object-cover ${className}`}
      src={medication.imageUrl}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`flex ${box} shrink-0 items-center justify-center rounded-xl ${medicationColourClass[medication.colour]} text-on-med ${className}`}
    >
      <Icon name="medication" className={icon} />
    </span>
  );
}
