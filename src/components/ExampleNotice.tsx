// Says that what is on the page is the made-up example. It sits at the top of
// every carer page while the example is loaded, so made-up names and doses are
// never read as somebody's own.
export function ExampleNotice({ exampleData }: { exampleData: boolean }) {
  if (!exampleData) return null;
  return (
    <p className="mb-6 rounded-xl border-2 border-line-strong bg-surface px-4 py-3 text-base text-ink">
      <strong>Example data.</strong> The people, medicines and doses here are made up. Clear the
      example in Settings when you want to enter your own.
    </p>
  );
}
