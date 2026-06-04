"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLogin } from "@/api/auth/hooks";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const { mutate: loginMutation, isPending } = useLogin();
  const [email, setEmail] = useState("ngozi.okafor@email.com");
  const [password, setPassword] = useState("attend123");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    loginMutation(
      { email, password },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Invalid email or password"
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
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to view your upcoming events and votes.
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Remember me
          </label>
          <Link href="#" className="font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={isPending}>
          {isPending ? "Signing in" : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New to Attend?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
