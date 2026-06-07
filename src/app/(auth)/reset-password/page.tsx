"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useResetPassword } from "@/api/auth/hooks";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { mutate: resetMutation, isPending } = useResetPassword();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingResetEmail");
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
      setErrorMsg("No email found. Please start the reset process again.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const otp = code.join("");

    resetMutation(
      { email, otp, newPassword },
      {
        onSuccess: () => {
          setSuccessMsg("Password reset successfully! Redirecting to login...");
          sessionStorage.removeItem("pendingResetEmail");
          setTimeout(() => router.push("/login"), 1500);
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Password reset failed. Please check your code and try again."
          );
        },
      }
    );
  }

  const otpFilled = code.every((c) => c !== "");
  const canSubmit = otpFilled && newPassword.length >= 8 && confirmPassword.length > 0;

  // Mask the email for display
  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + b.replace(/./g, "•") + c)
    : "your email";

  return (
    <div className="space-y-6">
      <div className="md:hidden">
        <div className="text-2xl font-extrabold tracking-tight text-primary">
          attend
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Enterprise Events Platform
        </p>
      </div>

      <div>
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 md:mx-0">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{maskedEmail}</span> and
          choose a new password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Verification code
          </label>
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
        </div>

        <Input
          name="newPassword"
          label="New password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Min 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Input
          name="confirmPassword"
          label="Confirm password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isPending}
          disabled={!canSubmit}
        >
          {isPending ? "Resetting password" : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
