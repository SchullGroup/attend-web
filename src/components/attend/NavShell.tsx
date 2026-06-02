"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Building2,
  Lightbulb,
  Rocket,
  User as UserIcon,
  Bell,
  Search,
} from "lucide-react";
import { cn, initialsFor } from "@/lib/utils";
import { MOCK_USER } from "@/lib/mock-data";

const NAV = [
  { label: "Home", href: "/", icon: House, match: (p: string) => p === "/" },
  { label: "AGM", href: "/agm", icon: Building2, match: (p: string) => p.startsWith("/agm") },
  { label: "Challenges", href: "/hackathon", icon: Lightbulb, match: (p: string) => p.startsWith("/hackathon") },
  { label: "Launches", href: "/events", icon: Rocket, match: (p: string) => p.startsWith("/events") },
  { label: "Profile", href: "/profile", icon: UserIcon, match: (p: string) => p.startsWith("/profile") },
];

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-white md:flex">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-primary">attend</span>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Enterprise Events
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initialsFor(MOCK_USER.fullName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {MOCK_USER.fullName}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {MOCK_USER.email}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Top header */}
      <header className="sticky top-0 z-20 border-b border-border bg-white/85 backdrop-blur md:pl-64">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <div className="text-xl font-extrabold tracking-tight text-primary">attend</div>
          </div>
          <div className="hidden flex-1 max-w-md md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-xl border border-input bg-muted/40 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
                placeholder="Search events, companies, challenges…"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/notifications"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white hover:bg-muted"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary md:hidden"
            >
              {initialsFor(MOCK_USER.fullName)}
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-12">
          {children}
        </div>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 backdrop-blur md:hidden">
        <ul className="flex items-center justify-around px-2 py-2">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
