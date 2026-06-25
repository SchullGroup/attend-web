"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Users,
  MessageSquare,
  Vote,
  Send,
  Check,
  X,
  Minus,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ThumbsUp,
  Clock,
} from "lucide-react";
import { useGetEvent, useGetStream, useGetCountdown } from "@/api/events/hooks";
import {
  useGetResolutions,
  useCastVote,
  useGetQuestions,
  useSubmitQuestion,
  useUpvoteQuestion,
} from "@/api/agm/hooks";
import { Button } from "@/components/ui/Button";
import { cn, formatRelativeTime, toEmbedUrl } from "@/lib/utils";
import { Resolution } from "@/types";

type Tab = "qa" | "ballot";
type VoteChoice = "FOR" | "AGAINST" | "ABSTAIN";

function fmtCountdown(total: number): string {
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

interface LiveRoomProps {
  eventId: string;
  // AGMs show the live ballot; general events show only video + Q&A.
  showBallot?: boolean;
  backHref?: string;
  backLabel?: string;
}

export function LiveRoom({
  eventId,
  showBallot = true,
  backHref = "/agm",
  backLabel = "Leave meeting",
}: LiveRoomProps) {
  const { data: eventResp } = useGetEvent(eventId);
  const event = eventResp?.data;
  const title = event?.title ?? "Live session";
  const organiser = event?.registerName || event?.organizerName || "";
  const watching = event?.registeredCount ?? 0;
  const isLive = event?.status === "LIVE";

  // Stream link: prefer the gated /stream endpoint (only resolves when live +
  // registered); fall back to the streamUrl the admin set on the event.
  const { data: streamData } = useGetStream(eventId, isLive);
  const streamUrl = (streamData?.data?.streamUrl as string) || event?.streamUrl || "";

  // Countdown to start — only polled before the event is live.
  const { data: cdData } = useGetCountdown(eventId, !!event && !isLive);
  const cdSecs =
    typeof cdData?.data?.secondsUntilStart === "number" ? cdData.data.secondsUntilStart : null;

  // Only AGMs poll resolutions for the live ballot.
  const { data: resData } = useGetResolutions(eventId, showBallot ? 5000 : undefined, showBallot);
  const { mutate: castVote, isPending: voting } = useCastVote(eventId);
  const { mutate: upvote } = useUpvoteQuestion(eventId);

  const resolutions = resData?.data?.resolutions ?? [];
  // Status-driven (secondsRemaining is null while a resolution is WAITING).
  const openRes = resolutions.find(
    (r) => (r.status || "").toUpperCase() === "OPEN" || r.secondsRemaining > 0,
  );
  const closedRes = resolutions.filter(
    (r) => (r.status || "").toUpperCase() === "CLOSED" && r.forCount + r.againstCount + r.abstainCount > 0,
  );

  const { data: qData } = useGetQuestions(eventId);
  const { mutate: submitQuestion, isPending: submittingQ } = useSubmitQuestion(eventId);
  const apiQuestions = qData?.data?.questions ?? [];
  const qaItems = apiQuestions.map((x) => ({
    id: x.id,
    who: x.anonymous ? "Anonymous" : x.askerName || "Participant",
    time: x.submittedAt ? formatRelativeTime(x.submittedAt) : "",
    text: x.content,
    answered: !!x.answer || (x.status || "").toUpperCase() === "ANSWERED",
    answer: x.answer || "",
    upvoteCount: x.upvoteCount ?? 0,
    myUpvote: !!x.myUpvote,
  }));

  const [tab, setTab] = useState<Tab>(showBallot ? "ballot" : "qa");
  const [vote, setVote] = useState<VoteChoice | null>(null);
  const [voteMsg, setVoteMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [q, setQ] = useState("");
  const [qSent, setQSent] = useState(false);
  const [userQuestion, setUserQuestion] = useState("");
  const [videoHidden, setVideoHidden] = useState(false);

  // Local "starts in" ticker — re-syncs to the backend's secondsUntilStart on
  // each poll, ticks down locally in between.
  const [startsIn, setStartsIn] = useState<number | null>(null);
  useEffect(() => {
    if (cdSecs == null) {
      setStartsIn(null);
      return;
    }
    setStartsIn(cdSecs);
    const t = setInterval(() => setStartsIn((s) => (s == null ? null : Math.max(0, s - 1))), 1000);
    return () => clearInterval(t);
  }, [cdSecs]);

  // Real countdown: re-sync to the open resolution's secondsRemaining on every
  // poll, tick down locally in between.
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    if (!openRes) {
      setCountdown(0);
      return;
    }
    setCountdown(openRes.secondsRemaining);
    const t = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRes?.id, openRes?.secondsRemaining]);

  // Pre-select the user's existing vote so they can review/change it in the window.
  useEffect(() => {
    setVote((openRes?.myVote as VoteChoice | null) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openRes?.id]);

  function sendQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    const text = q.trim();
    setUserQuestion(text);
    submitQuestion(
      { content: text, anonymous: false },
      {
        onSuccess: () => {
          setQSent(true);
          setQ("");
        },
      },
    );
  }

  function handleCastVote() {
    if (!openRes || !vote) return;
    setVoteMsg(null);
    castVote(
      { resolutionId: openRes.id, data: { choice: vote } },
      {
        onSuccess: () => {
          setVoteMsg({ kind: "ok", text: "Your vote has been recorded." });
          setVote(null);
        },
        onError: (err: any) => {
          const status = err?.response?.status;
          setVoteMsg({
            kind: "err",
            text:
              status === 409
                ? "You've already voted on this resolution."
                : err?.response?.data?.message || "Could not record your vote. Please try again.",
          });
        },
      },
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {backLabel}
        </Link>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Not live
            </span>
          )}
          {watching > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {watching.toLocaleString()} watching
            </span>
          )}
        </div>
      </div>

      <div>
        {organiser && (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{organiser}</p>
        )}
        <h1 className="text-xl font-bold text-foreground md:text-2xl">{title}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Stream */}
        <div className="lg:col-span-3">
          {videoHidden ? (
            <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  <span className="h-1 w-1 rounded-full bg-white" /> Live
                </span>
                <p className="text-sm font-semibold text-white line-clamp-1">{title}</p>
              </div>
              <button
                onClick={() => setVideoHidden(false)}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                <ChevronDown className="h-3.5 w-3.5" /> Expand
              </button>
            </div>
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
              {streamUrl ? (
                <iframe
                  src={toEmbedUrl(streamUrl)}
                  title={title}
                  className="absolute inset-0 h-full w-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_40%)]" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur">
                      {startsIn != null && startsIn > 0 ? (
                        <Clock className="h-7 w-7 text-white/70" />
                      ) : (
                        <Play className="h-7 w-7 text-white/70" />
                      )}
                    </div>
                    <p className="mt-4 text-sm font-semibold text-white/85">
                      {startsIn != null && startsIn > 0
                        ? `Starts in ${fmtCountdown(startsIn)}`
                        : isLive
                        ? "Waiting for the live stream…"
                        : "The live stream will appear here once the session begins"}
                    </p>
                  </div>
                </>
              )}
              <button
                onClick={() => setVideoHidden(true)}
                className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-black/60"
              >
                <ChevronUp className="h-3.5 w-3.5" /> Minimise
              </button>
            </div>
          )}

          {/* Countdown strip — driven by the open resolution's secondsRemaining (AGM only) */}
          {showBallot && openRes && (
            <div
              className={cn(
                "mt-2 flex items-center gap-2 rounded-xl px-4 py-2.5 transition-colors",
                countdown <= 10 ? "bg-red-600" : "bg-amber-500",
              )}
            >
              <Vote className="h-4 w-4 shrink-0 text-white" />
              <p className="text-sm font-semibold text-white">
                Voting open · Resolution {openRes.order + 1}
                {countdown > 0 ? ` · ${countdown}s remaining` : ""}
              </p>
            </div>
          )}

          {showBallot && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-border bg-white p-3 text-center">
                <p className="text-xs text-muted-foreground">Resolution</p>
                <p className="text-base font-semibold text-foreground">
                  {openRes ? openRes.order + 1 : "—"} of {resolutions.length || "—"}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-3 text-center">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-base font-semibold text-foreground">{openRes ? "Open" : "Closed"}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="flex border-b border-border">
              {showBallot ? (
                [
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
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center gap-1.5 border-b-2 border-primary py-3 text-xs font-semibold text-primary">
                  <MessageSquare className="h-3.5 w-3.5" /> Q&amp;A
                </div>
              )}
            </div>

            <div className="max-h-[420px] overflow-y-auto p-4">
              {tab === "qa" && (
                <div className="flex flex-col gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Submitted Questions
                  </p>
                  <ul className="space-y-2">
                    {qaItems.map((item) => (
                      <li key={item.id} className="rounded-xl border border-border bg-white p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-foreground">{item.who}</p>
                          <div className="flex items-center gap-2">
                            {item.answered && (
                              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                <CheckCircle className="h-3 w-3" /> Addressed
                              </span>
                            )}
                            {item.time && <p className="text-[11px] text-muted-foreground">{item.time}</p>}
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{item.text}</p>
                        {item.answer && (
                          <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-800">
                            <span className="font-semibold">Answer: </span>
                            {item.answer}
                          </div>
                        )}
                        <div className="mt-2 flex items-center">
                          <button
                            type="button"
                            onClick={() => upvote(item.id)}
                            aria-pressed={item.myUpvote}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                              item.myUpvote
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border text-muted-foreground hover:bg-muted",
                            )}
                          >
                            <ThumbsUp className={cn("h-3.5 w-3.5", item.myUpvote && "fill-current")} />
                            {item.upvoteCount}
                          </button>
                        </div>
                      </li>
                    ))}
                    {qSent && (
                      <li className="rounded-xl border border-primary/20 bg-primary/5 p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-xs font-semibold text-primary">You</p>
                          <p className="text-[11px] text-muted-foreground">Just now · Pending review</p>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{userQuestion}</p>
                      </li>
                    )}
                  </ul>
                  <p className="text-xs text-muted-foreground">
                    Questions are reviewed by the moderator before being shown to the Chair.
                  </p>
                  <form onSubmit={sendQuestion} className="flex gap-2">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Submit a question..."
                      className="h-10 flex-1 rounded-xl border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <Button type="submit" size="sm" loading={submittingQ} disabled={!q.trim()} className="bg-slate-900 hover:bg-slate-800">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                  {qSent && (
                    <p className="text-xs text-emerald-700">Your question was submitted for review.</p>
                  )}
                </div>
              )}

              {showBallot &&
                tab === "ballot" &&
                (openRes ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                        Resolution {openRes.order + 1}
                      </p>
                      <h3 className="mt-0.5 text-base font-semibold text-foreground">
                        {openRes.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {openRes.description}
                      </p>
                    </div>

                    {voteMsg && (
                      <div
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm font-medium",
                          voteMsg.kind === "ok"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-600",
                        )}
                      >
                        {voteMsg.text}
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      {(["FOR", "AGAINST", "ABSTAIN"] as VoteChoice[]).map((opt) => {
                        const selected = vote === opt;
                        const Icon = opt === "FOR" ? Check : opt === "AGAINST" ? X : Minus;
                        const tone =
                          opt === "FOR"
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : opt === "AGAINST"
                            ? "border-red-200 text-red-700 hover:bg-red-50"
                            : "border-border text-muted-foreground hover:bg-muted";
                        const selectedTone =
                          opt === "FOR"
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : opt === "AGAINST"
                            ? "bg-red-600 text-white border-red-600"
                            : "bg-slate-700 text-white border-slate-700";
                        return (
                          <button
                            key={opt}
                            onClick={() => setVote(opt)}
                            disabled={voting}
                            className={cn(
                              "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold capitalize transition-colors disabled:opacity-50",
                              selected ? selectedTone : tone,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {opt.charAt(0) + opt.slice(1).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                    <Button fullWidth disabled={!vote || voting} loading={voting} onClick={handleCastVote}>
                      {vote ? `Cast vote: ${vote.charAt(0) + vote.slice(1).toLowerCase()}` : "Choose an option"}
                    </Button>

                    {openRes.forCount + openRes.againstCount + openRes.abstainCount > 0 && (
                      <div className="border-t border-border pt-3">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> Live tally
                        </p>
                        <ResolutionResult r={openRes} />
                      </div>
                    )}
                  </div>
                ) : closedRes.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Results
                    </p>
                    {closedRes.map((r) => (
                      <ResolutionResult key={r.id} r={r} />
                    ))}
                  </div>
                ) : resolutions.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Resolutions
                    </p>
                    {[...resolutions]
                      .sort((a, b) => a.order - b.order)
                      .map((r) => {
                        const v = (r.myVote || "").toUpperCase();
                        const s = (r.status || "").toUpperCase();
                        const label = v
                          ? `Voted ${v.charAt(0) + v.slice(1).toLowerCase()}`
                          : s === "OPEN" ? "Open" : s === "CLOSED" ? "Closed" : s === "WAITING" ? "Waiting" : "Pending";
                        const tone = v
                          ? "bg-emerald-100 text-emerald-700"
                          : s === "OPEN" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
                        return (
                          <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
                            <div className="min-w-0">
                              <p className="text-[11px] text-muted-foreground">Resolution {r.order + 1}</p>
                              <p className="truncate text-sm font-medium text-foreground">{r.title}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{label}</span>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Voting is not currently open.
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResolutionResult({ r }: { r: Resolution }) {
  const totalShares = r.forShares + r.againstShares + r.abstainShares;
  const pct = (s: number) => (totalShares ? Math.round((s / totalShares) * 100) : 0);
  const rows = [
    { label: "For", count: r.forCount, shares: r.forShares, color: "bg-emerald-500" },
    { label: "Against", count: r.againstCount, shares: r.againstShares, color: "bg-red-500" },
    { label: "Abstain", count: r.abstainCount, shares: r.abstainShares, color: "bg-slate-400" },
  ];
  return (
    <article className="rounded-xl border border-border bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Resolution {r.order + 1}
      </p>
      <h4 className="text-sm font-semibold text-foreground">{r.title}</h4>
      <div className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-0.5 flex items-center justify-between text-[11px]">
              <span className="font-medium text-foreground">{row.label}</span>
              <span className="text-muted-foreground">
                {row.count} · {row.shares.toLocaleString()} shares · {pct(row.shares)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={`${row.color} h-full`} style={{ width: `${pct(row.shares)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
