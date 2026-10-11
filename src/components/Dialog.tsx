import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

// Tailwind only generates classes it can see written out in full.
const panelClass = {
  narrow: "max-w-md",
  wide: "max-w-lg",
};

// A native modal dialog. Opening it with showModal is what moves focus inside,
// keeps Tab from leaving, makes the page behind inert, closes on Escape and
// puts focus back where it was. None of that is written by hand here.
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
  const dialog = useRef<HTMLDialogElement>(null);

  // A layout effect, so the dialog closes while it is still in the document
  // and the browser can return focus to whatever opened it.
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!element.open) element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      aria-labelledby={labelledBy}
      className={`m-auto max-h-[92vh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl bg-surface p-6 text-ink shadow-2xl backdrop:bg-overlay/55 md:p-7 ${panelClass[width]}`}
      // Escape asks to close. The state that renders the dialog decides.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialog}
    >
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
    </dialog>
  );
}
