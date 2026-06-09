export type EventModule = "AGM" | "LAUNCH" | "HACKATHON" | "GENERAL";
export type EventStatus = "upcoming" | "live" | "ended" | "cancelled";
export type RSVPStatus = "confirmed" | "waitlisted" | "declined" | null;
export type KYCStatus = "none" | "basic" | "full" | "pending";

export interface Event {
  id: string; module: EventModule; title: string; organiser: string;
  description: string; date: string; startTime: string; endTime: string;
  format: "virtual" | "hybrid" | "in-person"; venue?: string;
  status: EventStatus; capacity?: number; rsvpCount: number;
  rsvpStatus: RSVPStatus; tags: string[]; thumbnailColor: string;
  image?: string;
  challengeId?: string; pressKitReleased?: boolean; onRegister?: boolean;
  speakers: { id: string; name: string; title: string; company: string }[];
  agenda: { id: string; title: string; startTime: string; duration: number; isCurrent?: boolean }[];
}

export interface User {
  id: string; fullName: string; email: string; phone: string;
  kycStatus: KYCStatus; role: string; createdAt: string;
}

export const MOCK_USER: User = {
  id: "usr_001", fullName: "Ngozi Okafor", email: "ngozi.okafor@email.com",
  phone: "+2348012345678", kycStatus: "none", role: "shareholder", createdAt: "2024-01-15T10:00:00Z",
};

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt_001", module: "AGM", title: "Zenith Bank Plc — 2026 Annual General Meeting",
    organiser: "Zenith Bank Plc", description: "The 2026 Annual General Meeting of Zenith Bank Plc, open to all registered shareholders. Agenda includes financial report approval, dividend declaration, director elections, and auditor appointments.",
    date: "2026-05-28", startTime: "10:00", endTime: "14:00", format: "hybrid",
    venue: "Civic Centre, Victoria Island, Lagos", status: "live", capacity: 5000,
    rsvpCount: 2847, rsvpStatus: "confirmed", thumbnailColor: "#1a6b3c", onRegister: true,
    tags: ["Banking", "Finance", "Regulatory"],
    speakers: [{ id: "spk_001", name: "Dr. Ebenezer Onyeagwu", title: "Group MD & CEO", company: "Zenith Bank Plc" }],
    agenda: [
      { id: "a1", title: "Opening & Quorum Confirmation", startTime: "10:00", duration: 10 },
      { id: "a2", title: "Chairman's Address", startTime: "10:10", duration: 20 },
      { id: "a3", title: "Presentation of Audited Financial Statements", startTime: "10:30", duration: 30 },
      { id: "a4", title: "Resolution 1: Adoption of Financial Statements", startTime: "11:00", duration: 15 },
      { id: "a5", title: "Resolution 2: Declaration of Final Dividend", startTime: "11:15", duration: 15 },
      { id: "a6", title: "Resolution 3: Re-election of Directors", startTime: "11:30", duration: 30, isCurrent: true },
      { id: "a7", title: "Shareholder Q&A", startTime: "12:15", duration: 45 },
      { id: "a8", title: "Closing Remarks", startTime: "13:00", duration: 10 },
    ],
  },
  {
    id: "evt_002", module: "AGM", title: "GTCo Holdings — 2026 EGM: Rights Issue Approval",
    organiser: "GTCo Holdings", description: "Extraordinary General Meeting to approve the proposed rights issue and capital raise initiative.",
    date: "2026-06-10", startTime: "11:00", endTime: "13:00", format: "virtual",
    status: "upcoming", capacity: 10000, rsvpCount: 6102, rsvpStatus: null,
    thumbnailColor: "#f97316", onRegister: true, tags: ["Banking", "Capital Markets"],
    speakers: [{ id: "spk_003", name: "Mr. Segun Agbaje", title: "Group CEO", company: "GTCo Holdings" }],
    agenda: [
      { id: "b1", title: "Opening & Attendance", startTime: "11:00", duration: 10 },
      { id: "b2", title: "Presentation of Rights Issue Details", startTime: "11:10", duration: 30 },
      { id: "b3", title: "Shareholder Q&A", startTime: "11:40", duration: 30 },
      { id: "b4", title: "Resolution: Approval of Rights Issue", startTime: "12:10", duration: 20 },
    ],
  },
  {
    id: "evt_003", module: "AGM", title: "Dangote Cement Plc — 2026 Annual General Meeting",
    organiser: "Dangote Cement Plc", description: "The 35th Annual General Meeting of Dangote Cement Plc.",
    date: "2026-07-05", startTime: "10:00", endTime: "13:00", format: "hybrid",
    venue: "Transcorp Hilton Hotel, Abuja", status: "upcoming", capacity: 3000,
    rsvpCount: 1200, rsvpStatus: null, thumbnailColor: "#6366f1", onRegister: true, tags: ["Manufacturing"],
    speakers: [{ id: "spk_004", name: "Mr. Arvind Pathak", title: "MD & CEO", company: "Dangote Cement Plc" }],
    agenda: [
      { id: "c1", title: "Chairman's Address", startTime: "10:00", duration: 20 },
      { id: "c2", title: "Financial Statements Review", startTime: "10:20", duration: 40 },
      { id: "c3", title: "Resolutions Voting", startTime: "11:00", duration: 60 },
    ],
  },
  {
    id: "evt_004", module: "LAUNCH", title: "Meristem Wealth Management — MeriSave Product Launch",
    organiser: "Meristem Wealth Management", description: "Join us for the unveiling of MeriSave, Meristem's new digital savings product.",
    date: "2026-06-15", startTime: "14:00", endTime: "16:30", format: "virtual",
    status: "upcoming", rsvpCount: 1843, rsvpStatus: null, thumbnailColor: "#f97316",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80&fit=crop",
    tags: ["FinTech", "Savings", "Product Launch"], pressKitReleased: false,
    speakers: [{ id: "spk_005", name: "Mr. Oluwatobi Lawal", title: "CEO", company: "Meristem Wealth Management" }],
    agenda: [
      { id: "d1", title: "MeriSave Teaser & Brand Reveal", startTime: "14:00", duration: 20 },
      { id: "d2", title: "Official Product Launch", startTime: "14:20", duration: 30 },
      { id: "d3", title: "Live Product Demo", startTime: "14:50", duration: 40 },
      { id: "d4", title: "Q&A Session", startTime: "15:30", duration: 60 },
    ],
  },
  {
    id: "evt_005", module: "HACKATHON", title: "MeriHack 2026 — FinTech Innovation Challenge",
    organiser: "Meristem Innovation Hub", description: "MeriHack 2026 is Meristem's premier hackathon inviting Nigeria's brightest tech talents.",
    date: "2026-07-20", startTime: "09:00", endTime: "18:00", format: "in-person",
    venue: "Victoria Island, Lagos", status: "upcoming", rsvpCount: 412, rsvpStatus: null,
    thumbnailColor: "#9333ea", tags: ["Innovation Challenge", "FinTech"], challengeId: "chl_001",
    speakers: [{ id: "spk_008", name: "Dr. Yewande Adeyemi", title: "Chief Innovation Officer", company: "Meristem Innovation Hub" }],
    agenda: [
      { id: "e1", title: "Registration & Networking", startTime: "09:00", duration: 30 },
      { id: "e2", title: "Opening Ceremony & Challenge Briefing", startTime: "09:30", duration: 30 },
      { id: "e3", title: "Hacking Sprint", startTime: "10:00", duration: 360 },
      { id: "e4", title: "Team Presentations & Judging", startTime: "16:00", duration: 90 },
      { id: "e5", title: "Prize Giving & Closing", startTime: "17:30", duration: 30 },
    ],
  },
  {
    id: "evt_006", module: "GENERAL", title: "FintechNGR Regulatory Roundtable 2026",
    organiser: "FintechNGR Association", description: "The FintechNGR Regulatory Roundtable brings together regulators, fintech founders, legal experts, and investors.",
    date: "2026-06-25", startTime: "09:00", endTime: "17:00", format: "hybrid",
    venue: "Eko Hotel, Lagos", status: "upcoming", rsvpCount: 340, rsvpStatus: "confirmed",
    thumbnailColor: "#2563eb",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&fit=crop",
    tags: ["Regulatory", "Policy", "FinTech"],
    speakers: [{ id: "spk_011", name: "Ms. Uju Ogubunka", title: "Executive Director", company: "FintechNGR Association" }],
    agenda: [
      { id: "f1", title: "Opening Address & Keynote", startTime: "09:00", duration: 45 },
      { id: "f2", title: "Panel: Open Banking & Consumer Data Rights", startTime: "10:00", duration: 90 },
      { id: "f3", title: "Closing Roundtable & Networking", startTime: "15:30", duration: 90 },
    ],
  },
];

