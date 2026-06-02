"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MOCK_RESOLUTIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Vote = "for" | "against" | "abstain";

export default function PreVotePage() {
  const router = useRouter();
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [loading, setLoading] = useState(false);

  function totalVotes(v: { for: number; against: number; abstain: number }) {
    return v.for + v.against + v.abstain;
  }

  function submit() {
    setLoading(true);
    setTimeout(() => router.push("/agm/receipt"), 1500);
  }

  const open = MOCK_RESOLUTIONS.filter((r) => r.votingOpen);
  const closed = MOCK_RESOLUTIONS.filter((r) => !r.votingOpen);
  const allOpenVoted = open.every((r) => votes[r.id]);

  return (
    <div className="space-y-6">
      <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Zenith Bank Plc — 2026 AGM
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Pre-vote on resolutions</h1>
        <p className="text-sm text-muted-foreground">
          Submit your vote on each open resolution before the meeting starts. You
          can change your vote until voting closes.
        </p>
      </header>

      {open.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Open for voting
          </h2>
          {open.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border-2 border-primary/30 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                    Resolution {r.number}
                  </p>
                  <h3 className="mt-0.5 text-lg font-semibold text-foreground">
                    {r.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                </div>
                <Badge variant="default">Open</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["for", "against", "abstain"] as Vote[]).map((opt) => {
                  const selected = votes[r.id] === opt;
                  const Icon = opt === "for" ? Check : opt === "against" ? X : Minus;
                  const tone =
                    opt === "for"
                      ? "border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                      : opt === "against"
                      ? "border-red-200 hover:bg-red-50 text-red-700"
                      : "border-border hover:bg-muted text-muted-foreground";
                  const selectedTone =
                    opt === "for"
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : opt === "against"
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-slate-700 bg-slate-700 text-white";
                  return (
                    <button
                      key={opt}
                      onClick={() => setVotes((v) => ({ ...v, [r.id]: opt }))}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold capitalize transition-colors",
                        selected ? selectedTone : tone,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {opt}
                    </button>
                  );
                })}
              </div>
            </article>
          ))}
        </section>
      )}

      {closed.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Closed resolutions
          </h2>
          {closed.map((r) => {
            const v = r.votes;
            if (!v) {
              return (
                <article key={r.id} className="rounded-2xl border border-border bg-white p-5 opacity-75">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Resolution {r.number}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold text-foreground">{r.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                    </div>
                    <Badge variant="muted">Awaiting</Badge>
                  </div>
                </article>
              );
            }
            const total = totalVotes(v);
            const forPct = Math.round((v.for / total) * 100);
            const againstPct = Math.round((v.against / total) * 100);
            const abstainPct = 100 - forPct - againstPct;
            return (
              <article key={r.id} className="rounded-2xl border border-border bg-white p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Resolution {r.number}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-foreground">{r.title}</h3>
                  </div>
                  {r.userVote === "for" && <Badge variant="success">You voted for</Badge>}
                </div>
                <div className="space-y-2">
                  <Bar label="For" value={forPct} color="bg-emerald-500" count={v.for} />
                  <Bar label="Against" value={againstPct} color="bg-red-500" count={v.against} />
                  <Bar label="Abstain" value={abstainPct} color="bg-slate-400" count={v.abstain} />
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="sticky bottom-24 z-10 md:bottom-0">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {Object.keys(votes).length} of {open.length} cast
              </p>
              <p className="text-xs text-muted-foreground">
                You can update your vote until voting closes.
              </p>
            </div>
            <Button onClick={submit} loading={loading} disabled={!allOpenVoted}>
              Submit votes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, color, count }: { label: string; value: number; color: string; count: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">
          {count.toLocaleString()} · {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`${color} h-full rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
