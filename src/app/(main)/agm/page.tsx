"use client";
import Link from "next/link";
import { ShieldAlert, Building2, CalendarDays, MapPin, Users } from "lucide-react";
import { useUserStore } from "@/lib/user-store";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, initialsFor } from "@/lib/utils";

export default function AgmPage() {
  const { kycStatus } = useUserStore();
  const agms = MOCK_EVENTS.filter((e) => e.module === "AGM");

  if (kycStatus !== "full") {
    return (
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <ShieldAlert className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Verification required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AGM voting and proxy submissions are restricted to verified shareholders.
            Complete a one-time identity check to unlock this module.
          </p>
          <Link href="/intro" className="mt-5 inline-block">
            <Button size="lg">Complete verification</Button>
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Takes about 2 minutes · BVN, NIN and CHN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Annual General Meetings</h1>
          <p className="text-sm text-muted-foreground">
            Cast your votes, appoint a proxy, or attend live.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/agm/receipt">
            <Button variant="outline" size="sm">My receipts</Button>
          </Link>
        </div>
      </header>

      <ul className="space-y-4">
        {agms.map((e) => (
          <li
            key={e.id}
            className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
              <div
                className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                style={{ background: e.thumbnailColor }}
              >
                {initialsFor(e.organiser)}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {e.organiser}
                    </p>
                    <h2 className="text-base font-semibold leading-snug text-foreground md:text-lg">
                      {e.title}
                    </h2>
                  </div>
                  {e.rsvpStatus === "confirmed" ? (
                    <Badge variant="success">Confirmed</Badge>
                  ) : (
                    <Badge variant="muted">{e.format}</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(e.date)} · {e.startTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {e.format}
                  </span>
                  {e.venue && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {e.venue}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" /> {e.rsvpCount.toLocaleString()} attending
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Link href="/agm/proxy">
                    <Button variant="outline" size="sm">Appoint proxy</Button>
                  </Link>
                  <Link href="/agm/pre-vote">
                    <Button variant="outline" size="sm">Pre-vote</Button>
                  </Link>
                  <Link href="/agm/live">
                    <Button size="sm">Enter meeting</Button>
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
