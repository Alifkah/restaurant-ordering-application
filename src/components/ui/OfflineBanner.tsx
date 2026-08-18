"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-bounce-subtle"
    >
      {isOffline ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900/90 text-sand-100 text-xs font-semibold shadow-elevation-3 backdrop-blur-sm border border-stone-700">
          <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Internet connection lost. Offline mode active.</span>
        </div>
      ) : showReconnected ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-700/95 text-white text-xs font-semibold shadow-elevation-3 backdrop-blur-sm border border-emerald-500">
          <Wifi className="w-4 h-4 text-white" />
          <span>Connection restored!</span>
        </div>
      ) : null}
    </div>
  );
}
