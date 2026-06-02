"use client";
import Link from "next/link";
import {
  Building2,
  Rocket,
  Lightbulb,
  CalendarDays,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Radio,
} from "lucide-react";
import { MOCK_USER, MOCK_EVENTS } from "@/lib/mock-data";
import { useUserStore } from "@/lib/user-store";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate, greetingByHour, initialsFor } from "@/lib/utils";

const TILES = [
  {
    label: "AGM",
    description: "Vote at shareholder meetings",
    href: "/agm",
    icon: Building2,
    gradient: "from-blue-600 to-blue-800",
  },
  {
    label: "Launches",
    description: "Product reveals & launches",
    href: "/events",
    icon: Rocket,
    gradient: "from-orange-500 to-rose-500",
  },
  {
    label: "Innovation",
    description: "Hackathons & challenges",
    href: "/hackathon",
    icon: Lightbulb,
    gradient: "from-purple-600 to-fuchsia-600",
  },
  {
    label: "General",
    description: "Roundtables & conferences",
    href: "/events",
    icon: CalendarDays,
    gradient: "from-teal-500 to-cyan-600",
  },
];

const ANNOUNCEMENTS = [
  {
    title: "Vote opens for Zenith Bank AGM",
    body: "Resolutions 1–4 will be available for voting from 10:00am on May 28.",
    tag: "AGM",
  },
  {
    title: "MeriHack 2026 applications closing",
    body: "Get your team submission in before July 18 to qualify for the ₦5m grand prize.",
    tag: "Innovation",
  },
  {
    title: "MeriSave Launch — set a reminder",
    body: "The MeriSave digital savings product launches virtually on June 15.",
    tag: "Launch",
  },
];

export default function HomePage() {
  const { kycStatus } = useUserStore();
  const verified = kycStatus === "full";

  const liveEvent = MOCK_EVENTS.find((e) => e.status === "live");
  const upcoming = MOCK_EVENTS.filter((e) => e.status === "upcoming").slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero / user card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur">
              {initialsFor(MOCK_USER.fullName)}
            </div>
            <div>
              <p className="text-sm text-white/80">
                {greetingByHour()},
              </p>
              <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                {MOCK_USER.fullName.split(" ")[0]}
              </h1>
              <p className="mt-0.5 text-xs text-white/70">
                Member since {formatDate(MOCK_USER.createdAt)} · Shareholder
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            {verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5" /> KYC verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1.5 text-xs font-semibold text-amber-100 backdrop-blur">
                <AlertCircle className="h-3.5 w-3.5" /> KYC pending
              </span>
            )}
          </div>
        </div>

        {!verified && (
          <Link
            href="/intro"
            className="relative mt-5 flex items-center justify-between rounded-2xl border border-amber-300/50 bg-amber-400/20 px-4 py-3 text-sm font-medium backdrop-blur transition-colors hover:bg-amber-400/30"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Complete verification to vote in AGMs
            </span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </section>

      {/* Live banner */}
      {liveEvent && (
        <Link
          href={`/agm/live`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          <span className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
            <Radio className="h-4 w-4" /> Live now — {liveEvent.title}
          </span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}

      {/* Module tiles */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Explore
        </h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {TILES.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.label}
                href={t.href}
                className={cn(
                  "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  t.gradient,
                )}
              >
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                <div className="relative flex h-full flex-col">
                  <Icon className="h-6 w-6" />
                  <div className="mt-6">
                    <p className="text-lg font-bold">{t.label}</p>
                    <p className="text-xs text-white/80">{t.description}</p>
                  </div>
                  <ChevronRight className="absolute bottom-0 right-0 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Announcements */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Announcements
          </h2>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
          {ANNOUNCEMENTS.map((a, i) => (
            <article
              key={i}
              className="min-w-[260px] max-w-xs rounded-2xl border border-border bg-white p-4 shadow-sm"
            >
              <Badge variant="default">{a.tag}</Badge>
              <h3 className="mt-3 text-sm font-semibold leading-snug text-foreground">
                {a.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{a.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Upcoming events
          </h2>
          <Link href="/events" className="text-xs font-semibold text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {upcoming.map((e) => (
            <Link
              key={e.id}
              href={`/events/${e.id}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3 transition-colors hover:bg-muted/40"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ background: e.thumbnailColor }}
              >
                {initialsFor(e.organiser)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {e.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(e.date)} · {e.format} · {e.startTime}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
