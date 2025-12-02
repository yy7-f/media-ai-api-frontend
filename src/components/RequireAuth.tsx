"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

/**
 * Wrap any page that should require sign-in.
 * If user is not authenticated, redirect to /login.
 */
export function RequireAuth({ children }: Props) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Preserve where they wanted to go (optional)
      const search = new URLSearchParams();
      if (pathname) search.set("next", pathname);
      router.push(`/login?${search.toString()}`);
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-sm text-gray-500">
        Checking your session…
      </div>
    );
  }

  if (status === "unauthenticated") {
    // We redirect in useEffect; render nothing here.
    return null;
  }

  return <>{children}</>;
}
