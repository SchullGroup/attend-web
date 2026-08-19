"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/api/auth/hooks";
import { getDeviceId } from "@/lib/device-id";
import { apiErrorMessage } from "@/lib/api-error";
import { DIAL_CODE, stripDialCode, toE164 } from "@/lib/phone";
import { cn } from "@/lib/utils";

type LoginMode = "email" | "phone";

/**
 * proxy.ts attaches `?callbackUrl=<original path>` when it bounces an unauthenticated
 * visit to a protected page (e.g. an event link from an email reminder) here. Only ever
 * follow it if it's a same-origin relative path — a raw redirect to whatever's in the
 * query string would be an open-redirect vector (`?callbackUrl=https://evil.example`).
 */
function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function LoginPage() {
  const router = useRouter();
  const { mutate: loginMutation, isPending } = useLogin();
  const [mode, setMode] = useState<LoginMode>("email");
  const [email, setEmail] = useState("");
  // Local part only — the "+234" is pinned in the field, not typed.
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [justVerifiedEmail, setJustVerifiedEmail] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState<string | null>(null);

  // A freshly verified account lands here straight from /verify. Read the marker on mount
  // rather than during render — sessionStorage doesn't exist during SSR — and clear it
  // immediately so the banner shows once and doesn't reappear on a later visit.
  useEffect(() => {
    const verified = sessionStorage.getItem("justVerifiedEmail");
    if (verified) {
      setJustVerifiedEmail(verified);
      setEmail(verified);
      setMode("email");
    }
    sessionStorage.removeItem("justVerifiedEmail");

    // api-client appends ?reason= when it forces a logout, so the user is told why they
    // ended up back here. Read via window rather than useSearchParams: this page has no
    // Suspense boundary and that hook would opt the whole route out of static rendering.
    const reason = new URLSearchParams(window.location.search).get("reason");
    if (reason === "other-device") {
      setSessionEnded(
        "You were signed out because your account was used to sign in on another device.",
      );
    } else if (reason === "idle") {
      setSessionEnded("Your session expired after 2 hours of inactivity. Please sign in again.");
    }
  }, []);

  // Whichever tab is showing supplies the credential. Phones go up as E.164
  // ("+2348012345678"); emails are sent exactly as typed.
  const cleanId = mode === "phone" ? toE164(phone) : email.trim();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setNeedsVerify(false);
    loginMutation(
      {
        identifier: cleanId,
        emailOrPhone: cleanId,
        email: cleanId,
        password,
        // Lets the backend invalidate whatever device was signed in before this one.
        deviceId: getDeviceId(),
      },
      {
        onSuccess: () => {
          const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
          router.push(safeCallbackUrl(callbackUrl));
        },
        onError: (err: any) => {
          const msg = apiErrorMessage(err, "Invalid credentials");
          setErrorMsg(msg);
          // Backend blocks unverified accounts with a "verify your email" message —
          // surface a shortcut to the verification page (carrying the email over).
          setNeedsVerify(/verify/i.test(msg) && /email/i.test(msg));
        },
      },
    );
  }

  function goVerify() {
    // Only pre-fill the verify page if the user signed in with an email.
    if (mode === "email" && cleanId) {
      sessionStorage.setItem("pendingVerifyEmail", cleanId);
    }
    router.push("/verify");
  }

  return (
    <div className="space-y-6">
      <div className="md:hidden mb-2">
        <img src="/attend-logo.png" alt="Attend" style={{ height: 44 }} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to view your upcoming events and votes.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {sessionEnded && !errorMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>{sessionEnded}</span>
          </div>
        )}
        {justVerifiedEmail && !errorMsg && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>
              Your email is verified. Enter your password to sign in.
            </span>
          </div>
        )}
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
            {needsVerify && (
              <button
                type="button"
                onClick={goVerify}
                className="mt-2 block font-semibold text-red-700 underline hover:no-underline"
              >
                Verify your email now →
              </button>
            )}
          </div>
        )}
        {/* Which credential the user is signing in with. An explicit choice rather than
            sniffing what they typed: it lets the phone field pin "+234" from the first
            keystroke, and the label above each field says what is expected. */}
        <div role="tablist" aria-label="Sign in with" className="flex gap-1 rounded-xl bg-muted p-1">
          {(["email", "phone"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setErrorMsg(null);
                setNeedsVerify(false);
              }}
              className={cn(
                "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors",
                mode === m
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m === "email" ? "Email" : "Phone"}
            </button>
          ))}
        </div>

        {mode === "email" ? (
          <Input
            key="email"
            name="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="username"
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        ) : (
          <Input
            key="phone"
            name="phone"
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="username"
            leftIcon={<Phone className="h-4 w-4" />}
            prefix={DIAL_CODE}
            placeholder="803 123 4567"
            value={phone}
            // Drop anything duplicating the pinned code so the field never reads "+234 0801…".
            onChange={(e) => setPhone(stripDialCode(e.target.value))}
          />
        )}
        <Input
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to Attend?{" "}
        <Link href="/register" className="font-semibold text-foreground hover:underline">
          Create an account
        </Link>
      </p>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Invited to a single event?{" "}
        <Link href="/guest" className="font-semibold text-foreground hover:underline">
          Continue as guest
        </Link>
      </p>
    </div>
  );
}
