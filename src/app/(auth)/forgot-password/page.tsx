"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useForgotPassword } from "@/api/auth/hooks";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { mutate: forgotMutation, isPending } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    forgotMutation(
      { email },
      {
        onSuccess: () => {
          // Store email so the reset page knows which account to reset
          sessionStorage.setItem("pendingResetEmail", email);
          router.push("/reset-password");
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Could not send reset code. Please check your email and try again."
          );
        },
      }
    );
  }

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
        <h1 className="text-2xl font-bold text-foreground">
          Forgot your password?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your email address and we&apos;ll send you a code to reset your
          password.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}
        <Input
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" fullWidth size="lg" loading={isPending}>
          {isPending ? "Sending code" : "Send reset code"}
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
