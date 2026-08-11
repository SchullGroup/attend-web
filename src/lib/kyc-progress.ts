import { KycStatusData } from "@/types";

// The KYC step pages hand one value forward: a selfie already matched during step 1, so
// step 3 doesn't ask the user to pose for the camera a second time.
//
// The BVN used to be kept here too. It isn't any more, and must not come back — a BVN in
// localStorage stays readable on a shared machine long after the session ends. The BVN
// needed for the step-3 selfie re-check is read from `GET /participant/kyc`, which returns
// it once step 1 is on file.
//
// The selfie is cleared as soon as step 3 submits, and on an explicit skip.
const SELFIE_KEY = "kyc_selfie";

// A BVN written by an earlier build of the app is still sitting in storage on devices that
// have used the KYC flow before. Clear it on first load so the removal reaches users who
// already have one, not just new sessions.
const LEGACY_BVN_KEY = "kyc_bvn";

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

export const getStoredSelfie = () => safeGet(SELFIE_KEY);
export const setStoredSelfie = (selfie: string) => safeSet(SELFIE_KEY, selfie);

/**
 * Delete any BVN left behind by an earlier build. Safe to call repeatedly and on every
 * load — it only removes a key nothing writes any more.
 */
export function purgeLegacyStoredBvn() {
  safeRemove(LEGACY_BVN_KEY);
}

export function clearKycProgress() {
  safeRemove(SELFIE_KEY);
  purgeLegacyStoredBvn();
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
