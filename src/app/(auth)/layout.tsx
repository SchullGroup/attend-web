import { CalendarCheck2, Vote, Trophy } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — hidden on small screens */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-zinc-900 p-12 text-white md:flex">
        {/* Subtle background shapes */}
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/[0.03]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-white/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-white/[0.02]" />

        <div className="relative">
          <img
            src="/attend-logo.png"
            alt="Attend"
            style={{ height: 44 }}
            className="brightness-0 invert"
          />
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">
            Your events platform
          </p>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              Attend the events that matter to you.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              AGMs, product launches and innovation challenges — join live, vote on resolutions
              and stay connected to the companies and communities you care about.
            </p>
          </div>

          <div className="grid max-w-md grid-cols-3 gap-3">
            {[
              { icon: CalendarCheck2, label: "RSVP & join events" },
              { icon: Vote,           label: "Vote in real time"  },
              { icon: Trophy,         label: "Enter challenges"   },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Icon className="h-5 w-5 text-white/70" />
                <p className="mt-2 text-xs font-medium text-white/80">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-white/30">
          © {new Date().getFullYear()} Meristem · Attend
        </div>
      </aside>

      {/* Right form area */}
      <main className="flex w-full flex-col items-center justify-center bg-background px-6 py-10 md:w-1/2">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
