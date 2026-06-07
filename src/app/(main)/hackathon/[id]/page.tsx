"use client";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";
import { useGetEvent } from "@/api/events/hooks";
import { useGetMyTeam } from "@/api/hackathon/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function HackathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error } = useGetEvent(id);
  const { data: teamData } = useGetMyTeam(id);

  const event = data?.data;
  const myTeam = teamData?.data;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-24 animate-pulse rounded-lg bg-muted" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Could not load challenge details.</p>
        <Link href="/hackathon">
          <Button variant="outline" size="sm">Back to challenges</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/hackathon"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to challenges
      </Link>

      <header className="relative overflow-hidden rounded-3xl bg-linear-to-br from-purple-700 to-fuchsia-700 p-6 text-white md:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
            {event.organizerName}
          </p>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">{event.title}</h1>
          {event.description && (
            <p className="max-w-2xl text-sm text-white/85">{event.description}</p>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {myTeam ? (
              <Link href={`/hackathon/submit?challengeId=${id}&teamId=${myTeam.id}`}>
                <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                  Submit project
                </button>
              </Link>
            ) : (
              <Link href={`/hackathon/apply?challengeId=${id}`}>
                <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-purple-700 hover:bg-white/90">
                  Apply now
                </button>
              </Link>
            )}
            <Link href="/hackathon/resources">
              <button className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20">
                Resources
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Team status */}
      {myTeam && (
        <section className="rounded-2xl border border-purple-200 bg-purple-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-purple-700 mb-2">
            Your team
          </p>
          <p className="text-base font-semibold text-foreground">{myTeam.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{myTeam.description}</p>
          <div className="mt-3 flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {myTeam.members.length + 1} member{myTeam.members.length !== 0 ? "s" : ""}
            </span>
            {myTeam.submission && (
              <Badge variant="success">Submitted</Badge>
            )}
          </div>
        </section>
      )}

      {/* Event info */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Event details
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              {formatDate(event.date)} · {event.startTime}
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {event.venue}
              </div>
            )}
            <div className="capitalize">{event.format?.toLowerCase()}</div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Organiser
          </p>
          <p className="text-sm font-semibold text-foreground">{event.organizerName}</p>
          {event.maximumCapacity > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Capacity: {event.maximumCapacity.toLocaleString()}
            </p>
          )}
        </div>
      </section>

      <div className="sticky bottom-24 z-10 md:bottom-0">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                {myTeam ? `Team: ${myTeam.name}` : "Ready to build?"}
              </p>
              <p className="text-xs text-muted-foreground">
                {event.date && `Starts ${formatDate(event.date)}`}
              </p>
            </div>
            {myTeam ? (
              <Link href={`/hackathon/submit?challengeId=${id}&teamId=${myTeam.id}`}>
                <Button>Submit project</Button>
              </Link>
            ) : (
              <Link href={`/hackathon/apply?challengeId=${id}`}>
                <Button>Apply now</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
