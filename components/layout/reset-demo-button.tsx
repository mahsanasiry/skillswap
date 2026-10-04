"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export function ResetDemoButton() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function reset() {
    setBusy(true);
    try {
      await api.resetDemoData();
      await queryClient.invalidateQueries();
      setMessage("Demo data was reset.");
    } catch {
      setMessage("The demo data could not be reset. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="sm" onClick={reset} disabled={busy}>
        Reset demo data
      </Button>
      <span role="status" className="text-sm text-ink-soft">
        {message}
      </span>
    </div>
  );
}
