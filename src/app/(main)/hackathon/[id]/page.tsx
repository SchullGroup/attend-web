"use client";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Users,
  CalendarClock,
  Target,
  BookOpen,
  Award,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { MOCK_CHALLENGE } from "@/lib/mock-data";
import { useGetChallenge } from "@/api/hackathon/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useGetChallenge(id);
  const challenge = data?.data;
  const myTeam = challenge?.myTeam;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  // Real challenge found → render live data
  if (!error && challenge) {
    const submitted =
      !!myTeam?.submissionStatus && myTeam.submissionStatus !== "NOT_SUBMITTED";
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
              {myTeam ? (
                <Link href={`/hackathon/submit?challengeId=${id}&teamId=${myTeam.id}`}>
                  <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                    Submit project
                  </button>
                </Link>
              ) : (
                <Link href={`/hackathon/apply?challengeId=${id}`}>
                  <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                    Apply now
                  </button>
                </Link>
              )}
              <Link href={`/hackathon/resources?challengeId=${id}`}>
                <button className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                  Resources{challenge.resourceCount > 0 ? ` (${challenge.resourceCount})` : ""}
                </button>
              </Link>
            </div>
          </div>
        </header>

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

  // Fallback: demo challenge showcase (mock content)
  const demo = MOCK_CHALLENGE;
  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Innovation
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 to-fuchsia-700 p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Innovation Challenge</p>
            <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
              Demo
            </span>
          </div>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">{demo.title}</h1>
          <p className="max-w-2xl text-sm text-white/85">{demo.problemStatement}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href={`/hackathon/apply?challengeId=${id}`}>
              <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                Apply now
              </button>
            </Link>
            <Link href={`/hackathon/resources?challengeId=${id}`}>
              <button className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                Resources
              </button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {demo.prizes.map((p) => (
          <div key={p.place} className="rounded-2xl border border-border bg-white p-5">
            <div className="flex items-center gap-2 text-purple-700">
              <Trophy className="h-4.5 w-4.5" />
              <p className="text-xs font-semibold uppercase tracking-wide">{p.place}</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{p.amount}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoBlock icon={Target} title="Tracks">
          <div className="flex flex-wrap gap-2">
            {demo.tracks.map((t) => (
              <span key={t} className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                {t}
              </span>
            ))}
          </div>
        </InfoBlock>
        <InfoBlock icon={Users} title="Team size">
          <p className="text-sm text-foreground">
            {demo.teamSize.min}–{demo.teamSize.max} members per team
          </p>
        </InfoBlock>
        <InfoBlock icon={BookOpen} title="Eligibility">
          <p className="text-sm text-foreground">{demo.eligibility}</p>
        </InfoBlock>
        <InfoBlock icon={CalendarClock} title="Submission deadline">
          <p className="text-sm font-semibold text-foreground">{formatDate(demo.submissionDeadline)}</p>
        </InfoBlock>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Powered by</h2>
        <div className="flex flex-wrap gap-2">
          {demo.sponsors.map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground">
              <Award className="h-3.5 w-3.5 text-purple-600" /> {s}
            </span>
          ))}
        </div>
      </section>

      <div className="sticky bottom-24 z-10 md:bottom-0">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Ready to build?</p>
              <p className="text-xs text-muted-foreground">
                Submissions close {formatDate(demo.submissionDeadline)}.
              </p>
            </div>
            <Link href={`/hackathon/apply?challengeId=${id}`}>
              <Button>Apply now</Button>
            </Link>
          </div>
        </div>
      </div>
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
