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

        const el = rootRef.current;

        // Render Zoom's FULL default Component View — the whole console (tiles + video
        // + controls toolbar), exactly like the admin sees. Zoom sizes itself and the
        // container grows to fit it, so nothing (especially the toolbar) is clipped.
        // Extra empty space in the slot is acceptable.
        await client.init({
          zoomAppRoot: el,
          language: "en-US",
          patchJsMedia: true,
        });
        if (cancelled) return;

        // Keep our full-box overlay up until we're actually IN the meeting (past the
        // waiting room), so Zoom's small pre-join/waiting screen is never exposed.
        client.on("connection-change", (payload: any) => {
          if (payload?.state === "Connected" && !cancelled) setStatus("joined");
        });

        await client.join({
          sdkKey: data.sdkKey,
          signature: data.signature,
          meetingNumber,
          password: passcode,
          userName,
        });
        // Fallback: if the connection event doesn't arrive, reveal the meeting anyway.
        setTimeout(() => {
          if (!cancelled) setStatus((s) => (s === "connecting" ? "joined" : s));
        }, 12000);
      } catch (e: unknown) {
        if (cancelled) return;
        setStatus("error");
        // Zoom rejects with an object ({ reason, errorCode, type }), not an Error.
        const anyE = e as any;
        const msg =
          e instanceof Error
            ? e.message
            : anyE?.reason || anyE?.errorMessage || anyE?.message || (anyE ? JSON.stringify(anyE) : String(e));
        setErrorMsg(msg);
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
    <div className="relative min-h-105 w-full">
      {status !== "joined" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-900 px-6 text-center text-white">
          {status === "error" ? (
            <>
              <p className="text-sm font-semibold text-white/90">Couldn&apos;t join the meeting</p>
              <p className="text-xs text-white/60">{errorMsg}</p>
            </>
          ) : (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/25 border-t-white/80" />
              <p className="text-sm font-semibold text-white/85">Connecting to the meeting…</p>
            </>
          )}
        </div>
      )}
      <div ref={rootRef} className="min-h-105 w-full" />
    </div>
  );
}
