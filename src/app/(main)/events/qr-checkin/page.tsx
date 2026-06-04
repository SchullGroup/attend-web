"use client";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ScanLine } from "lucide-react";
import { useGetMe } from "@/api/auth/hooks";
import { Button } from "@/components/ui/Button";

export default function QrCheckinPage() {
  const { data: userResponse, isLoading } = useGetMe();
  const currentUser = userResponse?.data;

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Quick check-in</h1>
        <p className="text-sm text-muted-foreground">
          Show this code at the entrance to be checked in instantly.
        </p>
      </header>

      <div className="mx-auto max-w-sm">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-border bg-white p-3">
            <FakeQr />
          </div>
          <div className="mt-5 space-y-1 text-center">
            <p className="text-xs text-muted-foreground">Check-in code</p>
            <p className="font-mono text-sm tracking-[0.2em] text-muted-foreground">
              ATD-{currentUser.id.substring(0, 8).toUpperCase()}-VIP
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="outline" fullWidth>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button fullWidth>
              <ScanLine className="h-4 w-4" /> Open scanner
            </Button>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Code refreshes every 60 seconds for security.
        </p>
      </div>
    </div>
  );
}

function FakeQr() {
  // Deterministic faux QR grid
  const N = 21;
  const cells: boolean[] = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < N * N; i++) cells.push(rand() > 0.5);
  // Force position markers in corners
  const mark = (r: number, c: number) => {
    for (let dr = 0; dr < 7; dr++)
      for (let dc = 0; dc < 7; dc++) {
        const i = (r + dr) * N + (c + dc);
        const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const onCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        cells[i] = onBorder || onCenter;
      }
  };
  mark(0, 0);
  mark(0, N - 7);
  mark(N - 7, 0);

  return (
    <div
      className="grid h-full w-full"
      style={{
        gridTemplateColumns: `repeat(${N}, 1fr)`,
        gridTemplateRows: `repeat(${N}, 1fr)`,
      }}
    >
      {cells.map((on, i) => (
        <div key={i} className={on ? "bg-foreground" : "bg-white"} />
      ))}
    </div>
  );
}
