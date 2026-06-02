"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "bvn", label: "BVN", path: "/bvn", n: 1 },
  { key: "nin", label: "NIN", path: "/nin", n: 2 },
  { key: "chn", label: "CHN", path: "/chn", n: 3 },
];

export default function KycLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIntro = pathname?.endsWith("/intro");
  const isSuccess = pathname?.endsWith("/success");

  const currentIndex = STEPS.findIndex((s) => pathname?.endsWith(s.path));

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-primary">attend</div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Identity Verification
            </p>
          </div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Skip for now
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 py-10">
        {!isIntro && !isSuccess && (
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Step {currentIndex + 1} of {STEPS.length}</span>
              <span>{Math.round(((currentIndex + 1) / STEPS.length) * 100)}% complete</span>
            </div>
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => {
                const done = i < currentIndex;
                const active = i === currentIndex;
                return (
                  <div key={s.key} className="flex flex-1 items-center gap-2">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        done && "border-primary bg-primary text-white",
                        active && "border-primary bg-white text-primary",
                        !done && !active && "border-border bg-white text-muted-foreground",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : s.n}
                    </div>
                    <div
                      className={cn(
                        "h-1 flex-1 rounded-full",
                        done ? "bg-primary" : "bg-border",
                        i === STEPS.length - 1 && "hidden",
                      )}
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              {STEPS.map((s) => (
                <span key={s.key}>{s.label}</span>
              ))}
            </div>
          </div>
        )}
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
