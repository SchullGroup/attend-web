"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Github, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    demo: "",
    repo: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/hackathon/certificate"), 1500);
  }

  const valid = form.title.trim() && form.description.trim().length > 10;

  return (
    <div className="space-y-6">
      <Link href="/hackathon" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">
          MeriHack 2026 — Submission
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Submit your project</h1>
        <p className="text-sm text-muted-foreground">
          Upload your pitch deck and share the demo & repo links.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <Input
          name="title"
          label="Project title"
          placeholder="e.g. MicroVest"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            name="demo"
            label="Demo URL"
            leftIcon={<Globe className="h-4 w-4" />}
            placeholder="https://demo.example.com"
            value={form.demo}
            onChange={(e) => update("demo", e.target.value)}
          />
          <Input
            name="repo"
            label="Source repository"
            leftIcon={<Github className="h-4 w-4" />}
            placeholder="https://github.com/team/project"
            value={form.repo}
            onChange={(e) => update("repo", e.target.value)}
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
          <Button type="submit" loading={loading} disabled={!valid}>
            Submit project
          </Button>
        </div>
      </form>
    </div>
  );
}
