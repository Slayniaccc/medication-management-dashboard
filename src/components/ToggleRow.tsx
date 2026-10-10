export function ToggleRow({
  checked,
  description,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  label: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-line py-4 last:border-0">
      <div>
        <p className="font-bold text-ink">{label}</p>
        <p className="mt-1 text-sm leading-5 text-ink-muted">{description}</p>
      </div>
      {/* The button is the 44px target. The track inside it is only the picture. */}
      <button
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "on" : "off"}`}
        className="flex min-h-11 shrink-0 items-center rounded-full focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
        onClick={onChange}
        role="switch"
        type="button"
      >
        <span
          className={`relative block h-8 w-14 rounded-full border-2 transition ${
            checked
              ? "border-accent bg-accent"
              : "border-line-strong bg-surface-sunken"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow-sm transition ${
              checked ? "left-7" : "left-1"
            }`}
          />
        </span>
      </button>
    </div>
  );
}
