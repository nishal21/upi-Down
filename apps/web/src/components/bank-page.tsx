"use client";

import { useRouter } from "next/navigation";
import { bankSlug } from "@/lib/config";
import { BankPanel } from "./bank-panel";

export function BankPage({ bankId }: { bankId: string }) {
  const router = useRouter();
  return <BankPanel bankId={bankId} onPickBank={(id) => router.push(`/${bankSlug(id)}/`)} />;
}
