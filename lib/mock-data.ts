import type { Article, Category } from "@/types/news";

/**
 * Realistic mock data for Phase 1 UI development only.
 * This is NOT wired to the database — real API integration lands in a later phase.
 */

/**
 * Local, deterministic placeholder images — one per category, generated at
 * build time under `public/images/placeholders/`. Using local assets avoids
 * depending on an external image service (picsum.photos) during development,
 * which was timing out. next/image resizes these responsively per card via
 * `fill` + `sizes`, so a single source image per category is enough.
 */
function categoryImage(categorySlug: string): string {
  return `/images/placeholders/${categorySlug}.jpg`;
}

export const CATEGORIES: Category[] = [
  { id: "c1", name: "मध्यप्रदेश", slug: "madhya-pradesh" },
  { id: "c2", name: "राजनीति", slug: "rajniti" },
  { id: "c3", name: "देश", slug: "desh" },
  { id: "c4", name: "दुनिया", slug: "duniya" },
  { id: "c5", name: "व्यापार", slug: "vyapar" },
  { id: "c6", name: "खेल", slug: "khel" },
  { id: "c7", name: "मनोरंजन", slug: "manoranjan" },
  { id: "c8", name: "स्वास्थ्य", slug: "swasthya" },
];

const authors = [
  { id: "a1", name: "रवि शर्मा" },
  { id: "a2", name: "प्रिया वर्मा" },
  { id: "a3", name: "अंकित मिश्रा" },
  { id: "a4", name: "सुनीता पाटिल" },
];

