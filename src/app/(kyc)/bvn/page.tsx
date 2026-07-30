"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Fingerprint } from "lucide-react";

export default function BvnPage() {
  const router = useRouter();
  const [bvn, setBvn] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const isValid = /^\d{11}$/.test(bvn);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    setErrorMsg(null);

    // Save BVN in session memory for face-matching at Step 3 (Liveness)
    sessionStorage.setItem("kyc_bvn", bvn);
    router.push("/chn");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Fingerprint className="h-5 w-5 text-gray-700" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Bank Verification Number</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your 11-digit BVN. You can find this by dialing *565*0# on your
          registered mobile line.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

      <Input
        name="bvn"
        label="BVN (11 Digits)"
        inputMode="numeric"
        placeholder="22XXXXXXXXX"
        value={bvn}
        onChange={(e) => setBvn(e.target.value.replace(/\D/g, "").slice(0, 11))}
        hint={`${bvn.length}/11 digits — your BVN is processed securely with Dojah.`}
      />

      <div className="flex gap-3 pt-2">
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
