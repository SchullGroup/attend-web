"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Users,
  MessageSquare,
  Vote,
  ListChecks,
  Send,
  Check,
  X,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useGetResolutions, useCastVote } from "@/api/agm/hooks";

type Tab = "agenda" | "qa" | "ballot";
type VoteChoice = "FOR" | "AGAINST" | "ABSTAIN";

function LivePageInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";

  const [tab, setTab] = useState<Tab>("agenda");
  const [q, setQ] = useState("");
  const [questions, setQuestions] = useState([
    { id: "q1", who: "Adaeze N.", text: "Will the dividend be paid in cash or scrip?" },
    { id: "q2", who: "Femi A.", text: "What is the bank's outlook on FX volatility for the second half?" },
  ]);

  const { data: resData } = useGetResolutions(eventId);
  const { mutate: castVote, isPending: voting } = useCastVote(eventId);

  const resolutions = resData?.data?.resolutions ?? [];
  const votingOpen = resData?.data?.votingOpen ?? false;
  const openRes = votingOpen ? resolutions.find((r) => !r.myVote) : undefined;

  function sendQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setQuestions((xs) => [...xs, { id: String(Math.random()), who: "You", text: q.trim() }]);
    setQ("");
  }

  function handleVote(resolutionId: string, choice: VoteChoice) {
    castVote({ resolutionId, data: { choice } });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/agm"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Leave meeting
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          Live
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Stream */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <Play className="h-9 w-9 fill-white text-white" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Live Stream
              </p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex border-b border-border">
              {[
                { id: "agenda" as Tab, label: "Agenda", icon: ListChecks },
                { id: "qa" as Tab, label: "Q&A", icon: MessageSquare },
                { id: "ballot" as Tab, label: "Ballot", icon: Vote },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold",
                    tab === id ? "border-b-2 border-primary text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>

            <div className="max-h-105 overflow-y-auto p-4">
              {tab === "agenda" && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Agenda will appear here during the live meeting.
                </div>
              )}

              {tab === "qa" && (
                <div className="flex h-full flex-col">
                  <ul className="space-y-2">
                    {questions.map((q) => (
                      <li key={q.id} className="rounded-xl bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-foreground">{q.who}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{q.text}</p>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={sendQuestion} className="mt-3 flex gap-2">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Ask the board…"
                      className="h-10 flex-1 rounded-xl border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button type="submit" size="sm"><Send className="h-4 w-4" /></Button>
                  </form>
                </div>
              )}

              {tab === "ballot" && (
                !votingOpen ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Voting is not currently open.
                  </div>
                ) : !openRes ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    All resolutions have been voted on.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                        Resolution {openRes.order + 1}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold text-foreground">{openRes.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{openRes.description}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["FOR", "AGAINST", "ABSTAIN"] as VoteChoice[]).map((opt) => {
                        const Icon = opt === "FOR" ? Check : opt === "AGAINST" ? X : Minus;
                        const tone =
                          opt === "FOR"
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : opt === "AGAINST"
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-border text-muted-foreground hover:bg-muted";
                        return (
                          <button
                            key={opt}
                            onClick={() => handleVote(openRes.id, opt)}
                            disabled={voting}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold capitalize transition-colors disabled:opacity-50",
                              tone,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {opt.charAt(0) + opt.slice(1).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                    {voting && (
                      <p className="text-center text-xs text-muted-foreground">Submitting vote…</p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense>
      <LivePageInner />
    </Suspense>
  );
}
