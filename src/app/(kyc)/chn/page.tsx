"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock } from "lucide-react";

export default function ChnPage() {
  const router = useRouter();
  const [chn, setChn] = useState("");
  const [loading, setLoading] = useState(false);
  const isValid = /^[a-zA-Z0-9]{10,}$/.test(chn);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/success"), 1500);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Lock className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          CHN — CSCS Clearing House Number
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the CHN issued by the Central Securities Clearing System. You
          can find this on your stockbroker statement.
        </p>
      </div>

      <Input
        name="chn"
        label="CHN"
        maxLength={20}
        placeholder="e.g. CHN1234567"
        value={chn}
        onChange={(e) =>
          setChn(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
        }
        hint="Alphanumeric, at least 10 characters."
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.push("/nin")}
        >
          Back
        </Button>
        <Button type="submit" fullWidth loading={loading} disabled={!isValid}>
          Finish verification
        </Button>
      </div>
    </form>
  );
}
