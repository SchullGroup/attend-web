"use client";
import Link from "next/link";
import { ShieldAlert, Building2, CalendarDays, MapPin, Users, ShieldCheck, XCircle, ArrowRight } from "lucide-react";
import { useUserStore } from "@/lib/user-store";
import { MOCK_EVENTS } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate, initialsFor } from "@/lib/utils";

export default function AgmPage() {
  const { kycStatus } = useUserStore();
  const isVerified = kycStatus === "full";
  const agms = MOCK_EVENTS.filter((e) => e.module === "AGM");
  const upcoming = agms.filter((e) => e.status !== "ended" && e.status !== "cancelled");
  const past = agms.filter((e) => e.status === "ended");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Annual General Meetings</h1>
          <p className="text-sm text-muted-foreground">
            All upcoming AGMs on the Attend platform.
          </p>
        </div>
        {isVerified && (
          <div className="flex gap-2">
            <Link href="/agm/receipt">
              <Button variant="outline" size="sm">My receipts</Button>
            </Link>
          </div>
        )}
      </header>

      {/* KYC prompt banner — shown when not verified */}
      {!isVerified && (
        <div className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Verification required to register or vote</p>
            <p className="mt-0.5 text-xs text-amber-700">You can browse all AGMs, but completing KYC (BVN, NIN, CHN) is required to register for meetings and cast votes.</p>
          </div>
          <Link href="/intro">
            <Button size="sm" className="shrink-0">
              Complete KYC <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Upcoming AGMs */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Upcoming</h2>
          <ul className="space-y-4">
            {upcoming.map((e) => (
              <AgmCard key={e.id} event={e} isVerified={isVerified} />
            ))}
          </ul>
        </section>
      )}

      {/* Past AGMs */}
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Past</h2>
          <ul className="space-y-4">
            {past.map((e) => (
              <AgmCard key={e.id} event={e} isVerified={isVerified} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function AgmCard({ event: e, isVerified }: { event: typeof MOCK_EVENTS[0]; isVerified: boolean }) {
  const onRegister = (e as any).onRegister ?? false;

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-start">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
          style={{ background: e.thumbnailColor }}
        >
          {initialsFor(e.organiser)}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{e.organiser}</p>
              <h2 className="text-base font-semibold leading-snug text-foreground md:text-lg">{e.title}</h2>
            </div>
            {e.rsvpStatus === "confirmed" ? (
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
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> {e.rsvpCount.toLocaleString()} attending
            </span>
          </div>

          {/* Three states */}
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
          ) : onRegister ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/agm/proxy">
                <Button variant="outline" size="sm">Appoint proxy</Button>
              </Link>
              <Link href="/agm/pre-vote">
                <Button variant="outline" size="sm">Pre-vote</Button>
              </Link>
              <Link href="/agm/live">
                <Button size="sm">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Enter meeting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 pt-1">
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Not on the shareholder register</p>
                  <p className="text-xs text-red-600/80">Your CHN is not on this company's register. You can view event details but cannot vote or register.</p>
                </div>
              </div>
              <Link href={`/events/${e.id}`}>
                <Button variant="outline" size="sm">View event details</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
