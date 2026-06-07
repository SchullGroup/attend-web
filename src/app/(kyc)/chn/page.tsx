"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Lock } from "lucide-react";
import { useSubmitKyc } from "@/api/kyc/hooks";

export default function ChnPage() {
  const router = useRouter();
  const [chn, setChn] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const isValid = /^[a-zA-Z0-9]{10,}$/.test(chn);

  const { mutate: submitKyc, isPending } = useSubmitKyc();

  useEffect(() => {
    const storedBvn = sessionStorage.getItem("kyc_bvn");
    const storedNin = sessionStorage.getItem("kyc_nin");
    if (!storedBvn || !storedNin) {
      router.replace("/bvn");
      return;
    }
    setBvn(storedBvn);
    setNin(storedNin);
  }, [router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    submitKyc(
      { bvn, nin, chn },
      {
        onSuccess: () => {
          sessionStorage.removeItem("kyc_bvn");
          sessionStorage.removeItem("kyc_nin");
          router.push("/success");
        },
        onError: (err: any) => {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Submission failed. Please check your details and try again.",
          );
        },
      },
    );
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

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMsg}
        </div>
      )}

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
          disabled={isPending}
        >
          Back
        </Button>
        <Button
          type="submit"
          fullWidth
          loading={isPending}
          disabled={!isValid}
        >
          {isPending ? "Submitting..." : "Finish verification"}
        </Button>
      </div>
    </form>
  );
}
