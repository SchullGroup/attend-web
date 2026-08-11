"use client";
import Link from "next/link";
import { ArrowLeft, Download, FileText, FileBarChart2, FileCheck2, FileSignature } from "lucide-react";
import { useGetDocuments } from "@/api/documents/hooks";
import type { ParticipantDocument } from "@/types";

const TYPE_META: Record<string, { Icon: typeof FileText; bg: string; color: string; label: string }> = {
  notice: { Icon: FileText, bg: "bg-blue-50", color: "text-blue-700", label: "Notice" },
  agenda: { Icon: FileCheck2, bg: "bg-emerald-50", color: "text-emerald-700", label: "Agenda" },
  report: { Icon: FileBarChart2, bg: "bg-orange-50", color: "text-orange-700", label: "Report" },
  proxy: { Icon: FileSignature, bg: "bg-purple-50", color: "text-purple-700", label: "Proxy form" },
};

/**
 * The name to show for a document.
 *
 * `title` is the admin's own name for it — required at upload and stored separately from the
 * filename, so it is always the field to display. It is only blank on rows saved before that was
 * enforced; those fall back to the filename minus its extension so no row renders nameless.
 */
function documentName(d: ParticipantDocument): string {
  const title = d.title?.trim();
  if (title) return title;
  const file = d.originalFilename?.trim();
  if (file) return file.replace(/\.[a-z0-9]{1,8}$/i, "");
  return "Untitled document";
}

/** The spec sends only `sizeBytes`; the deployed response also sends a ready-made `sizeLabel`. */
function sizeLabel(d: ParticipantDocument): string {
  if (d.sizeLabel) return d.sizeLabel;
  if (!d.sizeBytes) return "";
  const kb = d.sizeBytes / 1024;
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}

interface DocRow {
  id: string;
  typeKey: string;
  title: string;
  meta: string;
  eventTitle: string;
  downloadUrl: string;
}

export default function DocumentsPage() {
  const { data, isLoading } = useGetDocuments();
  const apiDocs = data?.data?.documents ?? [];

  const docs: DocRow[] = apiDocs.map((d) => {
    const size = sizeLabel(d);
    return {
      id: d.id,
      typeKey: (d.documentType || "").toLowerCase(),
      title: documentName(d),
      meta: d.downloadCount ? `${size} · ${d.downloadCount} downloads` : size,
      // Field names differ between the spec and the deployed response; take whichever arrives.
      eventTitle: d.eventTitle || d.eventName || "",
      downloadUrl: d.downloadUrl || d.fileUrl || "",
    };
  });

  return (
    <div className="space-y-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header className="flex flex-wrap items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My documents</h1>
          <p className="text-sm text-muted-foreground">
            Notices, agendas, reports and proxy forms attached to your events.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 animate-pulse rounded-2xl border border-border bg-muted" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No documents have been shared with you yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => {
            const meta = TYPE_META[d.typeKey] || TYPE_META.notice;
            const { Icon } = meta;
            return (
              <li key={d.id} className="flex items-center gap-3 rounded-2xl border border-border bg-white p-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{d.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[meta.label, d.meta].filter(Boolean).join(" · ")}
                  </p>
                  {d.eventTitle && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.eventTitle}</p>
                  )}
                </div>
                {d.downloadUrl ? (
                  <a
                    href={d.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download ${d.title}`}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    disabled
                    aria-label="Download unavailable"
                    className="inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-xl border border-border bg-white text-muted-foreground/40"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
