"use client";
import Link from "next/link";
import {
  ArrowRight, Building2,
  ShieldCheck, Eye, CheckCircle2, Zap, Users, UserCheck,
  Vote, Clock, Lock, BarChart2, CalendarDays,
  LayoutDashboard, Monitor, FileText, QrCode, Radio,
} from "lucide-react";
import { Reveal } from "../../_components/Reveal";

type FeaturePoint = { icon: React.ElementType; label: string; desc: string };
type Section = {
  dark: boolean;
  headline: string;
  subtext: string;
  image: string;
  points: FeaturePoint[];
};

const SECTIONS: Section[] = [
  {
    dark: true,
    headline: "Identity-verified attendance for every shareholder",
    subtext:
      "Every participant is verified using BVN, NIN, or CHN with face liveness detection before they can join or vote — preventing proxy fraud and ensuring regulatory compliance.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1600&q=80&fit=crop",
    points: [
      { icon: ShieldCheck, label: "BVN/NIN/CHN verification", desc: "Instant verification against Nigeria's national identity registries before registration is confirmed." },
      { icon: Eye, label: "Face liveness detection", desc: "AI-powered liveness check prevents photo spoofing and ensures the person is the registered shareholder." },
      { icon: CheckCircle2, label: "Regulatory-grade compliance", desc: "Meets SEC Nigeria and NGX identity requirements for AGM participant authentication." },
      { icon: Zap, label: "Instant approval flow", desc: "Verified shareholders are approved and issued access credentials in under two minutes." },
      { icon: Users, label: "Proxy appointment", desc: "Shareholders digitally appoint a named individual as proxy with a compliant electronic instruction form." },
      { icon: UserCheck, label: "Chairman proxy support", desc: "Shareholders who cannot attend may appoint the Chairman as proxy with specific or open voting instructions." },
    ],
  },
  {
    dark: false,
    headline: "Real-time voting with an immutable audit trail",
    subtext:
      "Shareholders cast votes on resolutions instantly from any device. Every vote is time-stamped, shareholder-attributed, and locked in a cryptographically signed ledger.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80&fit=crop",
    points: [
      { icon: Vote, label: "Live vote tallying", desc: "Resolutions update in real time as shareholders cast their votes — no manual counting, no delay." },
      { icon: Clock, label: "Time-stamped records", desc: "Every vote is recorded with a precise timestamp and the verified identity of the voter." },
      { icon: Lock, label: "Verifiable audit trail", desc: "A cryptographically signed vote log is generated at the close of voting for statutory reporting." },
      { icon: BarChart2, label: "Multi-resolution support", desc: "Run votes across multiple resolutions simultaneously or sequentially with configurable windows." },
      { icon: CalendarDays, label: "Pre-AGM voting window", desc: "Open a pre-meeting voting period so shareholders can vote before the session goes live." },
      { icon: CheckCircle2, label: "Instant ballot confirmation", desc: "Shareholders receive an immediate on-screen confirmation with a unique ballot reference number." },
    ],
  },
  {
    dark: true,
    headline: "End-to-end meeting management from one dashboard",
    subtext:
      "Upload notices, set agendas, manage RSVPs, monitor live attendance and quorum, moderate Q&A, and export statutory returns — all from a single admin interface.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&fit=crop",
    points: [
      { icon: CalendarDays, label: "RSVP & attendance tracking", desc: "Manage shareholder registration, track RSVPs, and monitor headcount against quorum thresholds." },
      { icon: LayoutDashboard, label: "Live resolution management", desc: "Publish, open, and close resolutions during the meeting with a single click from the admin panel." },
      { icon: Monitor, label: "Virtual & hybrid support", desc: "Accommodate in-person, virtual, and hybrid attendance formats within a single meeting session." },
      { icon: FileText, label: "SEC/NGX compliance tools", desc: "Generate statutory return documents, minutes templates, and attendance registers for regulatory submission." },
      { icon: QrCode, label: "QR check-in", desc: "Issue unique QR codes to in-person attendees for instant, paperless check-in at the venue gates." },
      { icon: Radio, label: "Live streaming broadcast", desc: "Broadcast the meeting to virtual shareholders with low-latency streaming integrated into the voting interface." },
    ],
  },
];

