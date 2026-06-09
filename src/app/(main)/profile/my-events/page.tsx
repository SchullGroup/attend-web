"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useGetMyEvents } from "@/api/events/hooks";
import { EventListItem } from "@/types";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatDate, initialsFor } from "@/lib/utils";

const EVENT_COLOR: Record<string, string> = {
  AGM: "#1a6b3c",
  PRODUCT_LAUNCH: "#f97316",
  LAUNCH: "#f97316",
  HACKATHON: "#9333ea",
  INNOVATION_CHALLENGE: "#9333ea",
  GENERAL_EVENT: "#2563eb",
  GENERAL: "#2563eb",
};

interface MyEventRow {
  id: string;
  organiser: string;
  title: string;
  date: string;
  format: string;
  thumbnailColor: string;
}

const fmtFormat = (f: string) => (f || "").toLowerCase().replace(/_/g, "-");

export default function MyEventsPage() {
  const { data, isLoading, error } = useGetMyEvents();
  const apiEvents = data?.data?.events ?? [];
  const usingMock = !isLoading && (!!error || apiEvents.length === 0);

  const events: MyEventRow[] = usingMock
    ? MOCK_EVENTS.filter((e) => e.rsvpStatus === "confirmed").map((e) => ({
        id: e.id,
        organiser: e.organiser,
        title: e.title,
        date: e.date,
        format: e.format,
        thumbnailColor: e.thumbnailColor,
      }))
    : apiEvents.map((e: EventListItem) => ({
        id: e.id,
        organiser: e.organizerName,
        title: e.title,
        date: e.date,
        format: fmtFormat(e.format),
        thumbnailColor: EVENT_COLOR[e.eventType?.toUpperCase()] ?? "#2563eb",
      }));

  return (
    <div className="space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My events</h1>
          <p className="text-sm text-muted-foreground">
            Events you&apos;ve RSVP&apos;d to or attended.
          </p>
        </div>
        {usingMock && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Demo data
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t RSVP&apos;d to anything yet. Browse events to get started.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-white">
          {events.map((e, i) => (
            <li key={e.id} className={i > 0 ? "border-t border-border" : ""}>
              <Link
                href={`/events/${e.id}`}
                className="flex items-center gap-3 p-4 hover:bg-muted/30"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ background: e.thumbnailColor }}
                >
                  {initialsFor(e.organiser)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(e.date)} · {e.format}
                  </p>
                </div>
                <Badge variant="success">Confirmed</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