export const MOCK_RESOLUTIONS = [
  { id: "res_001", number: 1, title: "Adoption of Financial Statements", description: "To receive and adopt the audited financial statements for the year ended December 31, 2025.", isSpecial: false, votingOpen: false, votes: { for: 4200000, against: 50000, abstain: 20000 }, userVote: "for" as const },
  { id: "res_002", number: 2, title: "Declaration of Final Dividend", description: "To declare a final dividend of ₦3.50 per ordinary share.", isSpecial: false, votingOpen: false, votes: { for: 4180000, against: 70000, abstain: 20000 }, userVote: "for" as const },
  { id: "res_003", number: 3, title: "Re-election of Directors", description: "To re-elect Dr. Adeyemi Okonkwo as a Director.", isSpecial: false, votingOpen: true },
  { id: "res_004", number: 4, title: "Appointment of Auditors", description: "To re-appoint PricewaterhouseCoopers as Auditors.", isSpecial: false, votingOpen: false },
];

export const MOCK_NOTIFICATIONS = [
  { id: "n1", type: "vote_open", title: "Ballot Open — Resolution 3", body: "Voting is now open for Resolution 3: Re-election of Directors at the Zenith Bank 2026 AGM.", eventId: "evt_001", read: false, createdAt: "2026-05-20T10:05:00Z" },
  { id: "n2", type: "event_reminder", title: "Reminder: AGM in 7 days", body: "The Zenith Bank 2026 AGM is in 7 days. Make sure your KYC is complete.", eventId: "evt_001", read: false, createdAt: "2026-05-21T08:00:00Z" },
  { id: "n3", type: "application_update", title: "Congratulations — Shortlisted!", body: "Your MeriHack 2026 application has been shortlisted.", eventId: "evt_005", read: false, createdAt: "2026-07-05T14:00:00Z" },
  { id: "n4", type: "document", title: "New Document: AGM Notice", body: "The Zenith Bank 2026 AGM Notice and Agenda have been uploaded.", eventId: "evt_001", read: true, createdAt: "2026-05-01T09:00:00Z" },
  { id: "n5", type: "broadcast", title: "Venue Change: Zenith Bank AGM", body: "The Zenith Bank 2026 AGM venue has moved to Eko Hotel & Suites, Victoria Island.", eventId: "evt_001", read: false, createdAt: "2026-05-25T07:30:00Z" },
];

