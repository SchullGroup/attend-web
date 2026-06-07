"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Fingerprint } from "lucide-react";

export default function BvnPage() {
  const router = useRouter();
  const [bvn, setBvn] = useState("");
  const isValid = /^\d{11}$/.test(bvn);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("kyc_bvn", bvn);
    router.push("/nin");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Fingerprint className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          Bank Verification Number
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your 11-digit BVN. You can find this by dialing *565*0# on your
          registered mobile line.
        </p>
      </div>

      <Input
        name="bvn"
        label="BVN"
        inputMode="numeric"
        maxLength={11}
        placeholder="22XXXXXXXXX"
        value={bvn}
        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ""))}
        hint="11 digits — your BVN never leaves our secure verification partner."
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.push("/intro")}
        >
          Back
        </Button>
        <Button type="submit" fullWidth disabled={!isValid}>
          Continue
        </Button>
      </div>
    </form>
  );
}
