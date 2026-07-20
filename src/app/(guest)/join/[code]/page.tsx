"use client";

import { use, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ShieldAlert, User, Mail, Phone, Building } from "lucide-react";
import { useGetGuestInvitePreview, useRedeemGuestInvite } from "@/api/guests/hooks";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Cookies from "js-cookie";

export default function GuestJoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") || "";

  const { data: previewData, isLoading, error } = useGetGuestInvitePreview(code);
  const { mutate: redeem, isPending: redeeming } = useRedeemGuestInvite();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Guest");
  const [formError, setFormError] = useState<string | null>(null);

  const preview = previewData?.data;

  // If already logged in as guest or user, we can clear cookies to re-log or allow them to proceed
  useEffect(() => {
    // If we already have a session, we can redeem again if they explicitly came here to join
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }

    redeem(
      {
        code,
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
      },
      {
        onSuccess: (res: any) => {
          const token = res?.data?.guestToken || res?.data?.token;
          if (token) {
            // Set guest session cookie valid for 1 day (24h)
            Cookies.set("accessToken", token, { expires: 1, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
            Cookies.set("isGuest", "true", { expires: 1, secure: process.env.NODE_ENV === "production", sameSite: "strict" });
            
            const targetEventId = preview?.eventId || eventId;
            // Redirect to appropriate live room
            router.push(`/agm/live?eventId=${targetEventId}&guest=true`);
          } else {
            setFormError("Failed to retrieve guest token from server.");
          }
        },
        onError: (err: any) => {
          setFormError(err?.response?.data?.message || err?.message || "Failed to redeem guest invitation.");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm font-semibold text-slate-600">Retrieving invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Invalid Invite Code</h2>
          <p className="text-sm text-slate-500">
            This invitation code is invalid, expired, or doesn&apos;t match this event. Please double check the link or contact the host.
          </p>
          <Button fullWidth onClick={() => router.push("/")} className="bg-slate-900 hover:bg-slate-800">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const capabilities = preview.capabilities || ["VIEW"];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-12">
      <div className="w-full max-w-lg space-y-8 rounded-3xl bg-white p-8 shadow-2xl border border-slate-100">
        
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold tracking-wide text-amber-800 uppercase">
            Guest Invitation
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {preview.eventTitle}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials below to join the session.
          </p>
        </div>

        {/* Capabilities Panel */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Enabled Privileges</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: "VIEW", label: "View Live" },
              { key: "QA", label: "Submit Q&A" },
              { key: "VOTE", label: "Cast Votes" }
            ].map((cap) => {
              const active = capabilities.includes(cap.key as any);
              return (
                <div
                  key={cap.key}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold ${
                    active ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-slate-100 text-slate-400 opacity-60"
                  }`}
                >
                  <Check className={`h-3.5 w-3.5 ${active ? "text-emerald-600" : "text-slate-300"}`} />
                  <span>{cap.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capture Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Adekunle Bello"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Email (optional)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="ade@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all"
                  placeholder="+234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase">Your Role</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Guest">Guest</option>
                <option value="Director">Director</option>
                <option value="Regulator">Regulator</option>
                <option value="Auditor">Auditor</option>
                <option value="Other">Other</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-500" />
            </div>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={redeeming}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 mt-4"
          >
            Redeem & Join Session
          </Button>
        </form>
      </div>
    </div>
  );
}
