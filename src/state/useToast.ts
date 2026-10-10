import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState("");

  // Shows a message and takes it away again after a moment.
  const flashToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  return { flashToast, setToast, toast };
}
