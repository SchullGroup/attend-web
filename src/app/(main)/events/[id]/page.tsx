"use client";
import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Check,
} from "lucide-react";
import { useGetEvent, useRsvp, useCancelRsvp } from "@/api/events/hooks";
import { ModuleBadge } from "@/components/attend/ModuleBadge";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn, formatDate, initialsFor } from "@/lib/utils";

const SAVED_KEY = "attend_saved_events";

const EVENT_TYPE_LABELS: Record<string, string> = {
  PRODUCT_LAUNCH: "Launch",
  GENERAL_EVENT: "General",
  AGM: "AGM",
  HACKATHON: "Hackathon",
  INNOVATION_CHALLENGE: "Innovation Challenge",
};
const FORMAT_LABELS: Record<string, string> = {
  IN_PERSON: "In-Person",
  VIRTUAL: "Virtual",
  HYBRID: "Hybrid",
};
const fmtType = (t: string) => EVENT_TYPE_LABELS[t] ?? t;
const fmtFormat = (f: string) => FORMAT_LABELS[f] ?? f;

function getSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading, error } = useGetEvent(id);
  const event = data?.data;

  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const { mutate: rsvp, isPending: rsvping } = useRsvp(id);
  const { mutate: cancelRsvp, isPending: cancelling } = useCancelRsvp(id);

  const bgColor = event?.organizerPrimaryColor || "#2563eb";

  useEffect(() => {
    setSaved(getSaved().includes(id));
  }, [id]);

  function toggleSave() {
    const list = getSaved();
    const next = saved ? list.filter((x) => x !== id) : [...list, id];
    localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    setSaved(!saved);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: event?.title ?? "Event", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  }

  function handleRsvp() {
    setRsvpError(null);
    rsvp(undefined, {
      onError: (err: any) =>
        setRsvpError(
          err?.response?.data?.message || err?.message || "RSVP failed. Please try again.",
        ),
    });
  }

  function handleCancelRsvp() {
    setRsvpError(null);
    cancelRsvp(undefined, {
      onError: (err: any) =>
        setRsvpError(
          err?.response?.data?.message || err?.message || "Could not cancel RSVP.",
        ),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Could not load event details.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

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
        style={{ background: bgColor }}
      >
        <div className="absolute -right-10 -bottom-12 select-none text-[180px] font-black leading-none text-white/10">
          {initialsFor(event.organizerName)}
        </div>
        <div className="relative space-y-4">
          <ModuleBadge module={event.eventType} solid />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
              {event.organizerName}
            </p>
            <h1 className="text-2xl font-bold leading-tight md:text-3xl">{event.title}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip icon={CalendarDays}>{formatDate(event.date)}</Chip>
            {event.startTime && <Chip icon={Clock}>{event.startTime}</Chip>}
            {event.registeredCount > 0 && (
              <Chip icon={Users}>{event.registeredCount.toLocaleString()} attending</Chip>
            )}
            {event.venue && <Chip icon={MapPin}>{event.venue}</Chip>}
          </div>

          {rsvpError && (
            <div className="rounded-xl border border-red-300/50 bg-red-500/20 px-4 py-2.5 text-sm font-medium text-white">
              {rsvpError}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {event.registered ? (
              <button
                onClick={handleCancelRsvp}
                disabled={cancelling}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/30 disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {cancelling ? "Cancelling…" : "You're confirmed"}
              </button>
            ) : (
              <button
                onClick={handleRsvp}
                disabled={rsvping}
                className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold hover:bg-white/90 disabled:opacity-60"
                style={{ color: bgColor }}
              >
                {rsvping ? "Saving…" : "RSVP now"}
              </button>
            )}
            <Link href={`/events/qr-checkin?eventId=${id}`}>
              <button className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                <QrCode className="h-4 w-4" /> QR check-in
              </button>
            </Link>
            <button
              onClick={toggleSave}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
              title={saved ? "Remove from saved" : "Save event"}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-white")} />
            </button>
            <button
              onClick={handleShare}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"
              title={shared ? "Link copied!" : "Share event"}
            >
              {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        {event.description && (
          <p className="text-sm leading-relaxed text-foreground/80">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge variant="muted">{fmtType(event.eventType)}</Badge>
          <Badge variant="muted">{fmtFormat(event.format)}</Badge>
          {event.agmProxyEnabled && <Badge variant="default">Proxy voting enabled</Badge>}
        </div>
      </section>
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
