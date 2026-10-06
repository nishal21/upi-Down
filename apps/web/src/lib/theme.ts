"use client";

import { createStored } from "./store";

export type Theme = "dark" | "light";

const stored = createStored<Theme>("upidown-theme", "dark");

export const THEME_SCRIPT = `try{var d=document.documentElement,t=JSON.parse(localStorage.getItem("upidown-theme")||'"dark"');d.dataset.theme="upidown-"+t;var l=JSON.parse(localStorage.getItem("upidown-lang")||"null");if(l){d.lang=l+"-IN";d.dir=l==="ur"?"rtl":"ltr"}var host="";try{host=location.hostname||""}catch(e){}var cap=window.Capacitor;var native=(cap&&typeof cap.isNativePlatform==="function"&&cap.isNativePlatform())||host==="app.upidown.nishal.dev";if(native){d.classList.add("native");var ob=localStorage.getItem("upidown-onboarded");if(ob!=="true")d.classList.add("needs-onboard");var seen="";try{seen=sessionStorage.getItem("upidown-splash-seen")||""}catch(e){}if(seen!=="1"){d.classList.add("needs-splash");var cover=document.createElement("div");cover.id="upidown-boot-cover";cover.setAttribute("aria-hidden","true");cover.style.cssText="position:fixed;inset:0;z-index:2147483646;background:#0f110e";(document.body||d).appendChild(cover)}if(!d.style.getPropertyValue("--safe-area-inset-top")){d.style.setProperty("--safe-area-inset-top","32px");d.style.setProperty("--safe-area-inset-bottom","20px")}}}catch(e){}`;

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
