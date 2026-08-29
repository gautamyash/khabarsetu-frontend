import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/site-settings-api";
import { SITE_URL } from "@/lib/site-url";

/**
 * Terms of Use — required for Google AdSense review. Deliberately generic,
 * standard content-usage terms with no invented legal entity, registration,
 * or governing-law claim (none of that exists in this application's data
 * model, and inventing one was explicitly out of scope for this audit).
 */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  const url = `${SITE_URL}/terms`;
  const description = `${siteName} की उपयोग शर्तें।`;

  return {
    title: "उपयोग की शर्तें",
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title: `उपयोग की शर्तें | ${siteName}`, description, url },
  };
}

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-8 md:py-12">
      <div className="mb-8 border-b-2 border-on-surface pb-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="h-[3px] w-9 shrink-0 bg-primary" aria-hidden />
          <span className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">जानकारी</span>
        </div>
        <h1 className="font-serif-hi text-[34px] leading-[1.1] font-black tracking-tight text-on-surface sm:text-[44px]">
          उपयोग की शर्तें
        </h1>
      </div>

      <div className="article-content max-w-3xl">
        <p>
          {settings.siteName} का उपयोग करके, आप नीचे दी गई शर्तों से सहमत होते हैं। कृपया इस वेबसाइट का
          उपयोग करने से पहले इन्हें ध्यान से पढ़ें।
        </p>

        <h2>सामग्री का उपयोग</h2>
        <p>
          इस वेबसाइट पर प्रकाशित समाचार और सामग्री केवल व्यक्तिगत, गैर-व्यावसायिक उपयोग के लिए है। बिना
          लिखित अनुमति के सामग्री को पुनः प्रकाशित, प्रतिलिपि या वितरित नहीं किया जाना चाहिए।
        </p>

        <h2>सामग्री की सटीकता</h2>
        <p>
          समाचार को सटीक और अद्यतन रखने का प्रयास किया जाता है, फिर भी किसी भी जानकारी की पूर्ण सटीकता,
          पूर्णता या समयबद्धता की गारंटी नहीं दी जा सकती। किसी त्रुटि की सूचना{" "}
          <Link href="/contact">संपर्क</Link> पृष्ठ के माध्यम से दी जा सकती है, और आवश्यक सुधार किए जाएंगे।
        </p>

        <h2>बाहरी लिंक</h2>
        <p>
          इस वेबसाइट में अन्य वेबसाइटों के लिंक हो सकते हैं। उन बाहरी वेबसाइटों की सामग्री या नीतियों के लिए
          यह वेबसाइट उत्तरदायी नहीं है।
        </p>

        <h2>विज्ञापन</h2>
        <p>
          यह वेबसाइट Google AdSense के माध्यम से विज्ञापन प्रदर्शित करके संचालित होती है। अधिक जानकारी के
          लिए <Link href="/privacy">गोपनीयता नीति</Link> देखें।
        </p>

        <h2>दायित्व की सीमा</h2>
        <p>
          इस वेबसाइट के उपयोग से उत्पन्न किसी भी प्रत्यक्ष या अप्रत्यक्ष हानि के लिए यह वेबसाइट उत्तरदायी
          नहीं होगी, कानून द्वारा अनुमत सीमा तक।
        </p>

        <h2>शर्तों में बदलाव</h2>
        <p>
          इन शर्तों को समय-समय पर अपडेट किया जा सकता है। किसी भी बदलाव के बाद भी यह पृष्ठ हमेशा वर्तमान
          शर्तें दर्शाएगा।
        </p>

        <h2>संपर्क</h2>
        <p>
          इन शर्तों से जुड़े किसी भी प्रश्न के लिए कृपया <Link href="/contact">संपर्क करें</Link> पृष्ठ के
          माध्यम से संपर्क करें।
        </p>
      </div>
    </Container>
  );
}
