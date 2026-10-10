import { useState } from "react";

// What is wrong with a form as it stands: field id to message, in the order
// the fields appear on the screen.
export type FormErrors = Record<string, string>;

// Errors stay hidden until the first attempt to submit. From then on they
// follow the fields, so a message goes as soon as its field is put right.
export function useFormErrors(found: FormErrors) {
  const [attempted, setAttempted] = useState(false);

  // Call on submit. Returns whether the form can go ahead, and if it cannot,
  // moves focus to the first field with an error.
  const checkOnSubmit = () => {
    const first = Object.keys(found)[0];
    if (first === undefined) {
      setAttempted(false);
      return true;
    }
    setAttempted(true);
    document.getElementById(first)?.focus();
    return false;
  };

  return { checkOnSubmit, errors: attempted ? found : {} };
}
