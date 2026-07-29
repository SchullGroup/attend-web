import { useState, useEffect } from "react";
import { formatRelativeTime } from "@/lib/utils";

/**
 * Returns a live-updating relative time string (e.g. "2 mins ago") for a given
 * API timestamp. Re-evaluates on a smart interval:
 *   - Every 10 seconds when the timestamp is < 2 minutes old (fast ticking)
 *   - Every 30 seconds when between 2–60 minutes old
 *   - Every 60 seconds when older than 60 minutes
 *
 * Pass `null` or `undefined` to get an empty string.
 */
export function useRelativeTime(timestamp: string | null | undefined): string {
  const [label, setLabel] = useState(() =>
    timestamp ? formatRelativeTime(timestamp) : "",
  );

  useEffect(() => {
    if (!timestamp) {
      setLabel("");
      return;
    }

    // Narrow to a plain string so closures below don't see null/undefined.
    const ts = timestamp;

    // Recompute immediately whenever the timestamp changes.
    setLabel(formatRelativeTime(ts));

    function getInterval(): number {
      const diffSec = Math.floor(
        (Date.now() - new Date(ts.endsWith("Z") ? ts : ts + "Z").getTime()) / 1000,
      );
      if (diffSec < 120) return 10_000;   // < 2 mins  → tick every 10s
      if (diffSec < 3600) return 30_000;  // < 1 hr    → tick every 30s
      return 60_000;                       // older     → tick every 60s
    }

    let id: ReturnType<typeof setInterval>;

    function schedule() {
      id = setInterval(() => {
        setLabel(formatRelativeTime(ts));
        // Clear and re-schedule with the updated optimal interval.
        clearInterval(id);
        schedule();
      }, getInterval());
    }

    schedule();
    return () => clearInterval(id);
  }, [timestamp]);

  return label;
}
