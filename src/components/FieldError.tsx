// The message for a field that failed its check. It is an alert so that it is
// announced when it appears, and the field points at its id with
// aria-describedby so it is read again when focus lands there. Keep it outside
// the field's <label>, or it becomes part of the field's name.
export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p className="mt-2 text-sm font-bold text-danger" id={id} role="alert">
      {message}
    </p>
  );
}
