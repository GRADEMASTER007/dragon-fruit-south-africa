import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "dfsa-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const dismiss = (value: "accepted" | "dismissed") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5" role="dialog" aria-label="Cookie consent">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-border bg-background/95 p-5 shadow-lg backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            We use cookies to keep your cart working and to understand how the site is used. See our{" "}
            <Link to="/cookie-policy" className="font-medium text-primary underline underline-offset-2">
              Cookie Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          <Button size="sm" onClick={() => dismiss("accepted")}>
            Accept
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Dismiss cookie notice"
            onClick={() => dismiss("dismissed")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
