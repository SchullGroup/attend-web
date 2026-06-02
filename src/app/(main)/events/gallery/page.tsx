"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { initialsFor } from "@/lib/utils";

const GALLERY_TAGS = ["Stage", "Audience", "Backstage", "Networking", "Press"];

const PALETTE = [
  "#1d4ed8", "#9333ea", "#0891b2", "#1a6b3c", "#f97316", "#dc2626", "#6366f1", "#0ea5e9",
];

export default function GalleryPage() {
  const tiles = MOCK_EVENTS.flatMap((e, idx) =>
    Array.from({ length: 4 }).map((_, k) => ({
      id: `${e.id}-${k}`,
      color: PALETTE[(idx * 4 + k) % PALETTE.length],
      organiser: e.organiser,
      tag: GALLERY_TAGS[(idx + k) % GALLERY_TAGS.length],
    })),
  );

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Photo gallery</h1>
        <p className="text-sm text-muted-foreground">
          Highlights from recent launches, AGMs and conferences.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.id}
            className="group relative aspect-square overflow-hidden rounded-2xl"
            style={{ background: t.color }}
          >
            <div className="absolute -right-6 -bottom-8 select-none text-[80px] font-black leading-none text-white/15">
              {initialsFor(t.organiser)}
            </div>
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-white">
              <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                {t.tag}
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 backdrop-blur">
                HD
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
