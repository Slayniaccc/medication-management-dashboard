import { Icon } from "./Icon";

// The status region is always in the document and only its content comes and
// goes. A live region that arrives already holding its message is not reliably
// spoken.
export function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-5 z-50 flex justify-center" role="status">
      {message && (
        <p className="flex min-h-12 items-center gap-2 rounded-xl bg-inverse px-5 py-2 text-sm font-bold text-on-inverse shadow-xl">
          <Icon name="check" className="h-4 w-4 shrink-0" />
          {message}
        </p>
      )}
    </div>
  );
}
