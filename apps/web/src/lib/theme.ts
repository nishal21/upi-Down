"use client";

import { createStored } from "./store";

export type Theme = "dark" | "light";

const stored = createStored<Theme>("upidown-theme", "dark");

export const THEME_SCRIPT = `try{var d=document.documentElement,t=JSON.parse(localStorage.getItem("upidown-theme")||'"dark"');d.dataset.theme="upidown-"+t;var l=JSON.parse(localStorage.getItem("upidown-lang")||"null");if(l){d.lang=l+"-IN";d.dir=l==="ur"?"rtl":"ltr"}var cap=window.Capacitor;if(cap&&typeof cap.isNativePlatform==="function"&&cap.isNativePlatform()){d.classList.add("native");var ob=localStorage.getItem("upidown-onboarded");if(ob!=="true")d.classList.add("needs-onboard")}}catch(e){}`;

export function useTheme() {
  const theme = stored.use();
  const setTheme = (t: Theme) => {
    stored.set(t);
    document.documentElement.dataset.theme = `upidown-${t}`;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", t === "dark" ? "#0f110e" : "#f4efe3");
    import("./native").then((n) => n.syncStatusBar(t));
  };
  return { theme, setTheme, toggle: () => setTheme(theme === "dark" ? "light" : "dark") };
}
