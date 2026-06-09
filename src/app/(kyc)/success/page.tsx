"use client";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function KycSuccessPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
        <Clock className="h-9 w-9 text-amber-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">Verification submitted!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your details have been received. Our team will review and confirm your
          identity — this usually takes a few minutes.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Submitted for verification
        </p>
        {[
          { label: "BVN", status: "Pending" },
          { label: "CHN", status: "Pending" },
          { label: "Face liveness", status: "Confirmed" },
        ].map(({ label, status }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span
              className={`font-medium ${
                status === "Confirmed" ? "text-emerald-700" : "text-amber-600"
              }`}
            >
              {status}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        You&apos;ll be notified once your identity is confirmed. You can still
        browse events while verification is in progress.
      </p>

      <div className="flex flex-col gap-2">
        <Link href="/" className="block">
          <Button fullWidth size="lg">Go to home</Button>
        </Link>
        <Link href="/agm" className="block">
          <Button variant="ghost" fullWidth>
            Browse AGMs
          </Button>
        </Link>
      </div>
    </div>
  );
}
