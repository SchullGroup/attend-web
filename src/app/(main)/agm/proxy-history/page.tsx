"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, Mail, Phone, ChevronDown, ChevronUp } from "lucide-react";
import { useGetProxyHistory, useRevokeProxy } from "@/api/agm/hooks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, cn } from "@/lib/utils";
import { ProxyHistoryItem } from "@/types";

type Tone = "info" | "success" | "muted" | "danger" | "warning";

const statusTone = (s: string): Tone => {
  const u = (s || "").toUpperCase();
  if (u === "ATTENDED" || u === "AUTO_CAST") return "success";
  if (u === "ACCEPTED" || u === "INFO") return "info";
  if (u === "PENDING" || u === "OVERRIDDEN") return "warning";
  if (u === "REVOKED" || u === "CANCELLED") return "danger";
  return "muted";
};

const eventStatusTone = (s: string): Tone => {
  const u = (s || "").toUpperCase();
  if (u === "LIVE") return "info";
  if (u === "ENDED") return "muted";
  if (u === "CANCELLED") return "danger";
  return "success";
};

export default function ProxyHistoryPage() {
  const { data, isLoading } = useGetProxyHistory();
  const proxies = data?.data?.proxies ?? [];

  return (
    <div className="space-y-6">
      <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Proxy history</h1>
        <p className="text-sm text-muted-foreground">
          Every proxy you&apos;ve appointed to vote on your behalf.
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-24 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : proxies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t appointed any proxies yet. Appoint one from an AGM you&apos;re registered for.
        </div>
      ) : (
        <ul className="space-y-3">
          {proxies.map((p) => (
            <ProxyHistoryItemRow key={p.id} p={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProxyHistoryItemRow({ p }: { p: ProxyHistoryItem }) {
  const [expanded, setExpanded] = useState(false);
  const { mutate: revoke, isPending: revoking } = useRevokeProxy(p.eventId);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isRevoked = p.status?.toUpperCase() === "REVOKED";
  const isEnded = p.eventStatus?.toUpperCase() === "ENDED";
  const showRevoke = !isRevoked && !isEnded;

  function handleRevoke() {
    setErrorMsg(null);
    revoke(undefined, {
      onError: (err: any) => {
        setErrorMsg(err?.response?.data?.message || "Failed to revoke proxy.");
      },
    });
  }

  return (
    <li className="rounded-2xl border border-border bg-white p-4 space-y-3">
      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{p.eventTitle}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(p.eventDate)}
            {p.assignedAt ? ` · appointed ${formatDate(p.assignedAt)}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {p.status && (
            <Badge variant={statusTone(p.status)}>
              {p.status.replace(/_/g, " ").charAt(0) + p.status.replace(/_/g, " ").slice(1).toLowerCase()}
            </Badge>
          )}
          {p.eventStatus && (
            <Badge variant={eventStatusTone(p.eventStatus)}>
              {p.eventStatus.charAt(0) + p.eventStatus.slice(1).toLowerCase()}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50">
            <UserCheck className="h-4.5 w-4.5 text-purple-600" />
          </div>
          <div className="min-w-0 text-sm">
            <p className="font-medium text-foreground truncate">{p.proxyName}</p>
            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {p.proxyEmail && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {p.proxyEmail}
                </span>
              )}
              {p.proxyPhone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" /> {p.proxyPhone}
                </span>
              )}
              {p.sharesRepresented != null && p.sharesRepresented > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  {p.sharesRepresented.toLocaleString()} shares
                </span>
              )}
            </div>
          </div>
        </div>

        {showRevoke && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRevoke}
            loading={revoking}
            className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 bg-white sm:self-auto self-start"
          >
            Revoke Proxy
          </Button>
        )}
      </div>

      {p.directions && p.directions.length > 0 && (
        <div className="border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" /> Hide voting directions
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> View voting directions ({p.directions.length})
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Resolution Directions</h4>
              <div className="space-y-2.5">
                {p.directions.map((dir, idx) => (
                  <div key={dir.resolutionId || idx} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 last:border-b-0 pb-2 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {dir.resolutionTitle || `Resolution ${idx + 1}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "rounded-lg px-2 py-0.5 text-[10px] font-bold border uppercase",
                        dir.direction === "FOR" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : dir.direction === "AGAINST" ? "bg-rose-50 text-rose-700 border-rose-200"
                          : dir.direction === "ABSTAIN" ? "bg-slate-50 text-slate-700 border-slate-200"
                          : "bg-primary/5 text-primary border-primary/20"
                      )}>
                        Direct: {dir.direction?.replace(/_/g, " ") || "LET PROXY DECIDE"}
                      </span>
                      {dir.castOutcome && (
                        <span className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-bold border uppercase",
                          dir.castOutcome === "AUTO_CAST" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : dir.castOutcome === "OVERRIDDEN" ? "bg-amber-50 text-amber-700 border-amber-200"
                            : dir.castOutcome === "REVOKED" ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        )}>
                          Outcome: {dir.castOutcome.replace(/_/g, " ")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
