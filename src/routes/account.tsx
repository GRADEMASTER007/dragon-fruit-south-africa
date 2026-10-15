import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { storeApi } from "@/lib/store-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Account = {
  user: { id: string; openId: string; name: string; email: string; role: string } | null;
  administratorConfigured: boolean;
};
export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [{ title: "Your DFSA Account" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = () =>
    storeApi<Account>("/api/account")
      .then(setAccount)
      .catch((error) => setError(error.message));
  useEffect(() => {
    void refresh();
  }, []);
  async function signIn() {
    setBusy(true);
    try {
      const result = await storeApi<{ url: string }>("/api/auth/start", {
        origin: window.location.origin,
      });
      window.location.assign(result.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start sign-in.");
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    try {
      await storeApi("/api/auth/logout", {});
      await refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">DFSA account</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Your growing journey.</h1>
      {!account && !error && (
        <p className="mt-6" role="status">
          Checking your signed-in session…
        </p>
      )}
      {error && (
        <p className="mt-6 text-destructive" role="alert">
          {error}
        </p>
      )}
      {typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).get("login") === "failed" && (
          <p role="alert" className="mt-6 text-destructive">
            Sign-in could not be completed. Cookies or the callback were not accepted. Open this
            site in a standalone tab and try again.
          </p>
        )}
      {account && !account.user && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <p className="text-muted-foreground">
            Sign in securely with your Manus account. Shopping and quotation requests do not require
            login.
          </p>
          <Button disabled={busy} onClick={signIn} className="mt-5">
            {busy ? "Opening sign-in…" : "Sign in with Manus"}
          </Button>
        </section>
      )}
      {account?.user && (
        <section className="mt-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-xl">{account.user.name || "Signed in"}</h2>
          <p className="mt-2 text-muted-foreground">{account.user.email}</p>
          <p className="mt-4 break-all text-xs text-muted-foreground">
            Verified Manus identity: {account.user.openId}
          </p>
          <p className="mt-2 text-sm">Role: {account.user.role}</p>
          {account.user.role === "admin" && (
            <Button asChild className="mt-5">
              <Link to="/admin">Open administration</Link>
            </Button>
          )}
          <Button disabled={busy} variant="outline" onClick={signOut} className="ml-3 mt-5">
            Sign out
          </Button>
        </section>
      )}
      {account && !account.administratorConfigured && (
        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Administrator access is not configured yet. The owner must authorize their verified Manus
          identity in the protected DFSA_ADMIN_OPEN_IDS setting. The first visitor is never
          automatically made an administrator.
        </p>
      )}
      <Link to="/shop" className="mt-8 inline-block text-primary">
        Browse the collection →
      </Link>
    </div>
  );
}