export const MOCK_DOCUMENTS = [
  { id: "doc_001", title: "Zenith Bank 2026 AGM Notice", type: "notice", eventId: "evt_001", eventTitle: "Zenith Bank Plc — 2026 AGM", fileSize: "1.2 MB", uploadedAt: "2026-05-01T09:00:00Z" },
  { id: "doc_002", title: "Zenith Bank 2026 AGM Agenda", type: "agenda", eventId: "evt_001", eventTitle: "Zenith Bank Plc — 2026 AGM", fileSize: "0.4 MB", uploadedAt: "2026-05-01T09:00:00Z" },
  { id: "doc_003", title: "Zenith Bank 2025 Annual Report", type: "report", eventId: "evt_001", eventTitle: "Zenith Bank Plc — 2026 AGM", fileSize: "8.7 MB", uploadedAt: "2026-04-28T09:00:00Z" },
  { id: "doc_004", title: "Proxy Form — Zenith Bank 2026 AGM", type: "proxy", eventId: "evt_001", eventTitle: "Zenith Bank Plc — 2026 AGM", fileSize: "0.3 MB", uploadedAt: "2026-05-01T09:00:00Z" },
];

export const MOCK_CHALLENGE = {
  id: "chl_001", eventId: "evt_005", title: "MeriHack 2026 — FinTech Innovation Challenge",
  problemStatement: "Design and build a technology solution that improves financial inclusion, investment accessibility, or capital market participation for underserved Nigerians.",
  prizes: [{ place: "1st Place", amount: "₦5,000,000" }, { place: "2nd Place", amount: "₦2,500,000" }, { place: "3rd Place", amount: "₦1,000,000" }],
  tracks: ["Digital Savings & Investment", "Capital Market Access", "RegTech & Compliance"],
  eligibility: "Open to Nigerian citizens and residents aged 18 and above. Teams of 2–5 members.",
  teamSize: { min: 2, max: 5 }, submissionDeadline: "2026-07-18",
  sponsors: ["Meristem", "NGX Group", "CBN", "SEC Nigeria"],
};

