"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/api/auth/hooks";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: loginMutation, isPending } = useLogin();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);

  // Detect whether the user typed an email or phone number for icon/autocomplete hints.
  const looksLikePhone = /^\+?\d[\d\s-]{5,}$/.test(identifier.trim());

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setNeedsVerify(false);
    const cleanId = identifier.trim();
    loginMutation(
      {
        identifier: cleanId,
        emailOrPhone: cleanId,
        email: cleanId,
        password,
      },
      {
        onSuccess: () => router.push("/"),
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message || err?.message || "Invalid credentials";
          setErrorMsg(msg);
          // Backend blocks unverified accounts with a "verify your email" message —
          // surface a shortcut to the verification page (carrying the email over).
          setNeedsVerify(/verify/i.test(msg) && /email/i.test(msg));
        },
      },
    );
  }

  function goVerify() {
    // Only pre-fill the verify page if the user entered an email.
    if (!looksLikePhone) {
      sessionStorage.setItem("pendingVerifyEmail", identifier.trim());
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
        <Input
          name="identifier"
          label="Email or Phone Number"
          type="text"
          autoComplete="username"
          leftIcon={looksLikePhone ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
          placeholder="you@email.com or +234..."
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Your password"
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
