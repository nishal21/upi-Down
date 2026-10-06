import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.nishal.upidown",
  appName: "UPI Down?",
  webDir: "out",
  server: {
    // Must be a subdomain of the Turnstile widget's domain, and must differ from the API host.
    hostname: "app.upidown.nishal.dev",
    androidScheme: "https",
  },
  android: {
    backgroundColor: "#0f110e",
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SystemBars: {
      insetsHandling: "css",
      initialViewportFitValueHint: "cover",
    },
    SplashScreen: {
      // Stay up until BootSplash Lottie is ready, then SplashScreen.hide().
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#0f110e",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#00000000",
      overlaysWebView: true,
    },
  },
};

export default config;
