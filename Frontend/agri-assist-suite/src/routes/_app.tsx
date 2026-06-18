import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell } from "@/components/SiteShell";
import { useAuth } from "@/lib/auth";
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, router]);

  if (loading || !isAuthenticated) {
    return (
      <SiteShell>
        <Loader label="Loading…" />
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
