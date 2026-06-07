"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCreateTeam, useGetMyTeam } from "@/api/hackathon/hooks";

function ApplyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId") ?? "";

  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: existingTeam } = useGetMyTeam(challengeId);
  const { mutate: createTeam, isPending } = useCreateTeam(challengeId);

  useEffect(() => {
    if (!challengeId) router.replace("/hackathon");
  }, [challengeId, router]);

  // If user already has a team, redirect to submit
  useEffect(() => {
    if (existingTeam?.data?.id) {
      router.replace(`/hackathon/submit?challengeId=${challengeId}&teamId=${existingTeam.data.id}`);
    }
  }, [existingTeam, challengeId, router]);

  const valid = teamName.trim().length > 0 && description.trim().length > 10;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    createTeam(
      { name: teamName.trim(), description: description.trim() },
      {
        onSuccess: (res) => {
          const teamId = res.data?.id;
          router.push(`/hackathon/submit?challengeId=${challengeId}&teamId=${teamId}`);
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to create team. Please try again.",
          );
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/hackathon"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Cancel application
      </Link>

      <header>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Create your team</h1>
        <p className="text-sm text-muted-foreground">
          You&apos;ll be the team leader. You can submit your project once your team is created.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm"
      >
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <Input
          name="teamName"
          label="Team name"
          placeholder="e.g. ByteForce"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Team description / idea
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Describe your team's idea, what problem you're solving, and your approach."
            className="w-full rounded-xl border border-input bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
          />
          <p className="text-xs text-muted-foreground">Minimum 10 characters.</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/hackathon")}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending} disabled={!valid || !challengeId}>
            Create team
          </Button>
        </div>
      </form>
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
