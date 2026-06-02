"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const matches = form.next.length >= 8 && form.next === form.confirm;
  const valid = form.current.length >= 8 && matches;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/profile"), 1200);
    }, 1500);
  }

  return (
    <div className="space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Change password</h1>
        <p className="text-sm text-muted-foreground">
          Use a strong password you don&apos;t use anywhere else.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="mx-auto max-w-lg space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm"
      >
        <Input
          name="current"
          label="Current password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.current}
          onChange={(e) => update("current", e.target.value)}
        />
        <Input
          name="next"
          label="New password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.next}
          onChange={(e) => update("next", e.target.value)}
          hint="Min 8 characters. Mix letters, numbers and symbols."
        />
        <Input
          name="confirm"
          label="Confirm new password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
          error={form.confirm && !matches ? "Passwords do not match" : undefined}
        />

        {success && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Password updated. Redirecting…
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!valid}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  );
}
