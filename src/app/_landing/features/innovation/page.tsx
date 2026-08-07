"use client";
import Link from "next/link";
import {
  ArrowRight, Trophy,
  FileText, Award, Building2, Filter, Bookmark,
  ClipboardList, Users, Upload, Lightbulb, TrendingUp, CheckCircle2,
  Radio, BarChart2, Monitor, MessageSquare,
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
    headline: "A challenge directory participants actually want to use",
    subtext:
      "Browsable listings of open and upcoming challenges with problem statements, prize breakdowns, eligibility criteria, and sponsor profiles — all in one place.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1600&q=80&fit=crop",
    points: [
      { icon: Trophy, label: "Challenge directory", desc: "Participants browse all open and upcoming challenges in a clean, searchable listing with key details up front." },
      { icon: FileText, label: "Problem statement publishing", desc: "Organisers publish structured problem statements with context, constraints, and success criteria." },
      { icon: Award, label: "Prize & eligibility details", desc: "Prize tiers, cash amounts, and eligibility rules are visible at a glance before participants apply." },
      { icon: Building2, label: "Sponsor profiles", desc: "Corporate sponsors are showcased with company profiles, challenge context, and evaluation criteria." },
      { icon: Filter, label: "Open & upcoming challenge filters", desc: "Participants filter by status, industry, prize size, and deadline to find the challenges most relevant to them." },
      { icon: Bookmark, label: "Challenge follow & save", desc: "Interested participants can follow challenges to receive updates and deadline reminders before applications close." },
    ],
  },
  {
    dark: false,
    headline: "Structured applications and team formation",
    subtext:
      "Participants apply individually or as teams with structured submission of profiles, ideas, and supporting documents. Team leads manage submissions on behalf of the group.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80&fit=crop",
    points: [
      { icon: ClipboardList, label: "Structured application form", desc: "Organisers configure required fields — team bio, idea summary, relevant experience, and file attachments." },
      { icon: Users, label: "Team composition management", desc: "Team leads invite members via link, set roles, and submit a single unified application on behalf of the group." },
      { icon: Upload, label: "Document upload", desc: "Teams attach pitch decks, prototypes, or supporting evidence directly to their application in the platform." },
      { icon: Lightbulb, label: "Idea & experience submission", desc: "A structured idea canvas captures the problem being solved, proposed approach, and team experience in a consistent format." },
      { icon: TrendingUp, label: "Real-time status tracking", desc: "Applicants see live status updates as their submission moves through the review pipeline." },
      { icon: CheckCircle2, label: "Submitted / Shortlisted / Selected stages", desc: "Clear stage labels with in-platform notifications keep every team informed throughout the selection process." },
    ],
  },
  {
    dark: true,
    headline: "Live judging, finals, and winner announcements",
    subtext:
      "Shortlisted teams pitch live to judges and a registered audience. Judges score submissions through a dedicated interface. Winners are announced on-screen with certificates generated automatically.",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&q=80&fit=crop",
    points: [
      { icon: Radio, label: "Session streaming", desc: "Live pitch sessions are broadcast to registered judges and a public audience with recording enabled by default." },
      { icon: BarChart2, label: "Judging dashboard & scoring rubric", desc: "Judges score each team on configurable criteria. Scores aggregate automatically into a live ranked leaderboard." },
      { icon: Monitor, label: "Finalist showcase stream", desc: "Selected finalists present to judges and audience in a dedicated broadcast session with time controls." },
      { icon: MessageSquare, label: "Live winner announcement", desc: "Winners are announced on-screen during the closing session with a live reveal moment built into the broadcast." },
      { icon: Award, label: "Participation certificates for all", desc: "Every registered participant automatically receives a branded digital certificate for joining the challenge." },
      { icon: Trophy, label: "Winner certificates for placed teams", desc: "First, second, and third-placed teams receive unique winner certificates with their ranking and challenge name." },
    ],
  },
];

export default function InnovationPage() {
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
              <Trophy className="h-3 w-3" />
              Hackathons &amp; Innovation Challenges
            </span>
            <h1
              className="mt-2 font-black leading-tight text-white"
              style={{ fontSize: "clamp(32px, 5.5vw, 62px)" }}
            >
              Manage the full innovation
              <br />
              <span style={{ color: "#ea6c00" }}>challenge lifecycle</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.48)" }}
            >
              From challenge discovery and team applications to live pitch sessions, judging, and winner
              announcements — Attend handles every stage of your innovation programme.
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
              Run your next challenge on Attend
            </p>
            <h2
              className="font-black leading-tight text-white"
              style={{ fontSize: "clamp(28px, 4.5vw, 54px)" }}
            >
              Power your next innovation programme.
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              From launch to winner announcement — one platform for the full lifecycle of your challenge.
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
