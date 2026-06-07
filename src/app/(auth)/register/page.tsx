"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRegister } from "@/api/auth/hooks";

export default function RegisterPage() {
  const router = useRouter();
  const { mutate: registerMutation, isPending } = useRegister();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Split fullName into firstName and lastName for the API
    const nameParts = form.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (!firstName || !lastName) {
      setErrorMsg("Please enter your first and last name.");
      return;
    }

    registerMutation(
      {
        firstName,
        lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      },
      {
        onSuccess: () => {
          // Store email so the verify page knows which account to verify
          sessionStorage.setItem("pendingVerifyEmail", form.email);
          router.push("/verify");
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Registration failed. Please try again."
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
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join Attend in under a minute.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}
        <Input
          name="fullName"
          label="Full name"
          leftIcon={<User className="h-4 w-4" />}
          placeholder="Ngozi Okafor"
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />
        <Input
          name="email"
          label="Email"
          type="email"
          leftIcon={<Mail className="h-4 w-4" />}
          placeholder="you@email.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <Input
          name="phone"
          label="Phone"
          type="tel"
          leftIcon={<Phone className="h-4 w-4" />}
          placeholder="+234 800 000 0000"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          leftIcon={<Lock className="h-4 w-4" />}
          placeholder="Min 8 characters"
          hint="Use at least 8 characters with a mix of letters and numbers."
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
        <Button type="submit" fullWidth size="lg" loading={isPending}>
          {isPending ? "Creating account" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to Attend&apos;s Terms of Service and Privacy
        Policy.
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
