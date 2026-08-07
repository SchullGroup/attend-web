"use client";
import Link from "next/link";
import {
  ArrowRight, CalendarDays,
  Users, UserPlus, QrCode, LayoutDashboard, ClipboardList,
  Radio, MessageSquare, Zap, Play, BarChart2,
  FileText, Star, Award, ShieldCheck, FolderOpen,
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
    headline: "Build and publish any event in minutes",
    subtext:
      "Create events with titles, descriptions, dates, formats, venues, agendas, and speaker profiles. Target specific audiences or open registration to the public.",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80&fit=crop",
    points: [
      { icon: CalendarDays, label: "Event builder", desc: "Configure every event detail — title, date, format, venue, capacity, and registration fields — in a guided setup flow." },
      { icon: Users, label: "Audience targeting", desc: "Control who can register — open to the public, invite-only, or restricted to specific organisations or email domains." },
      { icon: UserPlus, label: "RSVP collection", desc: "Attendees register via a shareable link or embedded form with custom fields, confirmation emails, and automated reminders." },
      { icon: LayoutDashboard, label: "Waitlist management", desc: "Automatically waitlist registrants when capacity is reached and convert them as spots open up." },
      { icon: QrCode, label: "Digital QR check-in", desc: "Every registrant receives a unique QR code. Staff scan at the door for instant, paperless check-in." },
      { icon: ClipboardList, label: "Real-time attendee list", desc: "Organisers see a live headcount and full attendee list updating in real time as check-ins are processed." },
    ],
  },
  {
    dark: false,
    headline: "Live streaming for hybrid and virtual attendees",
    subtext:
      "Broadcast your event professionally to remote participants with low-latency streaming, live polls, audience Q&A, and reaction tools — all integrated in one experience.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&q=80&fit=crop",
    points: [
      { icon: Radio, label: "Live video broadcast", desc: "Low-latency, high-quality stream delivered to all virtual registrants from the Attend platform with presenter controls." },
      { icon: MessageSquare, label: "Live polls & Q&A", desc: "Engage virtual and in-person audiences simultaneously with live polls and a moderated question queue." },
      { icon: Zap, label: "Audience reactions", desc: "Remote attendees send real-time emoji reactions visible to presenters and the audience during the broadcast." },
      { icon: Play, label: "One-tap event entry", desc: "Virtual attendees join with a single tap on their unique event link — no app download or login friction." },
      { icon: BarChart2, label: "Attendance indicator", desc: "Presenters see a live virtual attendee count on their presenter dashboard alongside in-room check-in numbers." },
      { icon: Play, label: "On-demand replay", desc: "The full recording is available to registered attendees immediately after the broadcast ends with chapter navigation." },
    ],
  },
  {
    dark: true,
    headline: "Post-event distribution and permanent archive",
    subtext:
      "Push communiques, proceedings, presentations, and photo galleries to every registered attendee's document vault. Every past event remains searchable and accessible forever.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=80&fit=crop",
    points: [
      { icon: FileText, label: "Communique & proceedings upload", desc: "Upload and distribute post-event documents to all attendees' in-platform document vaults in one action." },
      { icon: Star, label: "Photo & media gallery", desc: "Publish a curated photo and video gallery from the event, accessible to all registered attendees on demand." },
      { icon: Award, label: "Attendance certificates", desc: "Digital certificates are auto-generated for every check-in and available for immediate download." },
      { icon: ShieldCheck, label: "CPD & regulatory certificates", desc: "Issue CPD-accredited or regulatory attendance certificates with session codes and verifiable credentials." },
      { icon: FolderOpen, label: "Event archive", desc: "Every past event — attendee list, recordings, documents, and certificates — is permanently archived and searchable." },
      { icon: BarChart2, label: "Organiser analytics dashboard", desc: "Full post-event report with attendance rate, check-in speed, document download counts, and audience demographics." },
    ],
  },
];

export default function GeneralPage() {
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
              <CalendarDays className="h-3 w-3" />
              General Client Events
            </span>
            <h1
              className="mt-2 font-black leading-tight text-white"
              style={{ fontSize: "clamp(32px, 5.5vw, 62px)" }}
            >
              A professional event channel
              <br />
              <span style={{ color: "#ea6c00" }}>for every occasion</span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.48)" }}
            >
              Replace ad-hoc tools with a structured, branded event experience. Host conferences, seminars,
              roundtables, and awards ceremonies with full RSVP, streaming, and post-event distribution.
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
              Every event, handled
            </p>
            <h2
              className="font-black leading-tight text-white"
              style={{ fontSize: "clamp(28px, 4.5vw, 54px)" }}
            >
              One platform. Every occasion.
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              From RSVP to archive — replace scattered tools with one structured, branded event channel.
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
