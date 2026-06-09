"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, RefreshCw, ScanLine, CheckCircle2 } from "lucide-react";
import { MOCK_USER } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { useCheckIn } from "@/api/events/hooks";

function QrCheckinInner() {
  const eventId = useSearchParams().get("eventId") ?? "";
  const { mutate: checkIn, isPending } = useCheckIn(eventId);
  const [checkedIn, setCheckedIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function doCheckIn() {
    if (!eventId) return;
    setErrorMsg(null);
    checkIn(undefined, {
      onSuccess: () => setCheckedIn(true),
      onError: (err: any) =>
        setErrorMsg(
          err?.response?.data?.message || err?.message || "Check-in failed. Please try again.",
        ),
    });
  }

  return (
    <div className="space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Quick check-in</h1>
        <p className="text-sm text-muted-foreground">
          Show this code at the entrance, or check yourself in below.
        </p>
      </header>

      <div className="mx-auto max-w-sm">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          {checkedIn ? (
            <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              <p className="text-base font-semibold text-emerald-700">You&apos;re checked in</p>
            </div>
          ) : (
            <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-white p-3">
              <FakeQr />
            </div>
          )}

          <div className="mt-5 space-y-1 text-center">
            <p className="text-xs text-muted-foreground">Check-in code</p>
            <p className="text-lg font-semibold tracking-wider text-foreground">
              ATD-{MOCK_USER.id.toUpperCase()}-VIP
            </p>
          </div>

          {errorMsg && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-center text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="outline" fullWidth disabled={isPending}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button
              fullWidth
              onClick={doCheckIn}
              loading={isPending}
              disabled={!eventId || checkedIn}
            >
              <ScanLine className="h-4 w-4" /> {checkedIn ? "Checked in" : "Check in"}
            </Button>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {eventId
            ? "Tap check in once you're at the venue."
            : "Open this from an event to enable check-in."}
        </p>
      </div>
    </div>
  );
}

function FakeQr() {
  const N = 21;
  const cells: boolean[] = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < N * N; i++) cells.push(rand() > 0.5);
  const mark = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++)
      for (let dc = 0; dc < 7; dc++) {
        const i = (r + dr) * N + (c + dc);
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const onCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        cells[i] = onBorder || onCenter;
      }
  };
  mark(0, 0); mark(0, N - 7); mark(N - 7, 0);

  return (
    <div
      className="grid h-full w-full"
      style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, gridTemplateRows: `repeat(${N}, 1fr)` }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-foreground" : "bg-white"} />
      ))}
    </div>
  );
}

export default function QrCheckinPage() {
  return (
    <Suspense>
      <QrCheckinInner />
    </Suspense>
  );
}
