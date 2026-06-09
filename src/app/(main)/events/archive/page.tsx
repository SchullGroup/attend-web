"use client";
import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatDate, initialsFor } from "@/lib/utils";

const ARCHIVE = MOCK_EVENTS.map((e, i) => ({
  ...e,
  endedDate: `2025-${String(((i % 12) + 1)).padStart(2, "0")}-15`,
  duration: 90 + i * 12,
  views: 4200 + i * 1100,
}));

export default function ArchivePage() {
  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Event archive</h1>
        <p className="text-sm text-muted-foreground">
          Catch up on past events with full recordings and presentation decks.
        </p>
      </header>

      <ul className="space-y-3">
        {ARCHIVE.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-4 md:flex-row md:items-center md:gap-5"
          >
            <div
              className="relative flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-bold text-white md:w-40"
              style={{ background: e.thumbnailColor }}
            >
              {initialsFor(e.organiser)}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="h-9 w-9 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {e.organiser}
                  </p>
                  <h2 className="text-sm font-semibold text-foreground md:text-base">
                    {e.title}
                  </h2>
                </div>
                <Badge variant="muted">{e.module}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ended {formatDate(e.endedDate)} · {e.duration} min · {e.views.toLocaleString()} views
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
