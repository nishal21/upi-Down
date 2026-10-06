"use client";

import { useEffect, useRef } from "react";
import { Lottie, LottieSubscription } from "lottie-react";
import splash from "@/assets/splash.json";

const SAFETY_MS = 3500;

/** Native cold-start: Cap splash → Lottie → onboarding/home. */
export function BootSplash({ onDone }: { onDone: () => void }) {
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };

  const hideNativeSplash = () => {
    void import("@capacitor/splash-screen")
      .then(({ SplashScreen }) => SplashScreen.hide({ fadeOutDuration: 120 }))
      .catch(() => {
        /* web / missing plugin */
      });
  };

  useEffect(() => {
    const hide = window.setTimeout(hideNativeSplash, 80);
    const t = window.setTimeout(finish, SAFETY_MS);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] grid place-items-center bg-[#0f110e]"
      style={{
        paddingTop: "var(--safe-area-inset-top, env(safe-area-inset-top, 0px))",
        paddingBottom: "var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))",
      }}
      aria-busy
      aria-label="Loading UPI Down?"
    >
      <Lottie
        src={splash}
        loop={false}
        autoplay
        className="aspect-square w-[min(72vw,17.5rem)]"
        subscriptions={{
          [LottieSubscription.ready]: hideNativeSplash,
          [LottieSubscription.complete]: finish,
        }}
      />
    </div>
  );
}
