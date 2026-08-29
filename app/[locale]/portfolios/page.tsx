import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale } from '@/i18n/request';
import { getAllShowcaseItems, getShowcaseCategoryKeys, toExplorerItem, localizeShowcase } from '@/lib/showcase';
import { getLegacyExplorerItems } from '@/lib/legacy-portfolio';
import { HireCta } from '@/components/hire-cta';
import { ShowcaseExplorer } from './showcase-explorer';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const isZhCN = locale === "zh-cn"
  const title = `${t('portfolios.title')} - Tiger Liu | China Developer`
  const description = isZhCN
    ? "Tiger Liu 打造的 40+ 产品与项目：浏览器扩展、SaaS、独立游戏与企业级客户项目。AI 时代由资深全栈工程师快速交付的真实软件。"
    : "40+ products and projects built by Tiger Liu — browser extensions, SaaS web apps, indie games and enterprise client work. Real software shipped fast by a senior full-stack engineer in the AI era.";

  const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`

  return {
    title,
    description,
    authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
    alternates: {
      canonical: `https://chinadeveloper.net/${locale}/portfolios`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://chinadeveloper.net/${locale}/portfolios`,
      siteName: "China Developer - Tiger Liu",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const isZhCN = locale === "zh-cn"
  const baseUrl = "https://chinadeveloper.net"

  // showcase（自动采集）+ 旧 markdown 项目（client 分类）合并为一个可筛选网格
  const showcaseItems = getAllShowcaseItems().map((it) => toExplorerItem(it, locale))
  const legacyItems = await getLegacyExplorerItems(locale)
  const items = [...showcaseItems, ...legacyItems]

  const categories = getShowcaseCategoryKeys()

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isZhCN ? "首页" : "Home", "item": `${baseUrl}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": t('portfolios.title'), "item": `${baseUrl}/${locale}/portfolios` },
    ],
  }

  // ItemList：帮助搜索引擎理解这是一个作品集列表
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": t('portfolios.title'),
    "numberOfItems": items.length,
    "itemListElement": getAllShowcaseItems().slice(0, 30).map((it, i) => {
      const c = localizeShowcase(it, locale)
      return {
        "@type": "ListItem",
        "position": i + 1,
        "name": c.name,
        "url": `${baseUrl}/${locale}/portfolios/showcase/${it.slug}`,
      }
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mb-10 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-gradient-brand">{t("portfolios.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t("portfolios.subtitle")}</p>
        </div>

        <ShowcaseExplorer items={items} categories={categories} />

        <HireCta locale={locale} />
      </div>
    </>
  )
}
