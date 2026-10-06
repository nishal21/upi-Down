import type { Theme } from "./theme";

type Cap = { isNativePlatform(): boolean };

function cap(): Cap | undefined {
  return (globalThis as { Capacitor?: Cap }).Capacitor;
}

/** Capacitor WebView host from capacitor.config.ts — reliable even before the bridge injects. */
export const NATIVE_HOST = "app.upidown.nishal.dev";

export const isNative = () => cap()?.isNativePlatform() === true;

/** Sync detect for boot / CSS — bridge, html class, or Capacitor hostname. */
export function detectNative(): boolean {
  if (typeof window === "undefined") return false;
  if (isNative()) return true;
  try {
    if (document.documentElement.classList.contains("native")) return true;
    if (location.hostname === NATIVE_HOST) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function markHtmlNative() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("native");
}

export async function haptic(kind: "tap" | "success" | "warn" = "tap") {
  if (isNative()) {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "tap") await Haptics.impact({ style: ImpactStyle.Medium });
    else await Haptics.notification({ type: kind === "success" ? NotificationType.Success : NotificationType.Warning });
    return;
  }
  navigator.vibrate?.(kind === "tap" ? 12 : [10, 40, 18]);
}

/** Native share sheet in the app, Web Share on phones, WhatsApp link everywhere else. */
export async function share(text: string, url: string) {
  if (isNative()) {
    const { Share } = await import("@capacitor/share");
    await Share.share({ text, url, dialogTitle: "Share UPI status" });
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ text, url });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, "_blank", "noopener");
}

/** Android back: step back through in-app history (drawer, pages), exit only from the root. */
export async function bindBackButton() {
  if (!isNative()) return;
  const { App } = await import("@capacitor/app");
  await App.addListener("backButton", ({ canGoBack }) => {
    if (canGoBack || history.state?.drawer) history.back();
    else void App.exitApp();
  });
}

/**
 * Capacitor SystemBars injects --safe-area-inset-* on <html>.
 * Until that runs, estimate insets so sticky chrome stays clear of status / gesture bars.
 * If Cap explicitly set 0px, the WebView is already padded — leave it.
 */
export function ensureNativeSafeArea() {
  if (!detectNative() || typeof document === "undefined") return;
  const root = document.documentElement;
  const inlineTop = root.style.getPropertyValue("--safe-area-inset-top").trim();
  const inlineBottom = root.style.getPropertyValue("--safe-area-inset-bottom").trim();

  if (inlineTop === "") {
    const dpr = Math.min(window.devicePixelRatio || 1, 3.5);
    const top = Math.round(28 * (dpr >= 3 ? 1.15 : 1));
    root.style.setProperty("--safe-area-inset-top", `${top}px`);
  }
  if (inlineBottom === "") {
    root.style.setProperty("--safe-area-inset-bottom", "20px");
  }
}

export async function syncStatusBar(theme: Theme) {
  if (!detectNative()) return;
  try {
    markHtmlNative();
    ensureNativeSafeArea();
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: theme === "dark" ? Style.Dark : Style.Light });
    try {
      await StatusBar.setBackgroundColor({ color: "#00000000" });
    } catch {
      /* Android 15+ may ignore background when overlaying */
    }
    try {
      const { SystemBars, SystemBarsStyle } = await import("@capacitor/core");
      await SystemBars.setStyle({
        style: theme === "dark" ? SystemBarsStyle.Dark : SystemBarsStyle.Light,
      });
    } catch {
      /* optional */
    }
    window.setTimeout(ensureNativeSafeArea, 100);
    window.setTimeout(ensureNativeSafeArea, 600);
  } catch (e) {
    console.warn("status bar sync failed", e);
    ensureNativeSafeArea();
  }
}
