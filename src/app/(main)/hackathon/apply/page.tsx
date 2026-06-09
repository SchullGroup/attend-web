"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateTeam, useGetMyTeam, useGetChallenge } from "@/api/hackathon/hooks";
import { MOCK_CHALLENGE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Member = { id: string; name: string; role: string };

const STEPS = ["Team", "Idea", "Members"] as const;

function ApplyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId") ?? "";

  const { data: chData } = useGetChallenge(challengeId);
  const { data: existingTeam } = useGetMyTeam(challengeId);
  const { mutate: createTeam, isPending } = useCreateTeam(challengeId);

  const challengeTitle = chData?.data?.title ?? MOCK_CHALLENGE.title;
  const tracks = MOCK_CHALLENGE.tracks;
  const teamSize = MOCK_CHALLENGE.teamSize;

  const [step, setStep] = useState(0);
  const [teamName, setTeamName] = useState("");
  const [track, setTrack] = useState(tracks[0]);
  const [ideaTitle, setIdeaTitle] = useState("");
  const [ideaDescription, setIdeaDescription] = useState("");
  const [members, setMembers] = useState<Member[]>([{ id: "m1", name: "", role: "Team Lead" }]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) router.replace("/hackathon");
  }, [challengeId, router]);

  useEffect(() => {
    if (existingTeam?.data?.id) {
      router.replace(`/hackathon/submit?challengeId=${challengeId}&teamId=${existingTeam.data.id}`);
    }
  }, [existingTeam, challengeId, router]);

  function addMember() {
    setMembers((m) => [...m, { id: `m${Math.random()}`, name: "", role: "" }]);
  }
  function removeMember(id: string) {
    setMembers((m) => m.filter((x) => x.id !== id));
  }
  function updateMember(id: string, k: "name" | "role", v: string) {
    setMembers((m) => m.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  }

  const canNext =
    step === 0 ? teamName.trim().length > 0 :
    step === 1 ? ideaTitle.trim().length > 0 && ideaDescription.trim().length > 10 :
    members.every((x) => x.name.trim() && x.role.trim());

  function submit() {
    setErrorMsg(null);
    // Backend team creation accepts name + description only; the idea title is
    // folded into the description so it isn't lost. Track/members are collected
    // in the form but not yet persisted (no backend field).
    const description = ideaTitle ? `${ideaTitle}\n\n${ideaDescription}` : ideaDescription;
    createTeam(
      { name: teamName.trim(), description: description.trim() },
      {
        onSuccess: () => router.push("/hackathon/my-applications"),
        onError: (err: any) =>
          setErrorMsg(
            err?.response?.data?.message || err?.message || "Failed to create team. Please try again.",
          ),
      },
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Cancel application
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
          {challengeTitle}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Apply to challenge</h1>
      </header>

      {/* stepper */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  done && "border-purple-600 bg-purple-600 text-white",
                  active && "border-purple-600 bg-white text-purple-700",
                  !done && !active && "border-border bg-white text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <div className="hidden text-xs font-medium md:block">{s}</div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-1 flex-1 rounded-full", done ? "bg-purple-600" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Team details</h2>
            <Input
              name="teamName"
              label="Team name"
              placeholder="e.g. ByteForce"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
            <div>
              <label className="text-sm font-medium text-foreground">Track</label>
              <select
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
              >
                {tracks.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Your idea</h2>
            <Input
              name="ideaTitle"
              label="Idea title"
              placeholder="e.g. MicroVest — fractional ETFs for everyone"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={ideaDescription}
                onChange={(e) => setIdeaDescription(e.target.value)}
                rows={6}
                placeholder="Describe the problem, your solution, target users, and what you'll have built by demo day."
                className="w-full rounded-xl border border-input bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
              />
              <p className="text-xs text-muted-foreground">Minimum 10 characters.</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Team members</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMember}
                disabled={members.length >= teamSize.max}
              >
                <Plus className="h-4 w-4" /> Add member
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {teamSize.min}–{teamSize.max} members per team. Add their full name and role.
            </p>
            <ul className="space-y-3">
              {members.map((m, i) => (
                <li key={m.id} className="rounded-xl border border-border bg-muted/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">Member {i + 1}</p>
                    {members.length > 1 && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="text-xs font-medium text-destructive hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      name={`name-${m.id}`}
                      label="Full name"
                      placeholder="e.g. Adaeze Nwosu"
                      value={m.name}
                      onChange={(e) => updateMember(m.id, "name", e.target.value)}
                    />
                    <Input
                      name={`role-${m.id}`}
                      label="Role"
                      placeholder="e.g. Backend engineer"
                      value={m.role}
                      onChange={(e) => updateMember(m.id, "role", e.target.value)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Continue
          </Button>
        ) : (
          <Button onClick={submit} loading={isPending} disabled={!canNext}>
            Submit application
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense>
      <ApplyPageInner />
    </Suspense>
  );
}
