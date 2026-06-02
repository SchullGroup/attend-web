import { CalendarCheck2, Vote, Trophy } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on small screens */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0b1e4d] via-[#13357a] to-[#1d4ed8] p-12 text-white md:flex">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute bottom-12 right-12 h-72 w-72 rounded-full bg-white/5" />

        <div className="relative">
          <img src="/attend-logo.png" alt="Attend" style={{ height: 36 }} className="brightness-0 invert" />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/70">
            Enterprise Events Platform
          </p>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Run AGMs, launches and innovation challenges in one place.
            </h2>
            <p className="mt-3 max-w-md text-white/75">
              From shareholder votes to product reveals — Attend delivers the calm,
              modern experience your community deserves.
            </p>
          </div>

          <div className="grid max-w-md grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Vote className="h-5 w-5" />
              <p className="mt-2 text-xs font-medium">Live voting & proxy</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <CalendarCheck2 className="h-5 w-5" />
              <p className="mt-2 text-xs font-medium">RSVP & reminders</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <Trophy className="h-5 w-5" />
              <p className="mt-2 text-xs font-medium">Hackathons</p>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-white/60">
          © {new Date().getFullYear()} Meristem · Built for enterprise events.
        </div>
      </aside>

      {/* Right form area */}
      <main className="flex w-full flex-col items-center justify-center bg-background px-6 py-10 md:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
