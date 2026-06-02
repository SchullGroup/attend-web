"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { EventCard } from "@/components/attend/EventCard";

export default function SavedEventsPage() {
  // pretend saved: pick non-confirmed events
  const saved = MOCK_EVENTS.filter((e) => e.rsvpStatus !== "confirmed").slice(0, 4);

  return (
    <div className="space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Saved events</h1>
        <p className="text-sm text-muted-foreground">
          Events you&apos;ve bookmarked for later.
        </p>
      </header>

      {saved.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          Nothing saved yet — tap the bookmark on any event to save it here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {saved.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
