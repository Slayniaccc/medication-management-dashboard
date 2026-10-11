import { useRef, useState } from "react";

export function useToast() {
  const [toast, setToast] = useState("");
  const timer = useRef(0);

  // Shows a message and takes it away again after a moment. A second message
  // restarts the wait, so it is not cut short by the first one's timer.
  const flashToast = (message: string) => {
    window.clearTimeout(timer.current);
    setToast(message);
    timer.current = window.setTimeout(() => setToast(""), 6000);
  };

  return { flashToast, toast };
}
