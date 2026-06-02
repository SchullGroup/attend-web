"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy, Users, CalendarClock, Target, BookOpen, Award } from "lucide-react";
import { MOCK_CHALLENGE } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // For demo we always show the canonical challenge content
  const challenge = MOCK_CHALLENGE;
  void id;

  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to challenges
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 to-fuchsia-700 p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            Innovation Challenge
          </p>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">
            {challenge.title}
          </h1>
          <p className="max-w-2xl text-sm text-white/85">{challenge.problemStatement}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link href="/hackathon/apply">
              <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                Apply now
              </button>
            </Link>
            <Link href="/hackathon/resources">
              <button className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                Resources
              </button>
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {challenge.prizes.map((p) => (
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
            {challenge.tracks.map((t) => (
              <span key={t} className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                {t}
              </span>
            ))}
          </div>
        </InfoBlock>
        <InfoBlock icon={Users} title="Team size">
          <p className="text-sm text-foreground">
            {challenge.teamSize.min}–{challenge.teamSize.max} members per team
          </p>
        </InfoBlock>
        <InfoBlock icon={BookOpen} title="Eligibility">
          <p className="text-sm text-foreground">{challenge.eligibility}</p>
        </InfoBlock>
        <InfoBlock icon={CalendarClock} title="Submission deadline">
          <p className="text-sm font-semibold text-foreground">
            {formatDate(challenge.submissionDeadline)}
          </p>
        </InfoBlock>
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Powered by
        </h2>
        <div className="flex flex-wrap gap-2">
          {challenge.sponsors.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground"
            >
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
                Submissions close {formatDate(challenge.submissionDeadline)}.
              </p>
            </div>
            <Link href="/hackathon/apply">
              <Button>Apply now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon: Icon, title, children }: { icon: typeof Trophy; title: string; children: React.ReactNode }) {
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
