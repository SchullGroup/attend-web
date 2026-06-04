"use client";
import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/lib/user-store";

export default function KycSuccessPage() {
  const { setKycStatus } = useUserStore();

  useEffect(() => {
    setKycStatus("full");
  }, [setKycStatus]);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle2 className="h-9 w-9 text-emerald-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          You&apos;re verified!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your identity has been confirmed. You can now RSVP for AGMs, cast
          votes on shareholder resolutions and apply to innovation challenges.
        </p>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-muted/40 p-4 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Verification details
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">BVN</span>
          <span className="font-medium text-foreground">Verified</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">NIN</span>
          <span className="font-medium text-foreground">Verified</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">CHN</span>
          <span className="font-medium text-foreground">Verified</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/agm" className="block">
          <Button fullWidth size="lg">
            Browse AGMs
          </Button>
        </Link>
        <Link href="/" className="block">
          <Button variant="ghost" fullWidth>
            Go to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
