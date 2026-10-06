"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useT } from "@/lib/i18n";

/** Shown on about/privacy so the app (and mobile web) can get back to the board. */
export function BackHome() {
  const { t } = useT();
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-base-300 bg-base-200 px-3 text-sm font-semibold hover:border-base-content"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
        {t.goHome}
      </Link>
    </div>
  );
}
