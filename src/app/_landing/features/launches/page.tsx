"use client";
import Link from "next/link";
import {
  ArrowRight, Rocket,
  Globe, Clock, UserPlus, Layers, ClipboardList, Eye,
  Users, Lock, Award, FileText, Zap, UserCheck,
  Radio, BarChart2, MessageSquare, Play, BookOpen, TrendingUp,
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
    headline: "A branded microsite for every launch moment",
    subtext:
      "Give your product launch its own identity — customisable event pages with your branding, product imagery, countdown timers, and early registration built in.",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&q=80&fit=crop",
    points: [
      { icon: Globe, label: "Branded event microsite", desc: "Custom event landing page with your logo, brand colours, product imagery, and domain-compatible link." },
      { icon: Clock, label: "Countdown timer", desc: "Live countdown built into the microsite keeps your audience anticipating the exact launch moment." },
      { icon: UserPlus, label: "Early registration", desc: "Open pre-launch registration so your guest list is locked in before the event goes live." },
      { icon: Layers, label: "Company branding & imagery", desc: "Full control over fonts, colours, hero images, and layout to match your brand identity perfectly." },
      { icon: ClipboardList, label: "Agenda builder", desc: "Publish a structured agenda with speaker names, segments, and timings so attendees know what to expect." },
      { icon: Eye, label: "Pre-launch teaser content", desc: "Publish teaser copy and imagery visible only to registered attendees in the lead-up to launch day." },
    ],
  },
  {
    dark: false,
    headline: "Controlled press kit release at the exact right moment",
    subtext:
      "Time-lock your press releases, product specs, and media assets so they are distributed to the right people the instant your CEO makes the announcement.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&q=80&fit=crop",
    points: [
      { icon: Users, label: "Tiered invitation management", desc: "Separate guest lists for press, VIP partners, and general audience — each with different access and visibility." },
      { icon: Lock, label: "Embargoed document release", desc: "Assets are pre-loaded into the vault and automatically distributed the moment the embargo lifts." },
      { icon: Award, label: "VIP & press access tiers", desc: "Grant media and VIP guests priority access, exclusive content, and early room entry before general attendees." },
      { icon: FileText, label: "Digital press kit distribution", desc: "Branded press kits delivered to journalists' in-platform document vaults the moment the launch goes live." },
      { icon: Zap, label: "Automated unlock at launch moment", desc: "No manual intervention needed — set your go-live time and Attend releases everything to the right audience." },
      { icon: UserCheck, label: "Media registrant management", desc: "Verify and approve media registrations before granting press-tier access to the launch and press assets." },
    ],
  },
  {
    dark: true,
    headline: "Live broadcast and interactive engagement",
    subtext:
      "Stream your launch event in high quality, run live polls, moderate Q&A with your product team, and capture every engagement metric for your post-launch report.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&q=80&fit=crop",
    points: [
      { icon: Radio, label: "Live launch broadcast", desc: "Low-latency, high-quality stream delivered to all registered virtual attendees from the Attend platform." },
      { icon: BarChart2, label: "Live polls & reactions", desc: "Run instant audience polls and collect live reactions during the presentation to measure engagement in real time." },
      { icon: MessageSquare, label: "Moderated Q&A", desc: "Audience questions are submitted, moderated, and surfaced to the product team in a live presenter queue." },
      { icon: Play, label: "On-demand replay", desc: "The full broadcast is recorded and available on demand to all registrants immediately after the event ends." },
      { icon: BookOpen, label: "Chapter markers per segment", desc: "Tag segments of the recording by product feature so viewers can jump directly to the content that matters to them." },
      { icon: TrendingUp, label: "Full attendee analytics export", desc: "Download a complete post-event report with attendance, watch time, poll responses, and Q&A participation." },
    ],
  },
];

export default function LaunchesPage() {
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
              <Rocket className="h-3 w-3" />
              Product Launch Events
            </span>
            <h1
              className="mt-2 font-black leading-tight text-white"
              style={{ fontSize: "clamp(32px, 5.5vw, 62px)" }}
            >
              Launch your product to a
              <br />
              <span style={{ color: "#ea6c00" }}>registered, engaged audience</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.48)" }}
            >
              Create branded event microsites, manage tiered invitations, release embargoed press kits at the
              perfect moment, and broadcast your launch live — all from one platform.
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
              Plan your next launch
            </p>
            <h2
              className="font-black leading-tight text-white"
              style={{ fontSize: "clamp(28px, 4.5vw, 54px)" }}
            >
              Make your launch moment unforgettable.
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              From branded microsites to embargoed press kit drops — run a launch your audience remembers.
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
