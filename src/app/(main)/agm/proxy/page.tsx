"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type ProxyType = "chairman" | "named";

export default function ProxyPage() {
  const router = useRouter();
  const [type, setType] = useState<ProxyType>("chairman");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const valid = type === "chairman" || (name.trim() && /.+@.+\..+/.test(email));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/agm/receipt"), 1500);
  }

  return (
    <div className="space-y-6">
      <Link href="/agm" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to AGMs
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Zenith Bank Plc — 2026 AGM
        </p>
        <h1 className="mt-1 text-2xl font-bold text-foreground">Appoint a proxy</h1>
        <p className="text-sm text-muted-foreground">
          If you can&apos;t attend the meeting, appoint someone to vote on your
          behalf.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2">
          <Choice
            active={type === "chairman"}
            onClick={() => setType("chairman")}
            icon={UserCheck}
            title="Chairman of the meeting"
            body="Standard option — your vote follows your pre-vote choices."
          />
          <Choice
            active={type === "named"}
            onClick={() => setType("named")}
            icon={UserPlus}
            title="Named proxy"
            body="Nominate a specific verified shareholder."
          />
        </div>

        {type === "named" && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              name="name"
              label="Proxy full name"
              placeholder="e.g. Adekunle Bello"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              name="email"
              label="Proxy email"
              type="email"
              placeholder="proxy@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          Proxy appointments must be submitted at least 48 hours before the
          meeting. You can revoke this anytime before voting opens.
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/agm")}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!valid}>
            Submit proxy
          </Button>
        </div>
      </form>
    </div>
  );
}

function Choice({
  active,
  onClick,
  icon: Icon,
  title,
  body,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof UserCheck;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-colors",
        active
          ? "border-primary bg-primary/5"
          : "border-border bg-white hover:border-primary/40",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          active ? "bg-primary text-white" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </button>
  );
}
