"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileCheck2 } from "lucide-react";

export default function NinPage() {
  const router = useRouter();
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);
  const isValid = /^\d{11}$/.test(nin);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => router.push("/chn"), 1200);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileCheck2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          National Identification Number
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your 11-digit NIN. You can retrieve this by dialing *346# on
          your registered mobile line.
        </p>
      </div>

      <Input
        name="nin"
        label="NIN"
        inputMode="numeric"
        maxLength={11}
        placeholder="00000000000"
        value={nin}
        onChange={(e) => setNin(e.target.value.replace(/\D/g, ""))}
        hint="11 digits — checked against NIMC records."
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.push("/bvn")}
        >
          Back
        </Button>
        <Button type="submit" fullWidth loading={loading} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </form>
  );
}
