"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Lädt die Serverdaten der Seite regelmäßig neu (ohne Neuladen der Seite), solange das Fenster sichtbar ist */
export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}
