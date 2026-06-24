"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LiveRoom } from "@/components/attend/LiveRoom";

function EventLiveInner() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") ?? "";
  return (
    <LiveRoom
      eventId={eventId}
      showBallot={false}
      backHref={`/events/${eventId}`}
      backLabel="Back to event"
    />
  );
}

export default function EventLivePage() {
  return (
    <Suspense>
      <EventLiveInner />
    </Suspense>
  );
}
