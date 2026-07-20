import { parseApiDate } from "./utils";

export interface RsvpWindowState {
  isOpen: boolean;
  isClosed: boolean;
  cutoffTime: Date | null;
}

/**
 * Calculates whether the RSVP window is still open for a given event.
 * The window remains open until (event.startTime + lateRsvpMinutes).
 */
export function getRsvpWindow(startTimeStr: string, lateRsvpMinutes = 30): RsvpWindowState {
  if (!startTimeStr) {
    return { isOpen: false, isClosed: true, cutoffTime: null };
  }

  const startTime = parseApiDate(startTimeStr);
  if (isNaN(startTime.getTime())) {
    return { isOpen: false, isClosed: true, cutoffTime: null };
  }

  const cutoffTime = new Date(startTime.getTime() + lateRsvpMinutes * 60 * 1000);
  const now = new Date();

  return {
    isOpen: now <= cutoffTime,
    isClosed: now > cutoffTime,
    cutoffTime,
  };
}
