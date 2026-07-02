"use client";
import { useEffect, useRef, useState } from "react";
import { loadZoomEmbeddedSdk } from "@/lib/zoom";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface Props {
  meetingNumber: string;
  passcode: string;
  userName: string;
}

// Renders a live Zoom meeting (Component View) inside the video slot — the Zoom
// equivalent of the YouTube <iframe>. It fetches a join signature, loads the SDK
// from the CDN, and joins into its own container.
//
// TEMPORARY: the signature comes from our local /api/zoom/signature route. Once the
// backend exposes a real endpoint, swap the fetch URL and pass the ZAK token into
// client.join({ ..., zak }) (required for joining backend-created meetings).
export function ZoomStage({ meetingNumber, passcode, userName }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<any>(null);
  const [status, setStatus] = useState<"connecting" | "joined" | "error">("connecting");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function join() {
      setStatus("connecting");
      setErrorMsg("");
      try {
        const res = await fetch("/api/zoom/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingNumber, role: 0 }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Could not get join signature");

        const ZoomMtgEmbedded = await loadZoomEmbeddedSdk();
        if (cancelled || !rootRef.current) return;

        const client = ZoomMtgEmbedded.createClient();
        clientRef.current = client;
        await client.init({ zoomAppRoot: rootRef.current, language: "en-US", patchJsMedia: true });
        if (cancelled) return;

        await client.join({
          sdkKey: data.sdkKey,
          signature: data.signature,
          meetingNumber,
          password: passcode,
          userName,
        });
        if (!cancelled) setStatus("joined");
      } catch (e: unknown) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(e instanceof Error ? e.message : String(e));
      }
    }

    join();
    return () => {
      cancelled = true;
      try {
        clientRef.current?.leaveMeeting?.();
      } catch {
        /* ignore */
      }
    };
  }, [meetingNumber, passcode, userName]);

  return (
    <div className="absolute inset-0">
      {status !== "joined" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 px-6 text-center text-white">
          {status === "error" ? (
            <>
              <p className="text-sm font-semibold text-white/90">Couldn&apos;t join the meeting</p>
              <p className="text-xs text-white/60">{errorMsg}</p>
            </>
          ) : (
            <p className="text-sm font-semibold text-white/85">Connecting to the meeting…</p>
          )}
        </div>
      )}
      <div ref={rootRef} className="h-full w-full" />
    </div>
  );
}
