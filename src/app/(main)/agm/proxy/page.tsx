"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck, UserPlus, Copy, Check, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { useAssignProxy, useGetProxy, useAssignProxyDirections, useGetResolutions } from "@/api/agm/hooks";
import { useGetEvent } from "@/api/events/hooks";

type ProxyType = "chairman" | "named";
const CHAIRMAN_NAME = "Chairman of the Meeting";

// Pre-directed proxy instructions come from the July spec (master §5.5), but the backend
// never shipped them: POST /agm/{eventId}/proxy/directions returns 404 "No such endpoint",
// and no directions route exists anywhere in the API (there isn't even an /agm namespace).
// Appointing the proxy works, so leaving the section visible made submitting look
// half-successful — the proxy saved, the instructions silently went nowhere.
// Flip to true once the backend endpoint lands; the UI below is unchanged.
const PROXY_DIRECTIONS_ENABLED: boolean = false;

function ProxyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";

  const [type, setType] = useState<ProxyType>("chairman");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [assignedCode, setAssignedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: existingProxy } = useGetProxy(eventId);
  const { mutate: assignProxy, isPending } = useAssignProxy(eventId);
  const { mutate: assignProxyDirections, isPending: savingDirections } = useAssignProxyDirections(eventId);
  const { data: resolutionsData } = useGetResolutions(eventId);
  const { data: eventData } = useGetEvent(eventId);

  const resolutions = resolutionsData?.data?.resolutions ?? [];
  const [directions, setDirections] = useState<Record<string, "FOR" | "AGAINST" | "ABSTAIN" | "LET_PROXY_DECIDE">>({});

  useEffect(() => {
    if (resolutions.length > 0) {
      const initial: Record<string, "FOR" | "AGAINST" | "ABSTAIN" | "LET_PROXY_DECIDE"> = {};
      resolutions.forEach((r) => {
        initial[r.id] = "LET_PROXY_DECIDE";
      });
      setDirections(initial);
    }
  }, [resolutions]);

  useEffect(() => {
    if (!eventId) router.replace("/agm");
  }, [eventId, router]);

  const valid =
    type === "chairman" || (name.trim().length > 0 && /.+@.+\..+/.test(email));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const payload =
      type === "chairman"
        ? { proxyName: CHAIRMAN_NAME, proxyEmail: "", proxyPhone: "" }
        : { proxyName: name.trim(), proxyEmail: email.trim(), proxyPhone: phone.trim() };

    assignProxy(payload, {
      onSuccess: (res: any) => {
        const code = res?.data?.proxyCode || res?.proxyCode;
        const directionsList = Object.entries(directions).map(([resolutionId, direction]) => ({
          resolutionId,
          direction,
        }));
        if (PROXY_DIRECTIONS_ENABLED && directionsList.length > 0) {
          assignProxyDirections(
            { directions: directionsList },
            {
              onSuccess: () => {
                if (code) {
                  setAssignedCode(code);
                } else {
                  router.push(`/agm/receipt?eventId=${eventId}`);
                }
              },
              onError: (err: any) =>
                setErrorMsg(
                  err?.response?.data?.message || err?.message || "Proxy appointed, but failed to save directions."
                ),
            }
          );
        } else if (code) {
          setAssignedCode(code);
        } else {
          router.push(`/agm/receipt?eventId=${eventId}`);
        }
      },
      onError: (err: any) =>
        setErrorMsg(
          err?.response?.data?.message || err?.message || "Failed to assign proxy.",
        ),
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>

      <header>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Appoint a proxy</h1>
        <p className="text-sm text-muted-foreground">
          If you can&apos;t attend the meeting, appoint someone to vote on your behalf.
        </p>
        {existingProxy?.data && (
          <div className="mt-2 flex items-center gap-3 text-xs font-medium text-primary">
            <span>Current proxy: {existingProxy.data.proxyName}</span>
            {existingProxy.data.proxyCode && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono">
                Code: {existingProxy.data.proxyCode}
              </span>
            )}
          </div>
        )}
      </header>

      {assignedCode ? (
        <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-emerald-900">Proxy Appointed Successfully</h2>
              <p className="text-xs text-emerald-700">Give this 10-digit code to your proxy holder so they can vote on your behalf.</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Proxy Code</p>
              <p className="text-xl font-mono font-bold tracking-widest text-foreground">{assignedCode}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(assignedCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => router.push(`/agm/receipt?eventId=${eventId}`)}>
              View Vote Receipt
            </Button>
          </div>
        </div>
      ) : (

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <Choice
            active={type === "chairman"}
            onClick={() => setType("chairman")}
            icon={UserCheck}
            title="Chairman of the meeting"
            body="Standard option — your vote follows your pre-vote choices."
          />
          <Choice
            active={type === "named"}
            onClick={() => setType("named")}
            icon={UserPlus}
            title="Named proxy"
            body="Nominate a specific verified shareholder."
          />
        </div>

        {type === "named" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="name"
              label="Proxy full name"
              placeholder="e.g. Adekunle Bello"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              name="email"
              label="Proxy email"
              type="email"
              placeholder="proxy@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              name="phone"
              label="Proxy phone (optional)"
              type="tel"
              placeholder="+234 800 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        )}

        {PROXY_DIRECTIONS_ENABLED && resolutions.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Pre-directed proxy instructions</h3>
              <p className="text-xs text-muted-foreground">
                Specify your voting instructions for each resolution. If set to &quot;Let proxy decide&quot;, your proxy will cast the vote as they see fit during the live meeting.
              </p>
            </div>
            <div className="space-y-3">
              {resolutions.map((r, i) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-slate-50/50 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Resolution {r.order + 1}</p>
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { key: "FOR", label: "For" },
                      { key: "AGAINST", label: "Against" },
                      { key: "ABSTAIN", label: "Abstain" },
                      { key: "LET_PROXY_DECIDE", label: "Let proxy decide" }
                    ].map((opt) => {
                      const selected = (directions[r.id] || "LET_PROXY_DECIDE") === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setDirections((prev) => ({ ...prev, [r.id]: opt.key as any }))}
                          className={cn(
                            "rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all",
                            selected
                              ? opt.key === "FOR" ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                : opt.key === "AGAINST" ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                                : opt.key === "ABSTAIN" ? "bg-slate-600 border-slate-600 text-white shadow-sm"
                                : "bg-primary border-primary text-white shadow-sm"
                              : "bg-white border-border text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Proxy appointments must be submitted at least 48 hours before the meeting.
          You can revoke this anytime before voting opens.
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/agm")}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending || savingDirections} disabled={!valid || !eventId}>
            Submit proxy
          </Button>
        </div>
      </form>
      )}
    </div>
  );
}

function Choice({
  active, onClick, icon: Icon, title, body,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof UserCheck;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-border bg-white hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-primary text-white" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </button>
  );
}

export default function ProxyPage() {
  return (
    <Suspense>
      <ProxyPageInner />
    </Suspense>
  );
}
