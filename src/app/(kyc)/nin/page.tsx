"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NinRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/chn"); }, [router]);
  return null;
}
