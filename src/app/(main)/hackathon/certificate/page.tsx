"use client";
import Link from "next/link";
import { ArrowLeft, Download, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetMe } from "@/api/auth/hooks";
import { formatDate } from "@/lib/utils";

export default function CertificatePage() {
  const { data: userResponse, isLoading } = useGetMe();
  const currentUser = userResponse?.data;

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/hackathon"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Your certificate</h1>
        <p className="text-sm text-muted-foreground">
          Thank you for taking part — share your achievement.
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <div className="relative overflow-hidden rounded-3xl border-[3px] border-purple-200 bg-gradient-to-br from-white via-purple-50/40 to-white p-8 shadow-lg md:p-12">
          {/* decorative corners */}
          <Corner className="left-3 top-3" />
          <Corner className="right-3 top-3 rotate-90" />
          <Corner className="bottom-3 left-3 -rotate-90" />
          <Corner className="bottom-3 right-3 rotate-180" />

          <div className="relative space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 text-purple-700">
              <div className="text-base font-extrabold tracking-tight">
                attend
              </div>
              <span className="h-1 w-1 rounded-full bg-purple-700" />
              <p className="text-[10px] uppercase tracking-[0.3em]">
                Innovation Challenge
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Certificate of Participation
              </p>
              <h2 className="mt-3 font-serif text-4xl font-bold text-foreground md:text-5xl">
                {currentUser.fullName}
              </h2>
              <div className="mx-auto mt-3 h-px w-32 bg-purple-200" />
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                successfully participated in the
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground md:text-xl">
                MeriHack 2026 — FinTech Innovation Challenge
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Hosted by Meristem Innovation Hub on {formatDate("2026-07-20")}.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2 text-purple-700">
              <Star className="h-4 w-4 fill-current" />
              <Award className="h-8 w-8" />
              <Star className="h-4 w-4 fill-current" />
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-purple-200 pt-6 text-left">
              <div>
                <p className="font-serif italic text-foreground">
                  Dr. Yewande Adeyemi
                </p>
                <div className="mt-1 border-t border-foreground/40 pt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                  Chief Innovation Officer
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-muted-foreground">
                  ATD-CERT-2026-77821
                </p>
                <div className="mt-1 border-t border-foreground/40 pt-1 text-right text-[10px] uppercase tracking-wide text-muted-foreground">
                  Verification ID
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-3">
          <Button>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button variant="outline">Share</Button>
        </div>
      </div>
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <div className={`absolute h-12 w-12 ${className}`}>
      <div className="absolute left-0 top-0 h-1 w-12 bg-purple-300" />
      <div className="absolute left-0 top-0 h-12 w-1 bg-purple-300" />
    </div>
  );
}
