"use client";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { useUserStore } from "@/lib/user-store";
import { Button } from "@/components/ui/Button";

export default function AgmLayout({ children }: { children: React.ReactNode }) {
  const { kycStatus } = useUserStore();

  if (kycStatus !== "full") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="mx-auto max-w-sm space-y-6 px-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Identity verification required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete your KYC to access Annual General Meetings, cast votes on resolutions, and appoint proxies.
            </p>
          </div>
          <div className="space-y-2">
            <Link href="/intro" className="block">
              <Button fullWidth>Start verification</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="ghost" fullWidth>Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
