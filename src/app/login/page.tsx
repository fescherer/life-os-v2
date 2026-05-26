"use client";

import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const nextPath = searchParams.get("next") || "/";

  function loginWithGoogle() {
    startTransition(async () => {
      const callbackUrl = new URL("/auth/callback", window.location.origin);

      callbackUrl.searchParams.set("next", nextPath);

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });
    });
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="border-border bg-card text-card-foreground grid w-full max-w-sm gap-6 rounded-md border p-6 shadow-sm">
        <div>
          <div className="bg-primary text-primary-foreground mb-4 flex size-10 items-center justify-center rounded-md text-sm font-semibold">
            LO
          </div>
          <h1 className="text-2xl font-semibold">Life OS</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sign in to manage your personal workspace.
          </p>
        </div>

        <Button type="button" onClick={loginWithGoogle} disabled={isPending}>
          <LogIn className="size-4" />
          {isPending ? "Opening Google..." : "Continue with Google"}
        </Button>
      </section>
    </main>
  );
}
