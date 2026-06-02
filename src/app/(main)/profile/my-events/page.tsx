"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatDate, initialsFor } from "@/lib/utils";

export default function MyEventsPage() {
  const events = MOCK_EVENTS.filter((e) => e.rsvpStatus === "confirmed");

  return (
    <div className="space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">My events</h1>
        <p className="text-sm text-muted-foreground">
          Events you&apos;ve RSVP&apos;d to or attended.
        </p>
      </header>

      {events.length === 0 ? (
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
