"use client";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, MapPin, CalendarDays, Trophy, Target,
  BookOpen, CalendarClock, Cpu,
} from "lucide-react";
import { useGetChallenge, useGetMyTeam } from "@/api/hackathon/hooks";
import { useGetEvent } from "@/api/events/hooks";
import { ChallengeDetailData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: chData, isLoading: chLoading, error: chError } = useGetChallenge(id);
  const liveChallenge = chData?.data;

  // The challenge *detail* endpoint can fail (e.g. a backend 500) even when the
  // challenge exists. Since an innovation challenge is also a real event, fall back
  // to the event detail (same id) so the page still works with live data.
  const challengeFailed = !chLoading && (!!chError || !liveChallenge);
  const { data: evData, isLoading: evLoading } = useGetEvent(challengeFailed ? id : "");
  const { data: myTeamData } = useGetMyTeam(id);

  const ev = evData?.data;
  const team = myTeamData?.data;

  const challenge: ChallengeDetailData | null = liveChallenge
    ? liveChallenge
    : ev
    ? {
        id: ev.id,
        title: ev.title,
        description: ev.description,
        eventType: ev.eventType,
        status: ev.status,
        date: ev.date,
        startTime: ev.startTime,
        venue: ev.venue,
        organizerName: ev.registerName || ev.organizerName,
        registered: ev.registered,
        resourceCount: 0,
        myTeam: team
          ? {
              id: team.id,
              name: team.name,
              description: team.description,
              memberCount: team.members?.length ?? 0,
              submissionStatus: team.submission?.status ?? "NOT_SUBMITTED",
            }
          : null,
      }
    : null;

  const myTeam = challenge?.myTeam;
  const isLoading = chLoading || (challengeFailed && evLoading);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="space-y-6">
        <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Innovation
        </Link>
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          This challenge could not be loaded right now. Please try again shortly.
        </div>
      </div>
    );
  }

  const submitted =
    !!myTeam?.submissionStatus && myTeam.submissionStatus !== "NOT_SUBMITTED";
  const hasTeamSize = !!challenge.minTeamSize && !!challenge.maxTeamSize;

  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Innovation
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 to-fuchsia-700 p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">{challenge.organizerName}</p>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">{challenge.title}</h1>
          {challenge.description && <p className="max-w-2xl text-sm text-white/85">{challenge.description}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            {/* One-step application (Door B). The apply page itself gates on whether
                you've already applied. */}
            <Link href={`/hackathon/apply?challengeId=${id}`}>
              <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                Apply now
              </button>
            </Link>
            <Link href={`/hackathon/resources?challengeId=${id}`}>
              <button className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                Resources{challenge.resourceCount > 0 ? ` (${challenge.resourceCount})` : ""}
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Problem statement */}
      {challenge.problemStatement && (
        <section className="rounded-2xl border border-border bg-white p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">The challenge</p>
          <p className="text-sm leading-relaxed text-foreground/85">{challenge.problemStatement}</p>
          {challenge.expectedDeliverable && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/85">
              <span className="font-semibold text-foreground">What to build: </span>
              {challenge.expectedDeliverable}
            </p>
          )}
        </section>
      )}

      {/* Prizes */}
      {challenge.prizeTiers && challenge.prizeTiers.length > 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {challenge.prizeTiers.map((p) => (
            <div key={p.position} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex items-center gap-2 text-purple-700">
                <Trophy className="h-4.5 w-4.5" />
                <p className="text-xs font-semibold uppercase tracking-wide">{p.position}</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{p.reward}</p>
            </div>
          ))}
        </section>
      )}

      {/* Key facts — each tile only when the backend provides it */}
      <section className="grid gap-4 md:grid-cols-2">
        {challenge.tracks && challenge.tracks.length > 0 && (
          <InfoBlock icon={Target} title="Pathways">
            <div className="flex flex-wrap gap-2">
              {challenge.tracks.map((t) => (
                <span key={t} className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                  {t}
                </span>
              ))}
            </div>
          </InfoBlock>
        )}
        {hasTeamSize && (
          <InfoBlock icon={Users} title="Team size">
            <p className="text-sm text-foreground">
              {challenge.minTeamSize}–{challenge.maxTeamSize} members per team
            </p>
          </InfoBlock>
        )}
        {challenge.eligibilityCriteria && (
          <InfoBlock icon={BookOpen} title="Eligibility">
            <p className="text-sm text-foreground">{challenge.eligibilityCriteria}</p>
          </InfoBlock>
        )}
        {challenge.applicationDeadline && (
          <InfoBlock icon={CalendarClock} title="Application deadline">
            <p className="text-sm font-semibold text-foreground">{formatDate(challenge.applicationDeadline)}</p>
          </InfoBlock>
        )}
        {challenge.allowedTechStack && (
          <InfoBlock icon={Cpu} title="Allowed tech stack">
            <p className="text-sm text-foreground">{challenge.allowedTechStack}</p>
          </InfoBlock>
        )}
      </section>

      {myTeam && (
        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-700">Your team</p>
          <p className="text-base font-semibold text-foreground">{myTeam.name}</p>
          {myTeam.description && <p className="mt-1 text-sm text-muted-foreground">{myTeam.description}</p>}
          <div className="mt-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {myTeam.memberCount} member{myTeam.memberCount !== 1 ? "s" : ""}
            </span>
            {submitted && <Badge variant="success">Submitted</Badge>}
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Event details</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> {formatDate(challenge.date)}
              {challenge.startTime ? ` · ${challenge.startTime}` : ""}
            </div>
            {challenge.venue && (
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {challenge.venue}</div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organiser</p>
          <p className="text-sm font-semibold text-foreground">{challenge.organizerName}</p>
          {challenge.registered && (
            <p className="mt-1 text-xs text-emerald-700">You&apos;re registered for this challenge.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Trophy;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">{title}</p>
      </div>
      {children}
    </div>
  );
}
