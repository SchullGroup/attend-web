"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Image as ImageIcon, Archive } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { EventCard } from "@/components/attend/EventCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const FORMATS = ["All", "Virtual", "Hybrid", "In-Person"] as const;
type Format = (typeof FORMATS)[number];

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [fmt, setFmt] = useState<Format>("All");

  const visible = useMemo(() => {
    return MOCK_EVENTS.filter((e) => e.module === "LAUNCH" || e.module === "GENERAL")
      .filter((e) => (fmt === "All" ? true : e.format.toLowerCase() === fmt.toLowerCase()))
      .filter((e) =>
        query.trim()
          ? `${e.title} ${e.organiser}`.toLowerCase().includes(query.toLowerCase())
          : true,
      );
  }, [query, fmt]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Launches & Events</h1>
          <p className="text-sm text-muted-foreground">
            Product reveals, conferences and roundtables.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/events/gallery">
            <Button variant="outline" size="sm">
              <ImageIcon className="h-4 w-4" /> Gallery
            </Button>
          </Link>
          <Link href="/events/archive">
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4" /> Archive
            </Button>
          </Link>
        </div>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or organiser"
            className="h-11 w-full rounded-xl border border-input bg-white pl-10 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setFmt(f)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                fmt === f
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-muted-foreground hover:bg-muted",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No events match those filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
