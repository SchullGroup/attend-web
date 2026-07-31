"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Fingerprint, Camera, Upload, CheckCircle2, RefreshCw, User } from "lucide-react";
import { useKycStep1 } from "@/api/kyc/hooks";

export default function BvnPage() {
  const router = useRouter();
  const [bvn, setBvn] = useState("");
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBvnValid = /^\d{11}$/.test(bvn);
  const isValid = isBvnValid && !!selfieImage;

  const { mutate: submitStep1, isPending } = useKycStep1();

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraActive(false);
  }

  useEffect(() => stopCamera, []);

  async function startCamera() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setErrorMsg(
        "We couldn't access your camera. Please allow camera access or upload a photo.",
      );
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Extract raw base64 string without data:image/jpeg;base64, prefix
        const rawBase64 = canvas.toDataURL("image/jpeg", 0.85).split(",")[1] ?? "";
        setSelfieImage(rawBase64);
      }
    }
    stopCamera();
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const rawBase64 = result.split(",")[1] ?? "";
        setSelfieImage(rawBase64);
        stopCamera();
      }
    };
    reader.readAsDataURL(file);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !selfieImage) return;
    setErrorMsg(null);

    submitStep1(
      { bvn, selfieImage },
      {
        onSuccess: () => {
          sessionStorage.setItem("kyc_bvn", bvn);
          sessionStorage.setItem("kyc_selfie", selfieImage);
          router.push("/chn");
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || err?.message || "";
          if (/already.*verif/i.test(msg)) {
            sessionStorage.setItem("kyc_bvn", bvn);
            sessionStorage.setItem("kyc_selfie", selfieImage);
            router.push("/chn");
            return;
          }
          setErrorMsg(msg || "We couldn't verify that BVN photo match. Please check and try again.");
        },
      },
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Fingerprint className="h-5 w-5 text-gray-700" />
        </div>
        <h1 className="text-xl font-bold text-foreground">BVN & Face Verification</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your 11-digit BVN and take a selfie so your photo is verified against your BVN biodata.
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
        hint={`${bvn.length}/11 digits — your BVN is securely verified with Dojah.`}
      />

      {/* Selfie Capture Section */}
      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Verification Photo <span className="text-red-500">*</span>
        </label>

        {isCameraActive ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-900 bg-slate-900 p-4 text-white">
            <div className="relative h-56 w-44 overflow-hidden rounded-full border-2 border-emerald-400 bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
                style={{ transform: "scaleX(-1)" }}
              />
            </div>
            <p className="text-xs text-slate-300">Position your face inside the circle</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={capturePhoto}>
                <Camera className="mr-1.5 h-4 w-4" /> Snap Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stopCamera}
                className="bg-white/10 text-white hover:bg-white/20 border-transparent"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : selfieImage ? (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500 bg-emerald-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/jpeg;base64,${selfieImage}`}
                  alt="Selfie preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Photo Captured
                </p>
                <p className="text-xs text-emerald-700">Ready for Dojah BVN face matching</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelfieImage(null);
                startCamera();
              }}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retake
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-slate-50/70 p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-border">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Take or Upload a Selfie</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your photo will be compared with the photo on your BVN record.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-1">
              <Button type="button" size="sm" onClick={startCamera}>
                <Camera className="mr-1.5 h-4 w-4" /> Open Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-1.5 h-4 w-4" /> Upload Photo
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => router.push("/intro")}
          disabled={isPending}
        >
          Back
        </Button>
        <Button type="submit" fullWidth loading={isPending} disabled={!isValid}>
          {isPending ? "Verifying BVN & Photo…" : "Verify BVN & Photo"}
        </Button>
      </div>
    </form>
  );
}
