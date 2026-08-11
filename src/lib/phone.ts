/**
 * Nigerian dial code, pinned into the phone fields rather than typed.
 *
 * Every participant onboarded so far is on a +234 number, and the design shows the code as a
 * static prefix so the user only enters the local part. The day a non-Nigerian audience is
 * onboarded this becomes a picker; until then one constant is the honest representation.
 */
export const DIAL_CODE = "+234";

/**
 * Remove whatever the user typed that the pinned "+234" already covers, so the field never
 * reads "+234 0801…" or "+234 2348…".
 *
 * A lone "0" survives: stripping it on the first keystroke would swallow the digit for the
 * many people who type "0801…" out of habit, and there is nothing after it yet to keep.
 */
export function stripDialCode(v: string): string {
  const withoutCode = v.replace(/^\s*\+?234/, "");
  return withoutCode.length > 1 ? withoutCode.replace(/^0+/, "") : withoutCode;
}

/**
 * E.164 for the API — dial code plus local digits, no spaces. "0801 234 5678",
 * "801 234 5678" and "+234 801 234 5678" all normalise to "+2348012345678".
 *
 * Returns "" for input with no digits, so an empty field submits empty rather than a bare
 * "+234" that the backend would have to reject.
 */
export function toE164(local: string, dialCode = DIAL_CODE): string {
  const digits = stripDialCode(local).replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `${dialCode}${digits}` : "";
}
