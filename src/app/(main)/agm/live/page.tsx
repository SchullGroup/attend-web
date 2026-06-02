"use client";
import { useState } from "react";
import Link from "next/link";
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
import { MOCK_EVENTS, MOCK_RESOLUTIONS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Tab = "agenda" | "qa" | "ballot";

export default function LivePage() {
  const event = MOCK_EVENTS.find((e) => e.id === "evt_001")!;
  const [tab, setTab] = useState<Tab>("agenda");
  const [vote, setVote] = useState<"for" | "against" | "abstain" | null>(null);
  const [q, setQ] = useState("");
  const [questions, setQuestions] = useState([
    { id: "q1", who: "Adaeze N.", text: "Will the dividend be paid in cash or scrip?" },
    { id: "q2", who: "Femi A.", text: "What is the bank's outlook on FX volatility for the second half?" },
  ]);

  function sendQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setQuestions((xs) => [...xs, { id: String(Math.random()), who: "You", text: q.trim() }]);
    setQ("");
  }

  const openRes = MOCK_RESOLUTIONS.find((r) => r.votingOpen);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Leave meeting
        </Link>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {event.rsvpCount.toLocaleString()} watching
          </span>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {event.organiser}
        </p>
        <h1 className="text-xl font-bold text-foreground md:text-2xl">{event.title}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Stream */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                <Play className="h-9 w-9 fill-white text-white" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Live Stream
              </p>
              <p className="mt-1 text-xs text-white/50">
                Now showing: Resolution 3 — Re-election of Directors
              </p>
            </div>
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white/80">
              <span>00:42:18 elapsed</span>
              <span>HD · 1080p</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-white p-3 text-center">
              <p className="text-xs text-muted-foreground">Quorum</p>
              <p className="text-base font-semibold text-foreground">68.4%</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-3 text-center">
              <p className="text-xs text-muted-foreground">Resolution</p>
              <p className="text-base font-semibold text-foreground">3 of 4</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-3 text-center">
              <p className="text-xs text-muted-foreground">Time left</p>
              <p className="text-base font-semibold text-foreground">12 min</p>
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

            <div className="max-h-[420px] overflow-y-auto p-4">
              {tab === "agenda" && (
                <ul className="space-y-2">
                  {event.agenda.map((a) => (
                    <li
                      key={a.id}
                      className={cn(
                        "rounded-xl border p-3",
                        a.isCurrent
                          ? "border-primary bg-primary/5"
                          : "border-border bg-white",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">{a.startTime}</p>
                          <p className="text-sm font-medium text-foreground">{a.title}</p>
                        </div>
                        {a.isCurrent && (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                            Now
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
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
                    <Button type="submit" size="sm">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}

              {tab === "ballot" && openRes && (
                <div className="space-y-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                      Resolution {openRes.number}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-foreground">
                      {openRes.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {openRes.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["for", "against", "abstain"] as const).map((opt) => {
                      const selected = vote === opt;
                      const Icon = opt === "for" ? Check : opt === "against" ? X : Minus;
                      const tone =
                        opt === "for"
                          ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : opt === "against"
                          ? "border-red-200 text-red-700 hover:bg-red-50"
                          : "border-border text-muted-foreground hover:bg-muted";
                      const selectedTone =
                        opt === "for"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : opt === "against"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-slate-700 text-white border-slate-700";
                      return (
                        <button
                          key={opt}
                          onClick={() => setVote(opt)}
                          className={cn(
                            "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold capitalize transition-colors",
                            selected ? selectedTone : tone,
                          )}
                        >
                          <Icon className="h-4 w-4" /> {opt}
                        </button>
                      );
                    })}
                  </div>
                  <Button fullWidth disabled={!vote}>
                    {vote ? `Cast vote: ${vote}` : "Choose an option"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
