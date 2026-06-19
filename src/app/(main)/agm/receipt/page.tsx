"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Download, Copy, Check, Building2, ChevronRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetVoteReceipt, useGetProxy } from "@/api/agm/hooks";
import { useGetEvents } from "@/api/events/hooks";
import { EventListItem } from "@/types";
import { formatDate } from "@/lib/utils";

function voteLabel(c: string) {
  const u = (c || "").toUpperCase();
  return u === "FOR" ? "For" : u === "AGAINST" ? "Against" : "Abstain";
}

function ReceiptInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useGetVoteReceipt(eventId);
  const receipt = data?.data;
  const { data: proxyData } = useGetProxy(eventId);
  const proxy = proxyData?.data;

  // No event selected → let the user pick which AGM's receipt to view. There's no
  // "list all receipts" endpoint, so we list the AGMs they're registered for.
  if (!eventId) {
    return <ReceiptPicker />;
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-72 animate-pulse rounded-3xl border border-border bg-muted" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="space-y-6">
        <Link href="/agm/receipt" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All receipts
        </Link>
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No vote receipt found. Cast your votes at an AGM and your receipt will appear here.
        </div>
      </div>
    );
  }

  const view = {
    reference: data?.referenceId ?? "—",
    meeting: receipt.eventTitle,
    date: receipt.votes[0]?.votedAt ? formatDate(receipt.votes[0].votedAt) : "—",
    resolutions: receipt.votes.map((v, i) => ({
      num: i + 1,
      title: v.resolutionTitle,
      vote: voteLabel(v.choice),
    })),
  };

  function copy() {
    navigator.clipboard.writeText(view.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          <div className="border-b border-border bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Vote receipt
                </p>
                <h1 className="text-lg font-bold">Your votes have been recorded</h1>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Row label="Meeting" value={view.meeting} />
              <Row label="Cast at" value={view.date} />
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <button
                  onClick={copy}
                  className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
                >
                  {view.reference}
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resolutions
              </p>
              {view.resolutions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No votes recorded for this meeting yet.
                </div>
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {view.resolutions.map((r) => (
                    <li key={r.num} className="flex items-center justify-between p-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Resolution {r.num}</p>
                        <p className="font-medium text-foreground">{r.title}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          r.vote === "For"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.vote === "Against"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.vote}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {proxy && proxy.proxyName && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Proxy
                </p>
                <div className="flex items-start gap-3 rounded-xl border border-border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                    <UserCheck className="h-4.5 w-4.5 text-purple-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{proxy.proxyName}</p>
                    {(proxy.proxyEmail || proxy.proxyPhone) && (
                      <p className="text-xs text-muted-foreground">
                        {[proxy.proxyEmail, proxy.proxyPhone].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {proxy.assignedAt && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Appointed {formatDate(proxy.assignedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              This receipt is timestamped and serves as evidence of your
              participation and votes at the meeting.
            </div>

            <div className="flex gap-3">
              <Button fullWidth onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Download receipt
              </Button>
              <Link href="/agm" className="block">
                <Button variant="outline">Back to AGMs</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceiptPicker() {
  const { data, isLoading } = useGetEvents({ eventType: "AGM_EGM", size: 50 });
  const agms = (data?.data?.events ?? []).filter(
    (e: EventListItem) => e.eventType === "AGM_EGM" && e.registered,
  );

  return (
    <div className="space-y-6">
      <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-foreground">My receipts</h1>
        <p className="text-sm text-muted-foreground">
          Select an AGM to view your vote receipt.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : agms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You don&apos;t have any AGM receipts yet. Once you vote at an AGM you&apos;re
          registered for, your receipt will appear here.
        </div>
      ) : (
        <ul className="space-y-3">
          {agms.map((e) => (
            <li key={e.id}>
              <Link
                href={`/agm/receipt?eventId=${e.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4 hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.date)}{e.startTime ? ` · ${e.startTime}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <Suspense>
      <ReceiptInner />
    </Suspense>
  );
}
