import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/site-settings-api";
import { SITE_URL } from "@/lib/site-url";
import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  VISITOR_COOKIE_MAX_AGE_SECONDS,
} from "@/lib/analytics-tracking";

/**
 * Privacy Policy — required for Google AdSense review. Every technical
 * claim on this page is drawn directly from what the codebase actually
 * does (see components/analytics/PageViewTracker.tsx, lib/analytics-
 * tracking.ts, and the AdSense script in app/(public)/layout.tsx) rather
 * than generic invented claims: the two first-party cookies named and
 * their real lifetimes, the fact that no account/registration exists for
 * readers, and the real presence of the Google AdSense script. No specific
 * legal-compliance framework (e.g. GDPR/CCPA) is claimed, and no company
 * name, registration, or jurisdiction is asserted, since none of that
 * exists in this application's data model — this page describes practices,
 * not legal entity details.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = await getSiteSettings();
  const url = `${SITE_URL}/privacy`;
  const description = `${siteName} की गोपनीयता नीति।`;

  return {
    title: "गोपनीयता नीति",
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", title: `गोपनीयता नीति | ${siteName}`, description, url },
  };
}

const visitorCookieYears = Math.round(VISITOR_COOKIE_MAX_AGE_SECONDS / (60 * 60 * 24 * 365));
const sessionCookieMinutes = Math.round(SESSION_COOKIE_MAX_AGE_SECONDS / 60);

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <Container className="py-8 md:py-12">
      <div className="mb-8 border-b-2 border-on-surface pb-5">
        <div className="mb-2 flex items-center gap-2.5">
          <span className="h-[3px] w-9 shrink-0 bg-primary" aria-hidden />
          <span className="text-[11px] font-bold tracking-[0.18em] text-primary uppercase">जानकारी</span>
        </div>
        <h1 className="font-serif-hi text-[34px] leading-[1.1] font-black tracking-tight text-on-surface sm:text-[44px]">
          गोपनीयता नीति
        </h1>
      </div>

      <div className="article-content max-w-3xl">
        <p>
          यह गोपनीयता नीति बताती है कि {settings.siteName} इस वेबसाइट के उपयोग के दौरान किस प्रकार की
          जानकारी एकत्र करता है और उसका उपयोग कैसे किया जाता है।
        </p>

        <h2>कुकीज़ और एकत्रित जानकारी</h2>
        <p>
          पाठकों के लिए इस वेबसाइट पर कोई खाता या पंजीकरण आवश्यक नहीं है। पेज-व्यू जैसे बुनियादी उपयोग आँकड़े
          रखने के लिए यह वेबसाइट दो प्रकार की प्रथम-पक्ष (first-party) कुकीज़ का उपयोग करती है — एक विज़िटर
          पहचान कुकी (लगभग {visitorCookieYears} वर्ष तक मान्य) और एक सत्र (session) कुकी (लगभग{" "}
          {sessionCookieMinutes} मिनट तक निष्क्रियता पर मान्य)। दोनों कुकीज़ केवल यादृच्छिक (random) पहचान
          संख्या रखती हैं — इनमें नाम, ईमेल, फ़ोन नंबर या किसी अन्य व्यक्तिगत पहचान की जानकारी नहीं होती।
          इसके साथ ब्राउज़र/डिवाइस प्रकार और रेफ़रर जैसी सामान्य तकनीकी जानकारी भी दर्ज की जाती है, ताकि
          समझा जा सके कि वेबसाइट का उपयोग कैसे हो रहा है।
        </p>

        <h2>विज्ञापन (Google AdSense)</h2>
        <p>
          इस वेबसाइट पर Google AdSense के माध्यम से विज्ञापन प्रदर्शित किए जाते हैं। Google और उसके साझेदार
          कुकीज़ का उपयोग करके पाठकों की पिछली वेबसाइट यात्राओं के आधार पर विज्ञापन दिखा सकते हैं। Google के
          विज्ञापन-संबंधी कुकीज़ के उपयोग की जानकारी और उन्हें नियंत्रित करने के विकल्प इन आधिकारिक पृष्ठों
          पर उपलब्ध हैं:
        </p>
        <ul>
          <li>
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/technologies/ads
            </a>
          </li>
          <li>
            <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
              adssettings.google.com
            </a>
          </li>
        </ul>

        <h2>डेटा साझा करना</h2>
        <p>
          यह वेबसाइट पाठकों की व्यक्तिगत जानकारी किसी को बेचती नहीं है। ऊपर बताए गए Google AdSense के अलावा
          कोई अन्य तीसरा-पक्ष (third-party) विज्ञापन या ट्रैकिंग सेवा उपयोग नहीं की जाती।
        </p>

        <h2>बाहरी लिंक</h2>
        <p>
          इस वेबसाइट के लेखों में अन्य वेबसाइटों के लिंक हो सकते हैं। उन बाहरी वेबसाइटों की अपनी अलग
          गोपनीयता नीतियाँ होती हैं, जिनके लिए यह वेबसाइट उत्तरदायी नहीं है।
        </p>

        <h2>बच्चों की गोपनीयता</h2>
        <p>
          यह वेबसाइट सामान्य समाचार पाठकों के लिए है और जानबूझकर 13 वर्ष से कम आयु के बच्चों से कोई व्यक्तिगत
          जानकारी एकत्र नहीं करती।
        </p>

        <h2>नीति में बदलाव</h2>
        <p>
          समय-समय पर इस गोपनीयता नीति को अपडेट किया जा सकता है। किसी भी बदलाव के बाद भी यह पृष्ठ हमेशा
          वर्तमान नीति दर्शाएगा।
        </p>

        <h2>संपर्क</h2>
        <p>
          इस गोपनीयता नीति से जुड़े किसी भी प्रश्न के लिए कृपया{" "}
          <Link href="/contact">संपर्क करें</Link> पृष्ठ के माध्यम से संपर्क करें।
        </p>
      </div>
    </Container>
  );
}
