"use client";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useGetMyTeams } from "@/api/hackathon/hooks";
import { MOCK_APPLICATIONS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

type Tone = "info" | "warning" | "success" | "muted";

const STATUS_TONE: Record<string, Tone> = {
  submitted: "success",
  not_submitted: "warning",
  draft: "muted",
  under_review: "warning",
  shortlisted: "success",
  selected: "success",
};
const STATUS_LABEL: Record<string, string> = {
  submitted: "Submitted",
  not_submitted: "Not submitted",
  draft: "Draft",
  under_review: "Under review",
  shortlisted: "Shortlisted",
  selected: "Selected",
};

interface AppRow {
  id: string;
  eventId: string;
  challengeTitle: string;
  teamName: string;
  track: string;
  submittedAt: string;
  statusKey: string;
}

const fmtType = (t: string) => (t || "").replace(/_/g, " ").toLowerCase();
const labelFor = (k: string) => STATUS_LABEL[k] ?? (k ? k.replace(/_/g, " ") : "—");
const toneFor = (k: string): Tone => STATUS_TONE[k] ?? "muted";

export default function MyApplicationsPage() {
  const { data, isLoading, error } = useGetMyTeams();
  const apiTeams = data?.data?.teams ?? [];
  const usingMock = !isLoading && (!!error || apiTeams.length === 0);

  const apps: AppRow[] = usingMock
    ? MOCK_APPLICATIONS.map((a) => ({
        id: a.id,
        eventId: a.id,
        challengeTitle: a.challengeTitle,
        teamName: a.teamName,
        track: a.track,
        submittedAt: formatDate(a.submittedAt),
        statusKey: a.status,
      }))
    : apiTeams.map((t) => ({
        id: t.teamId,
        eventId: t.eventId,
        challengeTitle: t.eventTitle,
        teamName: t.teamName,
        track: fmtType(t.eventType),
        submittedAt: t.eventDate ? formatDate(t.eventDate) : "—",
        statusKey: (t.submissionStatus || "").toLowerCase(),
      }));

  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Innovation
      </Link>

      <header className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My applications</h1>
          <p className="text-sm text-muted-foreground">
            Track the status of every challenge you&apos;ve applied to.
          </p>
        </div>
        {usingMock && (
          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            Demo data
          </span>
        )}
      </header>

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-2xl border border-border bg-muted" />
      ) : apps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          You haven&apos;t applied to any challenges yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          {/* desktop table */}
          <table className="hidden w-full text-sm md:table">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Challenge</th>
                <th className="px-4 py-3 text-left font-semibold">Team</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((a) => (
                <tr key={a.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <Link href={`/hackathon/${a.eventId}`} className="hover:text-primary">
                      {a.challengeTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{a.teamName}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{a.track}</td>
                  <td className="px-4 py-3 text-muted-foreground">{a.submittedAt}</td>
                  <td className="px-4 py-3">
                    <Badge variant={toneFor(a.statusKey)}>{labelFor(a.statusKey)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* mobile list */}
          <ul className="divide-y divide-border md:hidden">
            {apps.map((a) => (
              <li key={a.id}>
                <Link href={`/hackathon/${a.eventId}`} className="flex items-start gap-3 p-4 hover:bg-muted/30">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{a.challengeTitle}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {a.teamName} · {a.track}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.submittedAt}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={toneFor(a.statusKey)}>{labelFor(a.statusKey)}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
