"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/slugify";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { TagInput } from "@/components/admin/TagInput";
import { FeaturedImagePicker } from "@/components/admin/FeaturedImagePicker";
import type { AdminCategory } from "@/types/category";
import type { AdminArticleDetail, CreatableArticleStatus } from "@/types/article";

function isEditorContentEmpty(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

const newsFormSchema = z.object({
  title: z.string().min(1, { error: "कृपया शीर्षक दर्ज करें।" }).max(300),
  slug: z
    .string()
    .min(1, { error: "कृपया स्लग दर्ज करें।" })
    .max(350)
    .regex(/^[\p{L}\p{N}-]+$/u, { error: "स्लग में केवल अक्षर, अंक और हाइफ़न (-) मान्य हैं।" }),
  categoryId: z.string().min(1, { error: "कृपया श्रेणी चुनें।" }),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().optional(),
  content: z
    .string()
    .refine((html) => !isEditorContentEmpty(html), { error: "कृपया समाचार सामग्री लिखें।" }),
  tags: z.array(z.string()).default([]),
  isBreaking: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof newsFormSchema>;

const EMPTY_VALUES: NewsFormValues = {
  title: "",
  slug: "",
  categoryId: "",
  excerpt: "",
  featuredImage: undefined,
  content: "",
  tags: [],
  isBreaking: false,
  isFeatured: false,
};

const inputClass =
  "w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50";
const labelClass = "mb-1.5 block text-sm font-medium text-ink-700";

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-bold tracking-wide text-ink-500 uppercase">{title}</h3>
      {children}
    </div>
  );
}

function NewsFormFields({
  categories,
  article,
  onSaved,
}: {
  categories: AdminCategory[];
  article?: AdminArticleDetail;
  onSaved: (message: string) => void;
}) {
  const router = useRouter();
  const isEditMode = Boolean(article);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<CreatableArticleStatus | null>(null);
  // In edit mode the slug already exists and should not be silently
  // rewritten just because the admin edits the title.
  const slugTouched = useRef(isEditMode);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: article
      ? {
          title: article.title,
          slug: article.slug,
          categoryId: article.category?.id ?? "",
          excerpt: article.excerpt ?? "",
          featuredImage: article.featuredImage ?? undefined,
          content: article.content,
          tags: article.tags,
          isBreaking: article.isBreaking,
          isFeatured: article.isFeatured,
        }
      : EMPTY_VALUES,
  });

  const titleValue = watch("title");
  const content = watch("content");
  const tags = watch("tags");
  const featuredImage = watch("featuredImage");

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setValue("title", value);
    if (!slugTouched.current) {
      setValue("slug", slugify(value));
    }
  }

  function handleSlugChange(event: ChangeEvent<HTMLInputElement>) {
    slugTouched.current = true;
    setValue("slug", event.target.value);
  }

  async function submitWithStatus(values: NewsFormValues, status: CreatableArticleStatus) {
    setPendingAction(status);
    setFormError(null);

    const url = isEditMode ? `/api/admin/articles/${article!.id}` : "/api/admin/articles";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, status }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? (isEditMode ? "खबर अपडेट नहीं हो सकी।" : "खबर सहेजी नहीं जा सकी।"));
        return;
      }

      const message =
        status === "published"
          ? "खबर सफलतापूर्वक प्रकाशित हो गई।"
          : isEditMode
            ? "खबर सफलतापूर्वक अपडेट हो गई।"
            : "खबर ड्राफ्ट के रूप में सहेजी गई।";
      onSaved(message);
      router.refresh();
    } catch {
      setFormError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="pb-24">
      {formError && (
        <p
          role="alert"
          className="mb-5 rounded-sm border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700"
        >
          {formError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main column — the content the reader actually sees. */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label htmlFor="title" className={labelClass}>
              शीर्षक
            </label>
            <input
              id="title"
              type="text"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.title)}
              className={`${inputClass} text-base`}
              placeholder="खबर का शीर्षक लिखें..."
              {...register("title")}
              value={titleValue}
              onChange={handleTitleChange}
            />
            {errors.title && <p className="mt-1.5 text-xs text-brand-700">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="slug" className={labelClass}>
              स्लग
            </label>
            <input
              id="slug"
              type="text"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.slug)}
              className={inputClass}
              {...register("slug")}
              onChange={handleSlugChange}
            />
            {errors.slug && <p className="mt-1.5 text-xs text-brand-700">{errors.slug.message}</p>}
          </div>

          <div>
            <label htmlFor="excerpt" className={labelClass}>
              संक्षिप्त विवरण <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <textarea
              id="excerpt"
              rows={2}
              disabled={isSubmitting}
              className={inputClass}
              placeholder="होमपेज और खोज परिणामों में दिखने वाला छोटा विवरण..."
              {...register("excerpt")}
            />
          </div>

          <div>
            <span className={labelClass}>समाचार सामग्री</span>
            <ArticleEditor
              value={content}
              onChange={(html) => setValue("content", html, { shouldValidate: true, shouldDirty: true })}
            />
            {errors.content && <p className="mt-1.5 text-xs text-brand-700">{errors.content.message}</p>}
          </div>
        </div>

        {/* Sidebar column — publishing metadata, kept visually separate from
            the article's actual content. */}
        <div className="space-y-4">
          <SidebarCard title="स्थिति">
            <p className="text-xs leading-relaxed text-ink-500">
              &quot;ड्राफ्ट के रूप में सहेजें&quot; दबाने पर यह खबर ड्राफ्ट रहेगी, या &quot;प्रकाशित करें&quot;
              दबाने पर तुरंत प्रकाशित हो जाएगी।
            </p>
          </SidebarCard>

          <SidebarCard title="श्रेणी">
            <select
              id="categoryId"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.categoryId)}
              className={inputClass}
              {...register("categoryId")}
            >
              <option value="" disabled>
                श्रेणी चुनें
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.categoryId.message}</p>
            )}
            {categories.length === 0 && (
              <p className="mt-1.5 text-xs text-ink-500">
                कोई श्रेणी उपलब्ध नहीं है।{" "}
                <Link href="/admin/categories/new" className="text-brand-700 hover:underline">
                  पहले एक श्रेणी बनाएं
                </Link>
                ।
              </p>
            )}
          </SidebarCard>

          <SidebarCard title="मुख्य फोटो">
            <FeaturedImagePicker
              value={featuredImage}
              onChange={(url) => setValue("featuredImage", url, { shouldDirty: true })}
              disabled={isSubmitting}
            />
          </SidebarCard>

          <SidebarCard title="टैग">
            <TagInput value={tags} onChange={(next) => setValue("tags", next, { shouldDirty: true })} />
          </SidebarCard>

          <SidebarCard title="प्रदर्शन">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded-sm border-ink-300 text-brand-700 focus:ring-brand-500"
                  {...register("isBreaking")}
                />
                ब्रेकिंग न्यूज़
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded-sm border-ink-300 text-brand-700 focus:ring-brand-500"
                  {...register("isFeatured")}
                />
                फीचर्ड न्यूज़
              </label>
            </div>
          </SidebarCard>
        </div>
      </div>

      {/* Sticky action bar — the publish action should always be reachable,
          without scrolling back up, no matter how long the article is. */}
      <div className="sticky bottom-0 -mx-4 mt-6 flex flex-wrap gap-3 border-t border-ink-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => submitWithStatus(values, "published"))}
          className="flex items-center justify-center gap-2 rounded-sm bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendingAction === "published" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          प्रकाशित करें
        </button>
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((values) => submitWithStatus(values, "draft"))}
          className="flex items-center justify-center gap-2 rounded-sm border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pendingAction === "draft" && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          ड्राफ्ट के रूप में सहेजें
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          disabled={isSubmitting}
          className="rounded-sm px-5 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          रद्द करें
        </button>
      </div>
    </div>
  );
}

export function NewsForm({
  categories,
  article,
}: {
  categories: AdminCategory[];
  article?: AdminArticleDetail;
}) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const isEditMode = Boolean(article);

  if (successMessage) {
    return (
      <div className="max-w-lg rounded-md border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">{successMessage}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {!isEditMode && (
            <button
              type="button"
              onClick={() => {
                setSuccessMessage(null);
                setFormKey((key) => key + 1);
              }}
              className="rounded-sm border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
            >
              एक और खबर जोड़ें
            </button>
          )}
          <Link
            href="/admin/news"
            className="rounded-sm bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            खबरों की सूची देखें
          </Link>
        </div>
      </div>
    );
  }

  return (
    <NewsFormFields key={formKey} categories={categories} article={article} onSaved={setSuccessMessage} />
  );
}
