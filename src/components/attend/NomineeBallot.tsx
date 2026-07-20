import React, { useState } from "react";
import { User, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface Nominee {
  id: string;
  name: string;
  bio?: string;
}

interface NomineeBallotProps {
  nominees: Nominee[];
  title: string;
  onVoteCast?: (votes: { nomineeId: string; choice: "FOR" | "AGAINST" | "ABSTAIN" }[]) => void;
  isPending: boolean;
  showSubmitButton?: boolean;
  onChange?: (votes: { nomineeId: string; choice: "FOR" | "AGAINST" | "ABSTAIN" }[]) => void;
}

export function NomineeBallot({
  nominees,
  title,
  onVoteCast,
  isPending,
  showSubmitButton = true,
  onChange,
}: NomineeBallotProps) {
  const [choices, setChoices] = useState<Record<string, "FOR" | "AGAINST" | "ABSTAIN">>({});

  const handleSelect = (nomineeId: string, choice: "FOR" | "AGAINST" | "ABSTAIN") => {
    const nextChoices = { ...choices, [nomineeId]: choice };
    setChoices(nextChoices);
    if (onChange) {
      const payload = nominees.map((n) => ({
        nomineeId: n.id,
        choice: nextChoices[n.id],
      })).filter((v) => !!v.choice) as { nomineeId: string; choice: "FOR" | "AGAINST" | "ABSTAIN" }[];
      onChange(payload);
    }
  };

  const allSelected = nominees.every((n) => !!choices[n.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allSelected || !onVoteCast) return;

    const payload = nominees.map((n) => ({
      nomineeId: n.id,
      choice: choices[n.id],
    }));

    onVoteCast(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-foreground">Nominee Ballot</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Please select your vote for each of the nominees below to complete your ballot.
        </p>
      </div>

      <div className="space-y-3.5 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
        {nominees.map((nominee, idx) => {
          const choice = choices[nominee.id];
          return (
            <div key={nominee.id} className={cn("flex flex-col gap-2.5 pt-3 first:pt-0 border-t border-slate-100 first:border-t-0")}>
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-snug">{nominee.name}</p>
                  {nominee.bio && <p className="text-xs text-muted-foreground mt-0.5">{nominee.bio}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                {[
                  { key: "FOR", label: "For", activeClass: "bg-emerald-600 border-emerald-600 text-white shadow-sm hover:bg-emerald-700" },
                  { key: "AGAINST", label: "Against", activeClass: "bg-rose-600 border-rose-600 text-white shadow-sm hover:bg-rose-750" },
                  { key: "ABSTAIN", label: "Abstain", activeClass: "bg-slate-650 border-slate-650 text-white shadow-sm hover:bg-slate-700" }
                ].map((btn) => {
                  const active = choice === btn.key;
                  return (
                    <button
                      key={btn.key}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSelect(nominee.id, btn.key as any)}
                      className={cn(
                        "flex-1 rounded-xl py-2 text-xs font-semibold border transition-all duration-205",
                        active
                          ? btn.activeClass
                          : "bg-slate-50/50 border-slate-200 text-slate-650 hover:bg-slate-100/70"
                      )}
                    >
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showSubmitButton && (
        <Button
          type="submit"
          fullWidth
          disabled={!allSelected || isPending}
          loading={isPending}
          className="mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold"
        >
          Cast Ballot Vote
        </Button>
      )}
    </form>
  );
}
