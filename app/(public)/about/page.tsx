import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { listCategories } from "@/lib/categories-api";
import { getSiteSettings } from "@/lib/site-settings-api";
import { SITE_URL } from "@/lib/site-url";
import type { AdminCategory } from "@/types/category";

/**
 * About page — a required trust/AdSense-readiness page (see the site-wide
 * technical audit). Deliberately built only from data this application
 * already has: the configurable site name/description (site_settings,
 * admin-editable) and the real category list. No staff bios, history,
 * awards, or company/legal details are invented — none of that exists in
 * this application's data model, so none of it is claimed here.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  const url = `${SITE_URL}/about`;
  const description = `${siteName} के बारे में जानकारी।`;

  return {
    title: "हमारे बारे में",
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title: `हमारे बारे में | ${siteName}`, description, url },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  let categories: AdminCategory[] = [];
  try {
    categories = await listCategories();
  } catch {
    categories = [];
  }

  return (
    <Container className="py-8 md:py-12">
      <div className="mb-8 border-b-2 border-on-surface pb-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="h-[3px] w-9 shrink-0 bg-primary" aria-hidden />
          <span className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">जानकारी</span>
        </div>
        <h1 className="font-serif-hi text-[34px] leading-[1.1] font-black tracking-tight text-on-surface sm:text-[44px]">
          हमारे बारे में
        </h1>
      </div>

      <div className="article-content max-w-3xl">
        <p>
          <strong>{settings.siteName}</strong>
          {settings.siteDescription ? ` ${settings.siteDescription}` : " एक हिंदी समाचार वेबसाइट है।"}
        </p>

        <p>
          इस वेबसाइट पर विभिन्न श्रेणियों में समाचार प्रकाशित किए जाते हैं, जिन्हें पाठक श्रेणी के अनुसार
          खोज और पढ़ सकते हैं
          {categories.length > 0 && (
            <>
              , जैसे:{" "}
              {categories.map((category, index) => (
                <span key={category.slug}>
                  <Link href={`/category/${category.slug}`} className="text-primary underline underline-offset-2">
                    {category.name}
                  </Link>
                  {index < categories.length - 1 ? ", " : ""}
                </span>
              ))}
            </>
          )}
          ।
        </p>

        <p>
          यह वेबसाइट Google AdSense के माध्यम से विज्ञापन प्रदर्शित करके संचालित होती है। समाचार की सटीकता
          बनाए रखने का प्रयास किया जाता है; किसी त्रुटि या सुधार की जानकारी के लिए कृपया{" "}
          <Link href="/contact" className="text-primary underline underline-offset-2">
            संपर्क करें
          </Link>{" "}
          पृष्ठ के माध्यम से हमें सूचित करें।
        </p>
      </div>
    </Container>
  );
}
