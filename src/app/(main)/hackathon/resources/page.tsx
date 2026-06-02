"use client";
import Link from "next/link";
import { ArrowLeft, FileText, PlayCircle, ExternalLink } from "lucide-react";
import { MOCK_RESOURCES } from "@/lib/mock-data";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to challenges
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-foreground">Hackathon resources</h1>
        <p className="text-sm text-muted-foreground">
          Documentation, sample code, mentor sessions and submission templates.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_RESOURCES.map((r) => {
          const isVideo = r.type === "video";
          const Icon = isVideo ? PlayCircle : FileText;
          return (
            <a
              key={r.id}
              href={r.url}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${isVideo ? "bg-rose-50 text-rose-600" : "bg-purple-50 text-purple-600"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {isVideo ? "Video" : "Document"}
                </p>
                <h3 className="mt-0.5 text-sm font-semibold text-foreground group-hover:text-primary">
                  {r.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                Open <ExternalLink className="h-3 w-3" />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
