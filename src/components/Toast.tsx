import { Icon } from "./Icon";

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-50 flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-xl bg-inverse px-5 text-sm font-bold text-on-inverse shadow-xl"
      role="status"
    >
      <Icon name="check" className="h-4 w-4" />
      {message}
    </div>
  );
}
