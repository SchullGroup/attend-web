"use client";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

const RECEIPT = {
  reference: "ATD-AGM-2026-77821",
  meeting: "Zenith Bank Plc — 2026 Annual General Meeting",
  date: "2026-05-28 10:42 WAT",
  shares: 18450,
  resolutions: [
    { num: 1, title: "Adoption of Financial Statements", vote: "For" },
    { num: 2, title: "Declaration of Final Dividend", vote: "For" },
    { num: 3, title: "Re-election of Directors", vote: "For" },
    { num: 4, title: "Appointment of Auditors", vote: "Abstain" },
  ],
};

export default function ReceiptPage() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(RECEIPT.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/agm"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>

      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
          <div className="border-b border-border bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-white/80">
                  Vote receipt
                </p>
                <h1 className="text-lg font-bold">
                  Your votes have been recorded
                </h1>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Row label="Meeting" value={RECEIPT.meeting} />
              <Row label="Cast at" value={RECEIPT.date} />
              <Row
                label="Voting power"
                value={`${RECEIPT.shares.toLocaleString()} shares`}
              />
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <button
                  onClick={copy}
                  className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-sm font-medium text-foreground hover:text-primary"
                >
                  {RECEIPT.reference}
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Resolutions
              </p>
              <ul className="divide-y divide-border rounded-xl border border-border">
                {RECEIPT.resolutions.map((r) => (
                  <li
                    key={r.num}
                    className="flex items-center justify-between p-3 text-sm"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Resolution {r.num}
                      </p>
                      <p className="font-medium text-foreground">{r.title}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        r.vote === "For"
                          ? "bg-emerald-100 text-emerald-700"
                          : r.vote === "Against"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {r.vote}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
              This receipt is cryptographically signed and timestamped. It
              serves as evidence of your participation and votes at the meeting.
            </div>

            <div className="flex gap-3">
              <Button fullWidth>
                <Download className="h-4 w-4" /> Download receipt
              </Button>
              <Link href="/agm" className="block">
                <Button variant="outline">Back to AGMs</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
