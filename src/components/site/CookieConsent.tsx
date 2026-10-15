import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storeApi } from "@/lib/store-api";
import { toast } from "sonner";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void storeApi<{ noticeAcknowledged: boolean }>("/api/preferences")
      .then((result) => setVisible(!result.noticeAcknowledged))
      .catch(() => setVisible(true));
  }, []);
  async function acknowledge() {
    setBusy(true);
    try {
      await storeApi("/api/preferences", {});
      setVisible(false);
    } catch {
      toast.error("Your preference could not be saved. Check cookies and try again.");
    } finally {
      setBusy(false);
    }
  }
  if (!visible) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5"
      role="dialog"
      aria-label="Necessary-cookie notice"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-border bg-background/95 p-5 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            We use necessary cookies for your saved cart and secure sign-in. Your cart and notice
            preference are stored in the Manus database, not browser local storage.{" "}
            <Link
              to="/cookie-policy"
              className="font-medium text-primary underline underline-offset-2"
            >
              Cookie policy
            </Link>
            .
          </p>
        </div>
        <Button
          disabled={busy}
          size="sm"
          onClick={() => void acknowledge()}
          className="shrink-0 sm:ml-auto"
        >
          {busy ? "Saving…" : "Understood"}
        </Button>
      </div>
    </div>
  );
}
