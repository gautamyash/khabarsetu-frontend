"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/slugify";
import type { AdminCategory } from "@/types/category";

const categorySchema = z.object({
  name: z.string().min(1, { error: "कृपया श्रेणी का नाम दर्ज करें।" }).max(100),
  slug: z
    .string()
    .min(1, { error: "कृपया स्लग दर्ज करें।" })
    .max(150)
    .regex(/^[\p{L}\p{N}-]+$/u, { error: "स्लग में केवल अक्षर, अंक और हाइफ़न (-) मान्य हैं।" }),
  description: z.string().max(2000).optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export function CategoryForm({ category }: { category?: AdminCategory }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  // Once the admin types directly into the slug field, stop auto-syncing it
  // from the name field.
  const slugTouched = useRef(Boolean(category));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
    },
  });

  const nameValue = watch("name");

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setValue("name", value);
    if (!slugTouched.current) {
      setValue("slug", slugify(value));
    }
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    slugTouched.current = true;
    setValue("slug", event.target.value);
  }

  async function onSubmit(values: CategoryFormValues) {
    setFormError(null);

    const url = category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
    const method = category ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "श्रेणी सहेजी नहीं जा सकी।");
        return;
      }

      router.push("/admin/categories");
      router.refresh();
    } catch {
      setFormError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-5">
      {formError && (
        <p
          role="alert"
          className="rounded-sm border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700"
        >
          {formError}
        </p>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink-700">
          नाम
        </label>
        <input
          id="name"
          type="text"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.name)}
          className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50"
          {...register("name")}
          value={nameValue}
          onChange={handleNameChange}
        />
        {errors.name && <p className="mt-1.5 text-xs text-brand-700">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="slug" className="mb-1.5 block text-sm font-medium text-ink-700">
          स्लग
        </label>
        <input
          id="slug"
          type="text"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.slug)}
          className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50"
          {...register("slug")}
          onChange={handleSlugChange}
        />
        {errors.slug && <p className="mt-1.5 text-xs text-brand-700">{errors.slug.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink-700">
          विवरण <span className="font-normal text-ink-400">(वैकल्पिक)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          disabled={isSubmitting}
          className="w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50"
          {...register("description")}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-sm bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          सहेजें
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          disabled={isSubmitting}
          className="rounded-sm border border-ink-200 px-5 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          रद्द करें
        </button>
      </div>
    </form>
  );
}
