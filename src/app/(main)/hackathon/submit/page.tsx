"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Github, Globe, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSubmitProject, useGetMyTeam } from "@/api/hackathon/hooks";

function SubmitPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId") ?? "";
  const teamIdParam = searchParams.get("teamId") ?? "";

  const [form, setForm] = useState({
    title: "",
    description: "",
    repositoryUrl: "",
    demoUrl: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Collected to match design; the submit endpoint has no pitch-deck field yet.
  const [file, setFile] = useState<File | null>(null);

  const { data: teamData } = useGetMyTeam(challengeId);
  const { mutate: submitProject, isPending } = useSubmitProject();

  const teamId = teamIdParam || teamData?.data?.id || "";

  useEffect(() => {
    if (!challengeId) router.replace("/hackathon");
  }, [challengeId, router]);

  useEffect(() => {
    const sub = teamData?.data?.submission;
    if (sub) {
      setForm({
        title: sub.title || "",
        description: sub.description || "",
        repositoryUrl: sub.repositoryUrl || "",
        demoUrl: sub.demoUrl || "",
      });
    }
  }, [teamData]);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const valid = form.title.trim().length > 0 && form.description.trim().length > 10;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!teamId) return;
    setErrorMsg(null);
    submitProject(
      {
        teamId,
        data: {
          title: form.title.trim(),
          description: form.description.trim(),
          repositoryUrl: form.repositoryUrl.trim(),
          demoUrl: form.demoUrl.trim(),
        },
      },
      {
        onSuccess: () => router.push("/hackathon/my-applications"),
        onError: (err: any) =>
          setErrorMsg(
            err?.response?.data?.message || err?.message || "Submission failed. Please try again.",
          ),
      },
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
          {teamData?.data?.name ?? "Your team"}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Submit your project</h1>
        <p className="text-sm text-muted-foreground">
          Share your project links and description. You can update this before the deadline.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm">
        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        <Input
          name="title"
          label="Project title"
          placeholder="e.g. MicroVest"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="demoUrl"
            label="Demo URL"
            leftIcon={<Globe className="h-4 w-4" />}
            placeholder="https://demo.example.com"
            value={form.demoUrl}
            onChange={(e) => update("demoUrl", e.target.value)}
          />
          <Input
            name="repositoryUrl"
            label="Source repository"
            leftIcon={<Github className="h-4 w-4" />}
            placeholder="https://github.com/team/project"
            value={form.repositoryUrl}
            onChange={(e) => update("repositoryUrl", e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Project description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={6}
            placeholder="What you built, who it's for, and what makes it stand out."
            className="w-full rounded-xl border border-input bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Pitch deck (PDF)</label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:bg-muted/50">
            <Upload className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              {file ? file.name : "Click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              PDF up to 25MB · landscape preferred
            </p>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending} disabled={!valid || !teamId}>
            {teamData?.data?.submission ? "Update submission" : "Submit project"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitPageInner />
    </Suspense>
  );
}
