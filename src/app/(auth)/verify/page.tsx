"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/intro"), 1200);
  }

  const filled = code.every((c) => c !== "");

  return (
    <div className="space-y-6">
      <div className="flex justify-center md:hidden">
        <div className="text-2xl font-extrabold tracking-tight text-primary">attend</div>
      </div>

      <div className="text-center">
        <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Verify your email</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">you@email.com</span>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex justify-between gap-2">
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

        <Button type="submit" fullWidth size="lg" loading={loading} disabled={!filled}>
          {loading ? "Verifying" : "Verify email"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive a code?{" "}
          <button type="button" className="font-semibold text-primary hover:underline">
            Resend
          </button>
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="hover:underline">Back to sign in</Link>
      </p>
    </div>
  );
}
