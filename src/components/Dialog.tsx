import type { ReactNode } from "react";
import { Icon } from "./Icon";

// Tailwind only generates classes it can see written out in full.
const panelClass = {
  narrow: "max-w-md",
  // The wide dialog holds a form, which can be taller than a small screen.
  wide: "max-h-[92vh] max-w-lg overflow-y-auto",
};

export function Dialog({
  children,
  closeLabel,
  header,
  labelledBy,
  onClose,
  width,
}: {
  children: ReactNode;
  closeLabel: string;
  // Must contain the heading whose id is labelledBy.
  header: ReactNode;
  labelledBy: string;
  onClose: () => void;
  width: keyof typeof panelClass;
}) {
  return (
    <div
      aria-labelledby={labelledBy}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/55 p-4"
      role="dialog"
    >
      <div className={`w-full rounded-2xl bg-surface p-6 shadow-2xl md:p-7 ${panelClass[width]}`}>
        <div className="flex items-start justify-between gap-4">
          <div>{header}</div>
          <button
            aria-label={closeLabel}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-surface-sunken focus-visible:outline-3 focus-visible:outline-focus"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
