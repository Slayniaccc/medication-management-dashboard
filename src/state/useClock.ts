import { useEffect, useState } from "react";

// Due soon and overdue are read off the clock, so the clock has to move.
export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}
