import type { Theme } from "./theme";

type Cap = { isNativePlatform(): boolean };

function cap(): Cap | undefined {
  return (globalThis as { Capacitor?: Cap }).Capacitor;
}

export const isNative = () => cap()?.isNativePlatform() === true;

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

export async function syncStatusBar(theme: Theme) {
  if (!isNative()) return;
  const { StatusBar, Style } = await import("@capacitor/status-bar");
  await StatusBar.setStyle({ style: theme === "dark" ? Style.Dark : Style.Light });
}
