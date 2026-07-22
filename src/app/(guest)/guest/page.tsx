"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, KeyRound, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useGuestBrowseEvents, useGuestJoin } from "@/api/events/hooks";
import { storeGuestSession, resolveGuestLiveHref, readJoinResult } from "@/lib/guest-session";
import type { GuestEventListItem } from "@/types";

// Guest access is scoped to a single event, so there's no such thing as a guest "login".
// A bare code can't be resolved on its own either — the backend has no code→event lookup
// (invite links carry ?eventId=&code=). So the entry point is: browse the public event
// list, pick your event, then enter the code the organiser gave you.
export default function GuestBrowsePage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GuestEventListItem | null>(null);

  const { data, isLoading, isError } = useGuestBrowseEvents({
    search: query || undefined,
    size: 20,
  });
  const events = data?.data?.events ?? [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 space-y-6">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Join as a guest</h1>
        <p className="text-sm text-muted-foreground">
          Find the event you were invited to, then enter the access code from your invitation.
          Guests can watch and follow along without an account.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(search.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-xl border border-border bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
            placeholder="Search events by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-white" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Couldn&apos;t load events right now. Please try again.
        </div>
      )}

      {!isLoading && !isError && events.length === 0 && (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <p className="text-sm font-medium text-foreground">No events found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {query
              ? "Try a different search term."
              : "There are no events open to guests at the moment."}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {events.map((ev) => (
          <EventRow
            key={ev.id}
            event={ev}
            expanded={selected?.id === ev.id}
            onToggle={() => setSelected(selected?.id === ev.id ? null : ev)}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function EventRow({
  event,
  expanded,
  onToggle,
}: {
  event: GuestEventListItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: guestJoin, isPending } = useGuestJoin(event.id);

  const brand = event.branding?.brandColor || "#0B5CFF";

  function join() {
    setError(null);
    guestJoin(
      { code: code.trim() },
      {
        onSuccess: async (res: any) => {
          const { token, eventType } = readJoinResult(res);
          if (!token) {
            setError("Joined, but no guest session was returned. Please try again.");
            return;
          }
          storeGuestSession(token, event.id);
          router.push(await resolveGuestLiveHref(event.id, token, eventType));
        },
        onError: (err: any) =>
          setError(
            err?.response?.data?.message || err?.message || "Invalid or expired access code.",
          ),
      },
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-white transition-colors",
        expanded ? "border-primary" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: brand }}
        >
          {event.title.trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{event.title.trim()}</p>
          <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {event.date}
            </span>
            {event.startTime && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> {event.startTime}
              </span>
            )}
          </p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-primary">
          {expanded ? "Close" : "Enter code"}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-border bg-muted/20 p-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <p className="text-xs text-muted-foreground">
              Enter the access code provided by the event organiser.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <input
              autoFocus
              className="flex-1 rounded-xl border border-border bg-white px-4 py-2.5 text-sm tracking-widest outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="e.g. 7F3KQXPM"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter" && code.trim().length >= 3 && !isPending) join();
              }}
              maxLength={12}
            />
            <Button disabled={code.trim().length < 3 || isPending} loading={isPending} onClick={join}>
              Join
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
