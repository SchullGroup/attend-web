"use client";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  CalendarDays,
  MapPin,
  Users,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useUserStore } from "@/lib/user-store";
import { useGetEvents } from "@/api/events/hooks";
import { useRsvp } from "@/api/events/hooks";
import { EventListItem } from "@/types";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
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

function mockToListItem(e: (typeof MOCK_EVENTS)[0]): EventListItem {
  return {
    id: e.id,
    title: e.title,
    eventType: e.module,
    format: e.format,
    status: e.status.toUpperCase(),
    date: e.date,
    startTime: e.startTime,
    venue: e.venue || "",
    streamUrl: "",
    organizerName: e.organiser,
    organizerLogo: "",
    maximumCapacity: e.capacity || 0,
    registered: e.rsvpStatus === "confirmed",
  };
}

export default function AgmPage() {
  const { kycStatus } = useUserStore();
  const isVerified = kycStatus === "full";

  const { data, isLoading, error } = useGetEvents({ eventType: "AGM", size: 50 });
  const apiAgms = data?.data?.events ?? [];
  const usingMock = !isLoading && (!!error || apiAgms.length === 0);
  const allAgms = usingMock
    ? MOCK_EVENTS.filter((e) => e.module === "AGM").map(mockToListItem)
    : apiAgms;
  const upcoming = allAgms.filter((e) => e.status !== "ENDED" && e.status !== "CANCELLED" && e.status !== "ended" && e.status !== "cancelled");
  const past = allAgms.filter((e) => e.status === "ENDED" || e.status === "ended");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">
              Annual General Meetings
            </h1>
            {usingMock && (
              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                Demo
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            All upcoming AGMs on the Attend platform.
          </p>
        </div>
        {isVerified && (
          <Link href="/agm/receipt">
            <Button variant="outline" size="sm">My receipts</Button>
          </Link>
        )}
      </header>

      {!isVerified && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Verification required to register or vote
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              You can browse all AGMs, but completing KYC (BVN, NIN, CHN) is
              required to register for meetings and cast votes.
            </p>
          </div>
          <Link href="/intro">
            <Button size="sm" className="shrink-0">
              Complete KYC <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Upcoming
              </h2>
              <ul className="space-y-4">
                {upcoming.map((e) => (
                  <AgmCard key={e.id} event={e} isVerified={isVerified} />
                ))}
              </ul>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Past
              </h2>
              <ul className="space-y-4">
                {past.map((e) => (
                  <AgmCard key={e.id} event={e} isVerified={isVerified} />
                ))}
              </ul>
            </section>
          )}

          {allAgms.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No AGMs available at this time.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AgmCard({ event: e, isVerified }: { event: EventListItem; isVerified: boolean }) {
  const { mutate: rsvp, isPending } = useRsvp(e.id);
  const bgColor = EVENT_COLOR[e.eventType?.toUpperCase()] ?? "#1a6b3c";

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ background: bgColor }}
        >
          {initialsFor(e.organizerName)}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {e.organizerName}
              </p>
              <h2 className="text-base font-semibold leading-snug text-foreground md:text-lg">
                {e.title}
              </h2>
            </div>
            {e.registered ? (
              <Badge variant="success">Confirmed</Badge>
            ) : (
              <Badge variant="muted">{e.format}</Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {formatDate(e.date)} · {e.startTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> {e.format}
            </span>
            {e.venue && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {e.venue}
              </span>
            )}
            {e.maximumCapacity > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> {e.maximumCapacity.toLocaleString()} capacity
              </span>
            )}
          </div>

          {!isVerified ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link href={`/events/${e.id}`}>
                <Button variant="outline" size="sm">View details</Button>
              </Link>
              <Link href="/intro">
                <Button size="sm">
                  <ShieldAlert className="mr-1.5 h-3.5 w-3.5" /> Complete KYC to register
                </Button>
              </Link>
            </div>
          ) : e.registered ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={`/agm/proxy?eventId=${e.id}`}>
                <Button variant="outline" size="sm">Appoint proxy</Button>
              </Link>
              <Link href={`/agm/pre-vote?eventId=${e.id}`}>
                <Button variant="outline" size="sm">Pre-vote</Button>
              </Link>
              <Link href={`/agm/live?eventId=${e.id}`}>
                <Button size="sm">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Enter meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href={`/events/${e.id}`}>
                <Button variant="outline" size="sm">View details</Button>
              </Link>
              <Button size="sm" loading={isPending} onClick={() => rsvp()}>
                Register for AGM
              </Button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
