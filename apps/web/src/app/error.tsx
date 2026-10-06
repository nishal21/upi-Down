"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4">
      <ErrorScreen code="ERR" onRetry={retry} />
    </div>
  );
}
