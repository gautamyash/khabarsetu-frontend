import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "लॉगिन",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif-hi text-2xl font-bold text-ink-900">
            {SITE_NAME}
          </Link>
        </div>

        <div className="rounded-md border border-ink-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-serif-hi mb-6 text-center text-2xl font-bold text-ink-900">
            व्यवस्थापक लॉगिन
          </h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
