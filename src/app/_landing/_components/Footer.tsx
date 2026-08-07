import Link from "next/link";
import { Twitter, Linkedin, Instagram } from "lucide-react";

const PLATFORM_LINKS = [
  { label: "Features", href: "/landing/features" },
  { label: "Virtual AGMs", href: "/landing/features/agm" },
  { label: "Product Launches", href: "/landing/features/launches" },
  { label: "Innovation Challenges", href: "/landing/features/innovation" },
  { label: "General Events", href: "/landing/features/general" },
];

const COMPANY_LINKS = ["About", "Careers", "Press", "Contact"];
const LEGAL_LINKS = ["Privacy Policy", "Terms of Use", "Cookie Policy"];

export function LandingFooter() {
  return (
    <footer style={{ background: "#ffffff", borderTop: "1px solid #e5e5e5" }}>
      <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <img
              src="/attend-logo.png"
              alt="Attend"
              style={{ height: 24, width: "auto", filter: "brightness(0)" }}
            />
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "#6b7280" }}>
              Enterprise events infrastructure for Nigeria&apos;s capital markets — built for the institutions that move markets.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Twitter, Linkedin, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-200"
                  style={{ background: "#f3f4f6", color: "#374151" }}
                  aria-label="Social link"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#0f172a" }}>
                Platform
              </p>
              <ul className="space-y-2.5">
                {PLATFORM_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm transition-colors hover:text-[#0f172a]"
                      style={{ color: "#6b7280" }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#0f172a" }}>
                Company
              </p>
              <ul className="space-y-2.5">
                {COMPANY_LINKS.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors hover:text-[#0f172a]" style={{ color: "#6b7280" }}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: "#0f172a" }}>
                Legal
              </p>
              <ul className="space-y-2.5">
                {LEGAL_LINKS.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm transition-colors hover:text-[#0f172a]" style={{ color: "#6b7280" }}>
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright strip */}
      <div style={{ background: "#f5f5f5", borderTop: "1px solid #e5e5e5" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 md:flex-row md:px-8">
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            © 2026 Meristem Attend. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            Built by{" "}
            <span style={{ color: "#374151" }}>Meristem Securities Ltd</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
