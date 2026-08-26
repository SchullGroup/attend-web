"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, KeyRound, Calendar, Clock, AlertCircle, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useGuestBrowseEvents, useGuestJoin } from "@/api/events/hooks";
import { storeGuestSession, resolveGuestLiveHref, readJoinResult } from "@/lib/guest-session";
import { eventTypeLabel, guessEventTypeFromTitle } from "@/lib/event-type";
import type { GuestEventListItem } from "@/types";

type EventCategoryTab = "AGM" | "GENERAL" | "LAUNCH" | "ALL";

const TABS: { id: EventCategoryTab; label: string; icon?: string }[] = [
  { id: "AGM", label: "AGMs" },
  { id: "GENERAL", label: "General" },
  { id: "LAUNCH", label: "Launches" },
  { id: "ALL", label: "All Events" },
];

function GuestBrowseContent() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get("expired") === "true";
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<EventCategoryTab>("AGM");
  const [selected, setSelected] = useState<GuestEventListItem | null>(null);

  const { data, isLoading, isError } = useGuestBrowseEvents({
    search: query || undefined,
    eventType: activeTab !== "ALL" ? activeTab : undefined,
    size: 50,
  });

  const rawEvents = data?.data?.events ?? [];

  // Filter events client-side to ensure fallback compatibility if the backend returns all items
  const events = rawEvents.filter((ev) => {
    if (activeTab === "ALL") return true;

    // Check explicit eventType if provided by backend
    if (ev.eventType) {
      const type = ev.eventType.toUpperCase();
      if (activeTab === "AGM" && (type === "AGM" || type.includes("AGM"))) return true;
      if (activeTab === "GENERAL" && (type === "GENERAL" || type.includes("GENERAL"))) return true;
      if (activeTab === "LAUNCH" && (type === "LAUNCH" || type.includes("LAUNCH") || type.includes("PRODUCT"))) return true;
    }

    // Fallback: title-based heuristic detection
    const titleUpper = ev.title.toUpperCase();
    if (activeTab === "AGM") {
      return titleUpper.includes("AGM") || titleUpper.includes("ANNUAL") || titleUpper.includes("GENERAL MEETING") || titleUpper.includes("SHAREHOLDER");
    }
    if (activeTab === "LAUNCH") {
      return titleUpper.includes("LAUNCH") || titleUpper.includes("RELEASE") || titleUpper.includes("PRODUCT");
    }
    if (activeTab === "GENERAL") {
      return !titleUpper.includes("AGM") && !titleUpper.includes("ANNUAL") && !titleUpper.includes("LAUNCH");
    }

    return true;
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
        <p className="text-xs text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {isExpired && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-amber-950">Your guest session has expired</p>
            <p className="mt-0.5 text-amber-800">
              For security, guest sessions automatically expire after a period of time. Please find your event below and enter your invitation access code to rejoin.
            </p>
          </div>
        </div>
      )}

      {/* Main Banner Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Join an Event as Guest
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Browse upcoming and live events. Select your event and enter your invitation access code to join without an account.
        </p>
      </header>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-border pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelected(null);
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search.trim());
          }}
          className="flex gap-2 w-full sm:w-72"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Loading Skeleton Grid */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-border bg-white p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-10 w-10 rounded-xl bg-muted" />
                <div className="h-6 w-16 rounded-full bg-muted" />
              </div>
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-9 w-full rounded-xl bg-muted mt-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 text-center">
          Couldn&apos;t load events right now. Please check your connection and try again.
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && events.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center space-y-2">
          <Tag className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="text-base font-semibold text-foreground">No {activeTab !== "ALL" ? activeTab : ""} events found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {query
              ? "Try a different search keyword or switch categories."
              : `There are currently no ${activeTab !== "ALL" ? activeTab : ""} events open for guest attendance.`}
          </p>
        </div>
      )}

      {/* Events Grid */}
      {!isLoading && !isError && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              expanded={selected?.id === ev.id}
              onToggle={() => setSelected(selected?.id === ev.id ? null : ev)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
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
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { mutate: guestJoin, isPending } = useGuestJoin(event.id);

  const brand = event.branding?.brandColor || "#0B5CFF";
  const logoUrl = event.branding?.logoUrl;

  // Determine status. `GET /guest/events` does not return `status` (verified against the live
  // response, which carries only id, title, date, startTime and branding), so an absent status
  // means unknown — not live. Treating it as live put a red LIVE badge on every card, including
  // events dated weeks out.
  const status = (event.status || "").toUpperCase();
  const isLive = status === "LIVE" || status === "ACTIVE";
  const isEnded = status === "ENDED" || status === "COMPLETED";

  // Category label. The same endpoint omits `eventType`, so fall back to a keyword read of the
  // title and render no chip when neither yields anything — an AGM badged "GENERAL" is worse
  // than an AGM with no badge.
  const categoryLabel = eventTypeLabel(event.eventType) ?? guessEventTypeFromTitle(event.title);

  function join() {
    setError(null);
    guestJoin(
      { code: code.trim(), name: name.trim() || undefined },
      {
        onSuccess: async (res: any) => {
          const { token, eventType, guestName } = readJoinResult(res);
          if (!token) {
            setError("Joined, but no guest session was returned. Please try again.");
            return;
          }
          storeGuestSession(token, event.id, name.trim() || guestName);
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
        "flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-xs transition-all duration-200 hover:shadow-md",
        expanded ? "border-primary ring-1 ring-primary/20" : "border-border hover:border-primary/50"
      )}
    >
      <div className="p-5 space-y-4">
        {/* Top Card Bar: Logo & Status Badge */}
        <div className="flex items-start justify-between gap-3">
          {logoUrl ? (
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={event.title} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-xs"
              style={{ backgroundColor: brand }}
            >
              {event.title.trim().charAt(0).toUpperCase()}
            </div>
          )}

          {/* Status Badge */}
          {isEnded ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200">
              ENDED
            </span>
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600 border border-red-200/80 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
              UPCOMING
            </span>
          )}
        </div>

        {/* Title & Category */}
        <div className="space-y-1">
          {categoryLabel && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-muted/80 text-muted-foreground">
                {categoryLabel}
              </span>
            </div>
          )}
          <h3 className="text-base font-bold text-foreground line-clamp-2 leading-snug">
            {event.title.trim()}
          </h3>
        </div>

        {/* Simple Event Details: Date & Time */}
        <div className="pt-1 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{event.date}</span>
          </div>
          {event.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{event.startTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action / Expand Access Code Drawer */}
      <div className="border-t border-border bg-muted/10 p-3">
        <Button
          type="button"
          onClick={onToggle}
          variant={expanded ? "default" : "outline"}
          className="w-full justify-between text-xs h-9 rounded-xl font-semibold"
        >
          <span>{expanded ? "Close Form" : "Enter Access Code"}</span>
          <KeyRound className="h-3.5 w-3.5 ml-2" />
        </Button>

        {expanded && (
          <div className="mt-3 space-y-3 pt-3 border-t border-border/60">
            <p className="text-[11px] text-muted-foreground leading-tight">
              Enter the access code from your event invitation.
            </p>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <input
                autoFocus
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs tracking-widest outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="ACCESS CODE (e.g. 7F3KQXPM)"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.trim().length >= 3 && !isPending) join();
                }}
                maxLength={12}
              />

              <input
                className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary/20"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Button
                disabled={code.trim().length < 3 || isPending}
                loading={isPending}
                onClick={join}
                className="w-full h-9 text-xs rounded-xl"
              >
                Join Event
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestBrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <GuestBrowseContent />
    </Suspense>
  );
}
