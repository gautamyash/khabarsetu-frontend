"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Contact, Globe, Loader2, Share2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FeaturedImagePicker } from "@/components/admin/FeaturedImagePicker";
import type { SiteSettings } from "@/types/site-settings";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/\S+$/i;

const optionalText = (max: number) => z.string().trim().max(max).optional();

const settingsSchema = z.object({
  siteName: z.string().trim().min(1, { error: "कृपया साइट का नाम दर्ज करें।" }).max(150),
  siteDescription: optionalText(2000),
  logoUrl: optionalText(500),
  contactEmail: optionalText(255).refine((v) => !v || EMAIL_PATTERN.test(v), {
    error: "मान्य ईमेल पता दर्ज करें।",
  }),
  phone: optionalText(50),
  address: optionalText(2000),
  facebookUrl: optionalText(500).refine((v) => !v || URL_PATTERN.test(v), {
    error: "मान्य URL दर्ज करें (http:// या https:// से शुरू)।",
  }),
  instagramUrl: optionalText(500).refine((v) => !v || URL_PATTERN.test(v), {
    error: "मान्य URL दर्ज करें (http:// या https:// से शुरू)।",
  }),
  youtubeUrl: optionalText(500).refine((v) => !v || URL_PATTERN.test(v), {
    error: "मान्य URL दर्ज करें (http:// या https:// से शुरू)।",
  }),
  twitterUrl: optionalText(500).refine((v) => !v || URL_PATTERN.test(v), {
    error: "मान्य URL दर्ज करें (http:// या https:// से शुरू)।",
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function toDefaultValues(settings: SiteSettings): SettingsFormValues {
  return {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription ?? "",
    logoUrl: settings.logoUrl ?? "",
    contactEmail: settings.contactEmail ?? "",
    phone: settings.phone ?? "",
    address: settings.address ?? "",
    facebookUrl: settings.facebookUrl ?? "",
    instagramUrl: settings.instagramUrl ?? "",
    youtubeUrl: settings.youtubeUrl ?? "",
    twitterUrl: settings.twitterUrl ?? "",
  };
}

const inputClass =
  "w-full rounded-sm border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-ink-50";

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 border-b border-ink-100 pb-3 text-sm font-bold tracking-wide text-ink-900 uppercase">
      <Icon className="h-4 w-4 text-brand-700" aria-hidden />
      {children}
    </h2>
  );
}

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toDefaultValues(settings),
  });

  const logoUrl = watch("logoUrl");

  async function onSubmit(values: SettingsFormValues) {
    setFormError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setFormError(data?.message ?? "सेटिंग्स सहेजी नहीं जा सकीं।");
        return;
      }

      setSuccessMessage("सेटिंग्स सफलतापूर्वक सहेजी गईं।");
      router.refresh();
    } catch {
      setFormError("सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-2xl space-y-8">
      {formError && (
        <p
          role="alert"
          className="rounded-sm border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700"
        >
          {formError}
        </p>
      )}
      {successMessage && (
        <p
          role="status"
          className="rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          {successMessage}
        </p>
      )}

      <div className="rounded-md border border-ink-200 bg-white p-5">
        <SectionHeading icon={Globe}>बुनियादी जानकारी</SectionHeading>
        <div className="space-y-5">
          <div>
            <label htmlFor="siteName" className="mb-1.5 block text-sm font-medium text-ink-700">
              साइट का नाम
            </label>
            <input
              id="siteName"
              type="text"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.siteName)}
              className={inputClass}
              {...register("siteName")}
            />
            {errors.siteName && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.siteName.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="siteDescription"
              className="mb-1.5 block text-sm font-medium text-ink-700"
            >
              साइट का विवरण <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <textarea
              id="siteDescription"
              rows={3}
              disabled={isSubmitting}
              className={inputClass}
              {...register("siteDescription")}
            />
          </div>

          <div>
            <p className="mb-1.5 block text-sm font-medium text-ink-700">
              साइट लोगो <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </p>
            <FeaturedImagePicker
              value={logoUrl || undefined}
              onChange={(url) => setValue("logoUrl", url ?? "", { shouldDirty: true })}
              disabled={isSubmitting}
              label="साइट लोगो"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-ink-200 bg-white p-5">
        <SectionHeading icon={Contact}>संपर्क जानकारी</SectionHeading>
        <div className="space-y-5">
          <div>
            <label htmlFor="contactEmail" className="mb-1.5 block text-sm font-medium text-ink-700">
              संपर्क ईमेल <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <input
              id="contactEmail"
              type="email"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.contactEmail)}
              className={inputClass}
              {...register("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.contactEmail.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-700">
              फोन नंबर <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <input
              id="phone"
              type="text"
              disabled={isSubmitting}
              className={inputClass}
              {...register("phone")}
            />
          </div>

          <div>
            <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-ink-700">
              पता <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <textarea
              id="address"
              rows={2}
              disabled={isSubmitting}
              className={inputClass}
              {...register("address")}
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border border-ink-200 bg-white p-5">
        <SectionHeading icon={Share2}>सोशल मीडिया लिंक</SectionHeading>
        <div className="space-y-5">
          <div>
            <label htmlFor="facebookUrl" className="mb-1.5 block text-sm font-medium text-ink-700">
              Facebook URL <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <input
              id="facebookUrl"
              type="url"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.facebookUrl)}
              className={inputClass}
              placeholder="https://facebook.com/..."
              {...register("facebookUrl")}
            />
            {errors.facebookUrl && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.facebookUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="instagramUrl" className="mb-1.5 block text-sm font-medium text-ink-700">
              Instagram URL <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <input
              id="instagramUrl"
              type="url"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.instagramUrl)}
              className={inputClass}
              placeholder="https://instagram.com/..."
              {...register("instagramUrl")}
            />
            {errors.instagramUrl && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.instagramUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="youtubeUrl" className="mb-1.5 block text-sm font-medium text-ink-700">
              YouTube URL <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <input
              id="youtubeUrl"
              type="url"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.youtubeUrl)}
              className={inputClass}
              placeholder="https://youtube.com/..."
              {...register("youtubeUrl")}
            />
            {errors.youtubeUrl && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.youtubeUrl.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="twitterUrl" className="mb-1.5 block text-sm font-medium text-ink-700">
              Twitter/X URL <span className="font-normal text-ink-400">(वैकल्पिक)</span>
            </label>
            <input
              id="twitterUrl"
              type="url"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.twitterUrl)}
              className={inputClass}
              placeholder="https://x.com/..."
              {...register("twitterUrl")}
            />
            {errors.twitterUrl && (
              <p className="mt-1.5 text-xs text-brand-700">{errors.twitterUrl.message}</p>
            )}
          </div>
        </div>
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
      </div>
    </form>
  );
}