function findCategory(slug: string): Category {
  return CATEGORIES.find((c) => c.slug === slug)!;
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

export const ARTICLES: Article[] = [
  {
    id: "1",
    title: "भोपाल में मेट्रो के पहले चरण का ट्रायल रन शुरू, यात्रियों में उत्साह",
    slug: "bhopal-metro-trial-run-shuru",
    excerpt:
      "राजधानी भोपाल में मेट्रो रेल परियोजना के पहले चरण का ट्रायल रन आज से शुरू हो गया। अधिकारियों के मुताबिक अगले तीन महीनों में यात्री सेवा शुरू करने का लक्ष्य रखा गया है।",
    featuredImage: categoryImage("madhya-pradesh"),
    category: findCategory("madhya-pradesh"),
    author: authors[0],
    isBreaking: true,
    isFeatured: true,
    publishedAt: hoursAgo(1),
  },
  {
    id: "2",
    title: "संसद के मानसून सत्र में आज पेश होंगे तीन अहम विधेयक",
    slug: "sansad-monsoon-satra-vidheyak",
    excerpt:
      "संसद के मौजूदा मानसून सत्र में आज सरकार तीन महत्वपूर्ण विधेयक पेश करेगी। विपक्ष ने चर्चा के लिए अतिरिक्त समय की मांग की है।",
    featuredImage: categoryImage("rajniti"),
    category: findCategory("rajniti"),
    author: authors[1],
    isBreaking: true,
    isFeatured: true,
    publishedAt: hoursAgo(2),
  },
  {
    id: "3",
    title: "जबलपुर में नई आईटी पार्क योजना को मिली मंजूरी, हजारों को मिलेगा रोजगार",
    slug: "jabalpur-it-park-yojana-manjoori",
    excerpt:
      "राज्य सरकार ने जबलपुर में नई आईटी पार्क परियोजना को हरी झंडी दे दी है। इससे क्षेत्र में करीब 15 हजार रोजगार के अवसर बनने की उम्मीद है।",
    featuredImage: categoryImage("madhya-pradesh"),
    category: findCategory("madhya-pradesh"),
    author: authors[2],
    isFeatured: true,
    publishedAt: hoursAgo(4),
  },
  {
    id: "4",
    title: "शेयर बाजार में तेजी जारी, सेंसेक्स ने बनाया नया रिकॉर्ड",
    slug: "share-bazar-sensex-record",
    excerpt:
      "घरेलू शेयर बाजार में लगातार पांचवें दिन तेजी देखी गई। सेंसेक्स और निफ्टी दोनों ने आज नया ऑल-टाइम हाई छुआ।",
    featuredImage: categoryImage("vyapar"),
    category: findCategory("vyapar"),
    author: authors[3],
    publishedAt: hoursAgo(3),
  },
  {
    id: "5",
    title: "भारत ने ऑस्ट्रेलिया को हराकर सीरीज पर किया कब्जा",
    slug: "bharat-australia-series-jeet",
    excerpt:
      "अंतिम मैच में शानदार प्रदर्शन करते हुए भारतीय टीम ने ऑस्ट्रेलिया को 6 विकेट से हराया और सीरीज 3-2 से अपने नाम की।",
    featuredImage: categoryImage("khel"),
    category: findCategory("khel"),
    author: authors[0],
    publishedAt: hoursAgo(5),
  },
  {
    id: "6",
    title: "नई फिल्म ने बॉक्स ऑफिस पर पहले दिन तोड़े सारे रिकॉर्ड",
    slug: "nai-film-box-office-record",
    excerpt:
      "इस हफ्ते रिलीज हुई फिल्म ने रिलीज के पहले ही दिन जबरदस्त कमाई की, ट्रेड एनालिस्ट्स इसे साल की सबसे बड़ी ओपनिंग मान रहे हैं।",
    featuredImage: categoryImage("manoranjan"),
    category: findCategory("manoranjan"),
    author: authors[1],
    publishedAt: hoursAgo(6),
  },
  {
    id: "7",
    title: "संयुक्त राष्ट्र में जलवायु परिवर्तन पर नई रिपोर्ट पेश",
    slug: "united-nations-jalvayu-report",
    excerpt:
      "संयुक्त राष्ट्र की नई रिपोर्ट में चेतावनी दी गई है कि अगले दशक में वैश्विक तापमान में और वृद्धि हो सकती है यदि तत्काल कदम नहीं उठाए गए।",
    featuredImage: categoryImage("duniya"),
    category: findCategory("duniya"),
    author: authors[2],
    publishedAt: hoursAgo(7),
  },
  {
    id: "8",
    title: "मानसून के दौरान बढ़े डेंगू के मामले, स्वास्थ्य विभाग अलर्ट",
    slug: "monsoon-dengue-swasthya-alert",
    excerpt:
      "राज्य में मानसून के साथ ही डेंगू के मामलों में इजाफा देखा जा रहा है। स्वास्थ्य विभाग ने सभी जिलों में विशेष निगरानी दल तैनात किए हैं।",
    featuredImage: categoryImage("swasthya"),
    category: findCategory("swasthya"),
    author: authors[3],
    publishedAt: hoursAgo(8),
  },
  {
    id: "9",
    title: "इंदौर स्वच्छता सर्वेक्षण में लगातार आठवीं बार अव्वल",
    slug: "indore-swachhata-survekshan-avval",
    excerpt:
      "स्वच्छता सर्वेक्षण के ताजा नतीजों में इंदौर ने एक बार फिर देश में पहला स्थान हासिल किया है, यह लगातार आठवां साल है।",
    featuredImage: categoryImage("madhya-pradesh"),
    category: findCategory("madhya-pradesh"),
    author: authors[0],
    publishedAt: hoursAgo(9),
  },
  {
    id: "10",
    title: "रिजर्व बैंक ने रेपो रेट में नहीं किया कोई बदलाव",
    slug: "rbi-repo-rate-no-change",
    excerpt:
      "भारतीय रिजर्व बैंक की मौद्रिक नीति समिति ने लगातार तीसरी बार रेपो रेट को यथावत रखने का फैसला किया है।",
    featuredImage: categoryImage("vyapar"),
    category: findCategory("vyapar"),
    author: authors[1],
    publishedAt: hoursAgo(10),
  },
  {
    id: "11",
    title: "ग्वालियर में नई सड़क परियोजना का शिलान्यास",
    slug: "gwalior-sadak-pariyojana-shilanyas",
    excerpt:
      "मुख्यमंत्री ने ग्वालियर में लगभग 200 करोड़ रुपये की लागत वाली सड़क परियोजना की आधारशिला रखी।",
    featuredImage: categoryImage("madhya-pradesh"),
    category: findCategory("madhya-pradesh"),
    author: authors[2],
    publishedAt: hoursAgo(12),
  },
  {
    id: "12",
    title: "ओलंपिक क्वालीफायर में भारतीय हॉकी टीम का शानदार प्रदर्शन",
    slug: "olympic-qualifier-hockey-team",
    excerpt:
      "भारतीय हॉकी टीम ने क्वालीफायर के अपने पहले मुकाबले में जीत दर्ज कर टूर्नामेंट की शानदार शुरुआत की।",
    featuredImage: categoryImage("khel"),
    category: findCategory("khel"),
    author: authors[3],
    publishedAt: hoursAgo(13),
  },
];

export function getBreakingArticles(): Article[] {
  return ARTICLES.filter((a) => a.isBreaking);
}

export function getFeaturedArticles(): Article[] {
  return ARTICLES.filter((a) => a.isFeatured);
}

export function getLatestArticles(limit = 8): Article[] {
  return [...ARTICLES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit);
}

export function getArticlesByCategory(slug: string): Article[] {
  return ARTICLES.filter((a) => a.category.slug === slug);
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
