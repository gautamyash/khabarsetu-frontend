"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/** `variant="dark"` for the dark sidebar/drawer chrome; `variant="light"`
 * (default) for anywhere still on a white background. */
export function LogoutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        variant === "dark"
          ? "text-ink-300 hover:bg-white/5 hover:text-white"
          : "text-ink-700 hover:bg-brand-50 hover:text-brand-700"
      )}
    >
      <LogOut className="h-4 w-4" />
      लॉग आउट
    </button>
  );
}
