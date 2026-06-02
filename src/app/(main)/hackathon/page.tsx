"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Trophy, CalendarDays, Users, ArrowRight, FolderOpen } from "lucide-react";
import { MOCK_EVENTS, MOCK_CHALLENGE } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const CHALLENGES = [
  {
    id: "chl_001",
    eventId: "evt_005",
    title: MOCK_CHALLENGE.title,
    organiser: "Meristem Innovation Hub",
    deadline: MOCK_CHALLENGE.submissionDeadline,
    prize: "₦5,000,000",
    teamMembers: "2–5",
    tracks: MOCK_CHALLENGE.tracks,
  },
  {
    id: "chl_002",
    eventId: "evt_005",
    title: "NGX Builders Sprint 2026",
    organiser: "NGX Group",
    deadline: "2026-08-30",
    prize: "₦3,000,000",
    teamMembers: "1–4",
    tracks: ["Market Data APIs", "Investor Analytics", "Compliance"],
  },
  {
    id: "chl_003",
    eventId: "evt_005",
    title: "CBN Open Banking Hackathon",
    organiser: "Central Bank of Nigeria",
    deadline: "2026-09-20",
    prize: "₦4,000,000",
    teamMembers: "3–5",
    tracks: ["Open Banking", "Consumer Protection", "FX Innovation"],
  },
];

export default function HackathonPage() {
  const [q, setQ] = useState("");

  const visible = useMemo(
    () =>
      CHALLENGES.filter((c) =>
        q.trim()
          ? `${c.title} ${c.organiser}`.toLowerCase().includes(q.toLowerCase())
          : true,
      ),
    [q],
  );

  // ensure referenced events render
  void MOCK_EVENTS;

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
            <h1 className="mt-1 text-2xl font-bold leading-tight md:text-3xl">
              Innovation Challenges
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Hackathons, build sprints and open problem statements from Nigeria&apos;s
              top financial institutions.
            </p>
          </div>
          <Link href="/hackathon/my-applications">
            <Button variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
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
          placeholder="Search challenges, tracks or sponsors"
          className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
        />
      </div>

      <ul className="space-y-4">
        {visible.map((c) => (
          <li
            key={c.id}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          >
            <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
                  {c.organiser}
                </p>
                <h2 className="mt-0.5 text-base font-semibold text-foreground md:text-lg">
                  {c.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.tracks.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-medium text-purple-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" /> Prize: {c.prize}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Deadline: {formatDate(c.deadline)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> Team: {c.teamMembers}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link href={`/hackathon/${c.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
                <Link href="/hackathon/apply">
                  <Button size="sm">
                    Apply <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
