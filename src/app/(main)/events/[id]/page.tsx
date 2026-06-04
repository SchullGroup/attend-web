"use client";
import { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Bookmark,
  Share2,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { ModuleBadge } from "@/components/attend/ModuleBadge";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate, initialsFor } from "@/lib/utils";

type Tab = "about" | "agenda" | "speakers";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const event = MOCK_EVENTS.find((e) => e.id === id);
  const [tab, setTab] = useState<Tab>("about");
  const [rsvp, setRsvp] = useState(event?.rsvpStatus === "confirmed");

  if (!event) return notFound();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <header
        className="relative overflow-hidden rounded-3xl p-6 text-white md:p-8"
        style={{ background: event.thumbnailColor }}
      >
        <div className="absolute -right-10 -bottom-12 select-none text-[180px] font-black leading-none text-white/10">
          {initialsFor(event.organiser)}
        </div>
        <div className="relative space-y-4">
          <ModuleBadge module={event.module} solid />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              {event.organiser}
            </p>
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">
              {event.title}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={CalendarDays}>{formatDate(event.date)}</Chip>
            <Chip icon={Clock}>
              {event.startTime} – {event.endTime}
            </Chip>
            <Chip icon={Users}>
              {event.rsvpCount.toLocaleString()} attending
            </Chip>
            {event.venue && <Chip icon={MapPin}>{event.venue}</Chip>}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {rsvp ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold backdrop-blur">
                <CheckCircle2 className="h-4 w-4" /> You&apos;re confirmed
              </span>
            ) : (
              <button
                onClick={() => setRsvp(true)}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/90"
                style={{ color: event.thumbnailColor }}
              >
                RSVP now
              </button>
            )}
            <Link href="/events/qr-checkin">
              <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                <QrCode className="h-4 w-4" /> QR check-in
              </button>
            </Link>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur hover:bg-white/20">
              <Bookmark className="h-4 w-4" />
            </button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur hover:bg-white/20">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex gap-1 border-b border-border">
        {(["about", "agenda", "speakers"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "relative px-4 py-3 text-sm font-medium capitalize",
              tab === t
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
            {tab === t && (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>

      {tab === "about" && (
        <section className="space-y-4">
          <p className="text-sm leading-relaxed text-foreground/80">
            {event.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((t) => (
              <Badge key={t} variant="muted">
                {t}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {tab === "agenda" && (
        <section>
          <ol className="space-y-2 border-l border-border pl-4">
            {event.agenda.map((a, i) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-white" />
                <div className="rounded-xl border border-border bg-white p-3">
                  <p className="text-xs text-muted-foreground">
                    {a.startTime} · {a.duration} min
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {a.title}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {tab === "speakers" && (
        <section className="grid gap-3 sm:grid-cols-2">
          {event.speakers.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initialsFor(s.name)}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {s.name}
                </p>
                <p className="text-xs text-muted-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.company}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

function Chip({
  icon: Icon,
  children,
}: {
  icon: typeof CalendarDays;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur">
      <Icon className="h-3.5 w-3.5" /> {children}
    </span>
  );
}