export default function AgmPage() {
  return (
    <div>
      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "linear-gradient(150deg, #0a1628 0%, #0f172a 55%, #111827 100%)",
          paddingTop: 160,
          paddingBottom: 100,
        }}
      >
        <div className="mx-auto max-w-4xl px-5 text-center md:px-8">
          <Reveal>
            <span
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{ borderColor: "rgba(234,108,0,0.4)", color: "#fb923c", background: "rgba(234,108,0,0.1)" }}
            >
              <Building2 className="h-3 w-3" />
              AGM &amp; Investor Relations
            </span>
            <h1
              className="mt-2 font-black leading-tight text-white"
              style={{ fontSize: "clamp(32px, 5.5vw, 62px)" }}
            >
              Run compliant, verified
              <br />
              <span style={{ color: "#ea6c00" }}>shareholder meetings from anywhere</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.48)" }}
            >
              Attend handles the full AGM lifecycle — from notice publication and identity verification to live voting,
              quorum tracking, and post-meeting audit logs. Built for CAMA 2020 and SEC Nigeria compliance.
            </p>
            <div className="mt-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "#ea6c00", boxShadow: "0 12px 40px rgba(234,108,0,0.38)" }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── Content sections ─────────────────────────────────────────── */}
      {SECTIONS.map((s, i) => {
        const textPrimary = s.dark ? "white" : "#111827";
        const textSub = s.dark ? "rgba(255,255,255,0.48)" : "#6b7280";
        const divider = s.dark ? "rgba(255,255,255,0.06)" : "#f0f0f0";

        return (
          <section
            key={i}
            style={{ background: s.dark ? "#0f172a" : "#ffffff", minHeight: "100vh" }}
          >
            <div
              className="mx-auto max-w-7xl px-5 md:px-8"
              style={{ paddingTop: 120, paddingBottom: 120 }}
            >
              {/* Headline & subtext */}
              <Reveal>
                <h2
                  className="max-w-2xl font-black leading-tight"
                  style={{ fontSize: "clamp(26px, 4vw, 50px)", color: textPrimary }}
                >
                  {s.headline}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: textSub }}>
                  {s.subtext}
                </p>
              </Reveal>

              {/* Image in dark container */}
              <Reveal delay={80}>
                <div
                  className="mt-10 overflow-hidden rounded-3xl"
                  style={{
                    background: "#0a1628",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
                  }}
                >
                  <img
                    src={s.image}
                    alt={s.headline}
                    className="h-[260px] w-full object-cover md:h-[480px]"
                    style={{ opacity: 0.88 }}
                  />
                </div>
              </Reveal>

              {/* Feature points — no card borders */}
              <Reveal delay={160}>
                <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  {s.points.map((pt) => {
                    const PIcon = pt.icon;
                    return (
                      <div key={pt.label}>
                        <PIcon className="mb-3 h-5 w-5" style={{ color: "#ea6c00" }} />
                        <p className="mb-1.5 text-sm font-bold" style={{ color: textPrimary }}>
                          {pt.label}
                        </p>
                        <p className="text-sm leading-relaxed" style={{ color: textSub }}>
                          {pt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            </div>

            {/* Subtle divider before next section */}
            {i < SECTIONS.length - 1 && (
              <div style={{ height: 1, background: divider }} />
            )}
          </section>
        );
      })}

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section
        style={{
          background: "#0a1628",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: 100,
          paddingBottom: 100,
        }}
      >
        <div className="mx-auto max-w-3xl px-5 text-center md:px-8">
          <Reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#fb923c" }}>
              Ready to modernise your AGM?
            </p>
            <h2
              className="font-black leading-tight text-white"
              style={{ fontSize: "clamp(28px, 4.5vw, 54px)" }}
            >
              Run your next AGM on Attend.
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Join Nigerian listed companies running compliant, verifiable shareholder meetings on Attend.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "#ea6c00", boxShadow: "0 12px 36px rgba(234,108,0,0.38)" }}
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium"
                style={{ color: "rgba(255,255,255,0.42)" }}
              >
                Already have an account? Sign in →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
