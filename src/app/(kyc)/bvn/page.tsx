"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Fingerprint, ShieldCheck, Lock, Calendar, AlertCircle } from "lucide-react";
import { useKycStep1 } from "@/api/kyc/hooks";
import { useGetMe } from "@/api/auth/hooks";

export default function BvnPage() {
  const router = useRouter();
  const { data: meData } = useGetMe();
  const currentUser = meData?.data;

  // Regulatory consent modal state — opens first before anything else
  const [showConsentModal, setShowConsentModal] = useState(true);
  const [hasConsented, setHasConsented] = useState(false);

  const [bvn, setBvn] = useState("");
  const [dob, setDob] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBvnValid = /^\d{11}$/.test(bvn);
  const isDobValid = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(dob);
  const isValid = isBvnValid && isDobValid && hasConsented;

  const { mutate: submitStep1, isPending } = useKycStep1();

  function handleDobChange(rawVal: string) {
    const digits = rawVal.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) {
      setDob(digits);
    } else if (digits.length <= 4) {
      setDob(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setDob(`${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`);
    }
  }

  function handleAcceptConsent() {
    setHasConsented(true);
    setShowConsentModal(false);
  }

  function handleDeclineConsent() {
    setHasConsented(false);
    router.push("/intro");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setErrorMsg(null);

    const firstName = currentUser?.firstName || "";
    const lastName = currentUser?.lastName || "";

    // Convert DD/MM/YYYY to YYYY-MM-DD ISO string for backend
    const [day, month, year] = dob.split("/");
    const isoDob = `${year}-${month}-${day}`;

    const payload: {
      bvn: string;
      dob: string;
      firstName?: string;
      lastName?: string;
      consent: boolean;
      hasConsent: boolean;
      bvnConsent: boolean;
      consentToBvnLookup: boolean;
    } = {
      bvn,
      dob: isoDob,
      consent: true,
      hasConsent: true,
      bvnConsent: true,
      consentToBvnLookup: true,
    };
    if (firstName) payload.firstName = firstName;
    if (lastName) payload.lastName = lastName;

    submitStep1(
      payload,
      {
        onSuccess: () => {
          sessionStorage.setItem("kyc_bvn", bvn);
          router.push("/chn");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "";
          if (/already.*verif/i.test(msg)) {
            sessionStorage.setItem("kyc_bvn", bvn);
            router.push("/chn");
            return;
          }
          setErrorMsg(msg || "We couldn't verify your BVN. Please check your BVN and Date of Birth and try again.");
        },
      },
    );
  }

  return (
    <>
      {/* MANDATORY REGULATORY CONSENT MODAL */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-5 rounded-3xl border border-border bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  NDPA & CBN Regulatory Notice
                </span>
                <h2 className="text-lg font-bold text-foreground">Identity Verification Consent</h2>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">
                Pursuant to the Nigeria Data Protection Act (NDPA 2023) & CBN Regulations:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
                <li>
                  We require your explicit consent to retrieve and validate your BVN biodata (Full Name, DOB, and Photo) via our licensed verification partners (Dojah / NIBSS).
                </li>
                <li>
                  Your identity details are used <strong>solely</strong> to verify your eligibility for shareholder participation and voting.
                </li>
                <li>
                  Your BVN will <strong>never</strong> be shared with unauthorized third parties or used to access your bank accounts.
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900 border border-amber-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                By clicking <strong>"I Agree & Consent"</strong>, you authorize Attend and its licensed partners to verify your BVN details.
              </span>
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" fullWidth onClick={handleDeclineConsent}>
                Decline
              </Button>
              <Button type="button" fullWidth onClick={handleAcceptConsent}>
                I Agree & Consent
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* BVN & DOB INPUT FORM */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Fingerprint className="h-5 w-5 text-gray-700" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Bank Verification Number</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your 11-digit BVN and Date of Birth to verify your identity.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <Input
          name="bvn"
          label="BVN (11 Digits)"
          inputMode="numeric"
          placeholder="22XXXXXXXXX"
          value={bvn}
          onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
          hint={`${bvn.length}/11 digits — processed securely with Dojah.`}
        />

        <Input
          name="dob"
          label="Date of Birth (DD/MM/YYYY)"
          inputMode="numeric"
          placeholder="DD/MM/YYYY"
          leftIcon={<Calendar className="h-4 w-4" />}
          value={dob}
          onChange={(e) => handleDobChange(e.target.value)}
          hint="Format: Day/Month/Year (e.g. 15/08/1995) — must match your BVN record."
        />

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.push("/intro")}
            disabled={isPending}
          >
            Back
          </Button>
          <Button type="submit" fullWidth loading={isPending} disabled={!isValid}>
            {isPending ? "Verifying…" : "Continue"}
          </Button>
        </div>
      </form>
    </>
  );
}