export const MOCK_APPLICATIONS = [
  { id: "app_001", challengeTitle: "MeriHack 2026", teamName: "ByteForce", track: "Digital Savings & Investment", status: "shortlisted", submittedAt: "2026-06-30" },
  { id: "app_002", challengeTitle: "MeriHack 2026", teamName: "FinNova", track: "Capital Market Access", status: "under_review", submittedAt: "2026-07-01" },
  { id: "app_003", challengeTitle: "NGX Builders Sprint", teamName: "OpenLedger", track: "RegTech & Compliance", status: "submitted", submittedAt: "2026-05-28" },
];

export const MOCK_RESOURCES = [
  { id: "r1", title: "Open Banking API Documentation", type: "doc", url: "#", description: "Reference docs for the NGX Open Banking sandbox APIs." },
  { id: "r2", title: "Innovation Pitch Workshop", type: "video", url: "#", description: "60-minute masterclass on building a compelling 5-minute pitch." },
  { id: "r3", title: "MeriSave SDK Quickstart", type: "doc", url: "#", description: "Step-by-step guide to integrating the MeriSave SDK in 15 minutes." },
  { id: "r4", title: "Design Resources Pack", type: "doc", url: "#", description: "Brand kits, Figma libraries and iconography assets." },
  { id: "r5", title: "Mentor Office Hours", type: "video", url: "#", description: "Schedule of mentor sessions throughout the hackathon week." },
  { id: "r6", title: "Submission Guidelines", type: "doc", url: "#", description: "What to include, file formats, scoring rubric and deadlines." },
];

export const MOCK_FAQ = [
  { q: "What is Attend?", a: "Attend is an enterprise events platform for AGMs, product launches, innovation challenges, and general corporate gatherings." },
  { q: "How do I verify my identity?", a: "From Home, complete the KYC flow which collects your BVN, NIN and CHN. Verification typically completes in under a minute." },
  { q: "Can I attend an AGM virtually?", a: "Yes. Hybrid and virtual AGMs let you join the live stream and vote on resolutions in real time once your KYC is verified." },
  { q: "How do I appoint a proxy?", a: "On the AGM page, tap Proxy and choose either the Chairman of the meeting or a named proxy. You must submit the form before the meeting begins." },
  { q: "How are hackathon submissions judged?", a: "Submissions are evaluated by a panel of industry judges on innovation, technical depth, market fit and presentation quality." },
];
