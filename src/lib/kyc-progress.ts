import { KycStatusData } from "@/types";

// The KYC step pages hand two values forward: the BVN entered at step 1 (needed for the
// optional selfie re-check at step 3) and a selfie already matched during step 1.
//
// These used to live in sessionStorage, which empties when the tab closes. A user who
// verified their BVN, closed the tab and came back was bounced to /bvn even though the
// backend had step 1 on file — the CHN page's guard read the missing key as "step 1 never
// ran". localStorage survives the tab, so resuming works the way the API always intended.
//
// Both values are cleared as soon as step 3 submits, and on an explicit skip.
const BVN_KEY = "kyc_bvn";
const SELFIE_KEY = "kyc_selfie";

const canUseStorage = () => typeof window !== "undefined";

// localStorage throws in private-mode Safari and when a quota is exhausted. KYC progress
// is a convenience, never the source of truth (the backend is), so a storage failure must
// not break the flow — it just means the fast path is unavailable.
function safeGet(key: string): string | null {
  if (!canUseStorage()) return null;
  try {
    return window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the flow still works, just without the fast path */
  }
}

function safeRemove(key: string) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
    // Clear the old sessionStorage location too, so a half-migrated tab doesn't keep
    // resurrecting a stale value after the localStorage copy is gone.
    window.sessionStorage.removeItem(key);
  } catch {
    /* nothing to clean up */
  }
}

export const getStoredBvn = () => safeGet(BVN_KEY);
export const setStoredBvn = (bvn: string) => safeSet(BVN_KEY, bvn);
export const getStoredSelfie = () => safeGet(SELFIE_KEY);
export const setStoredSelfie = (selfie: string) => safeSet(SELFIE_KEY, selfie);

export function clearKycProgress() {
  safeRemove(BVN_KEY);
  safeRemove(SELFIE_KEY);
}

export const KYC_STEP_PATHS = ["/bvn", "/chn", "/liveness"] as const;
export type KycStepPath = (typeof KYC_STEP_PATHS)[number];

/**
 * The path a user should land on when they resume verification.
 *
 * A step counts as done when the backend says it's completed, skipped, or awaiting
 * officer review — in all three cases there is nothing left for the user to do, so
 * sending them back to re-enter it would be wrong. The first step that is none of
 * those is where they left off. If every step is done, they belong on the summary.
 */
export function resumePath(kyc?: KycStatusData): string {
  if (!kyc) return "/bvn";
  if (kyc.kycComplete || kyc.pendingOfficerReview) return "/success";

  const steps = [kyc.steps?.step1, kyc.steps?.step2, kyc.steps?.step3];
  const firstOutstanding = steps.findIndex(
    (s) => !s?.completed && !s?.skipped && !s?.pendingReview,
  );

  return firstOutstanding === -1 ? "/success" : KYC_STEP_PATHS[firstOutstanding];
}

/**
 * How far along the step indicator should sit — the count of steps the backend
 * considers settled, which is also the index of the step currently in progress.
 */
export function completedStepCount(kyc?: KycStatusData): number {
  if (!kyc) return 0;
  return [kyc.steps?.step1, kyc.steps?.step2, kyc.steps?.step3].filter(
    (s) => s?.completed || s?.skipped || s?.pendingReview,
  ).length;
}
