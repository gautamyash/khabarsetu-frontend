"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, { error: "कृपया ईमेल दर्ज करें।" }),
  password: z.string().min(1, { error: "कृपया पासवर्ड दर्ज करें।" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "ईमेल या पासवर्ड गलत है।");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setFormError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {formError && (
        <p
          role="alert"
          className="rounded-sm border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700"
        >
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-700">
          ईमेल
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50"
          {...register("email")}
        />
        {errors.email && <p className="mt-1.5 text-xs text-brand-700">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-700">
          पासवर्ड
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.password)}
          className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50"
          {...register("password")}
        />
        {errors.password && <p className="mt-1.5 text-xs text-brand-700">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-sm bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        लॉगिन
      </button>
    </form>
  );
}
