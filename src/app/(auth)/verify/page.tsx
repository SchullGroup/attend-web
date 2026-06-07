"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";
import { useVerifyEmail } from "@/api/auth/hooks";

export default function VerifyPage() {
  const router = useRouter();
  const { mutate: verifyMutation, isPending } = useVerifyEmail();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Read the email stored during registration
    const pendingEmail = sessionStorage.getItem("pendingVerifyEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, []);

  function onChangeDigit(i: number, v: string) {
    if (!/^\d?$/.test(v)) return;
    const next = [...code];
    next[i] = v;
    setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  function onKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 0) {
      const next = [...code];
      for (let i = 0; i < pasted.length && i < 6; i++) {
        next[i] = pasted[i];
      }
      setCode(next);
      const focusIndex = Math.min(pasted.length, 5);
      refs.current[focusIndex]?.focus();
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg("No email found. Please go back and register again.");
      return;
    }

    const otp = code.join("");

    verifyMutation(
      { email, otp },
      {
        onSuccess: () => {
          setSuccessMsg("Email verified successfully! Redirecting to login...");
          sessionStorage.removeItem("pendingVerifyEmail");
          setTimeout(() => router.push("/login"), 1500);
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Verification failed. Please check your code and try again."
          );
        },
      }
    );
  }

  const filled = code.every((c) => c !== "");

  // Mask the email for display
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + b.replace(/./g, "•") + c)
    : "your email";

  return (
    <div className="space-y-6">
      <div className="flex justify-center md:hidden">
        <div className="text-2xl font-extrabold tracking-tight text-primary">
          attend
        </div>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Verify your email
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-200">
            {successMsg}
          </div>
        )}
        <div className="flex justify-between gap-2" onPaste={onPaste}>
          {code.map((c, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={c}
              onChange={(e) => onChangeDigit(i, e.target.value)}
              onKeyDown={(e) => onKey(i, e)}
              className={cn(
                "h-12 w-12 rounded-xl border border-input bg-white text-center text-lg font-semibold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary",
              )}
            />
          ))}
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isPending}
          disabled={!filled}
        >
          {isPending ? "Verifying" : "Verify email"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline"
          >
            Resend
          </button>
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
