"use client";
import Link from "next/link";
import { useState } from "react";
import { Search, CalendarDays, ArrowRight, FolderOpen } from "lucide-react";
import { useGetChallenges } from "@/api/hackathon/hooks";
import { EventListItem } from "@/types";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { formatDate, initialsFor } from "@/lib/utils";

function mockToListItem(e: (typeof MOCK_EVENTS)[0]): EventListItem {
  return {
    id: e.id,
    title: e.title,
    eventType: e.module,
    format: e.format,
    status: e.status.toUpperCase(),
    date: e.date,
    startTime: e.startTime,
    venue: e.venue || "",
    streamUrl: "",
    organizerName: e.organiser,
    organizerLogo: "",
    maximumCapacity: 0,
    registered: false,
  };
}

export default function HackathonPage() {
  const [q, setQ] = useState("");
  const { data, isLoading, error } = useGetChallenges({ search: q || undefined });
  const apiChallenges = data?.data?.events ?? [];
  const usingMock = !isLoading && (!!error || apiChallenges.length === 0);
  const challenges = usingMock
    ? MOCK_EVENTS.filter((e) => e.module === "HACKATHON")
        .filter((e) => q ? `${e.title} ${e.organiser}`.toLowerCase().includes(q.toLowerCase()) : true)
        .map(mockToListItem)
    : apiChallenges;

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-800 to-fuchsia-900 p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Build the future
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                Innovation Challenges
              </h1>
              {usingMock && (
                <span className="inline-flex items-center rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                  Demo
                </span>
              )}
            </div>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Hackathons, build sprints and open problem statements from
              Nigeria&apos;s top financial institutions.
            </p>
          </div>
          <Link href="/hackathon/my-applications">
            <Button
              variant="outline"
              className="border-white/40 bg-white/10 text-white hover:bg-white/20"
            >
              <FolderOpen className="h-4 w-4" /> My applications
            </Button>
          </Link>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search challenges or organisers"
          className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No challenges available right now.
        </div>
      ) : (
        <ul className="space-y-4">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ChallengeCard({ challenge: c }: { challenge: EventListItem }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
            {c.organizerName}
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-foreground md:text-lg">
            {c.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(c.date)} · {c.startTime}
            </span>
            {c.venue && (
              <span className="text-muted-foreground">{c.venue}</span>
            )}
            <span className="capitalize">{c.format?.toLowerCase()}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link href={`/hackathon/${c.id}`}>
            <Button variant="outline" size="sm">View</Button>
          </Link>
          <Link href={`/hackathon/apply?challengeId=${c.id}`}>
            <Button size="sm">
              Apply <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </li>
  );
}
