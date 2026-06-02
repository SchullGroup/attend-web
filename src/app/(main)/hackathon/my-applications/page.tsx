"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MOCK_APPLICATIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const STATUS_TONE: Record<string, "info" | "warning" | "success" | "muted"> = {
  submitted: "info",
  under_review: "warning",
  shortlisted: "success",
  selected: "success",
};
const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  selected: "Selected",
};

export default function MyApplicationsPage() {
  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to challenges
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">My applications</h1>
        <p className="text-sm text-muted-foreground">
          Track the status of every challenge you&apos;ve applied to.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        {/* desktop table */}
        <table className="hidden w-full text-sm md:table">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Challenge</th>
              <th className="px-4 py-3 text-left font-semibold">Team</th>
              <th className="px-4 py-3 text-left font-semibold">Track</th>
              <th className="px-4 py-3 text-left font-semibold">Submitted</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_APPLICATIONS.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{a.challengeTitle}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.teamName}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.track}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(a.submittedAt)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* mobile list */}
        <ul className="divide-y divide-border md:hidden">
          {MOCK_APPLICATIONS.map((a) => (
            <li key={a.id} className="flex items-start gap-3 p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{a.challengeTitle}</p>
                <p className="text-xs text-muted-foreground">
                  {a.teamName} · {a.track}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Submitted {formatDate(a.submittedAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
