import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Locale } from '@/i18n/request';
import { getShowcaseGroups } from '@/lib/showcase';
import { CardGrid } from '@/components/card-grid';
import { ShowcaseCard } from '@/components/showcase-card';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const isZhCN = locale === "zh-cn"
  const title = `${t('portfolios.title')} - Tiger Liu | China Developer`
  const description = isZhCN
    ? "Tiger Liu 打造的产品集合：浏览器扩展、Web 应用与独立游戏。AI 时代由资深全栈工程师快速交付的真实软件。"
    : "Products built by Tiger Liu — browser extensions, web apps and indie games. Real software shipped fast by a senior full-stack engineer in the AI era.";

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
  const groups = getShowcaseGroups(locale)

  const cardLabels = {
    install: t('portfolios.install'),
    comingSoon: t('portfolios.comingSoon'),
    details: t('portfolios.viewDetails'),
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isZhCN ? "首页" : "Home", "item": `${baseUrl}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": t('portfolios.title'), "item": `${baseUrl}/${locale}/portfolios` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-gradient-brand">{t("portfolios.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t("portfolios.subtitle")}</p>
        </div>

        {groups.map((group) => (
          <section key={group.key} className="mb-16 sm:mb-20">
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {t(`portfolios.categories.${group.key}`)}
              </h2>
              <span className="text-sm text-muted-foreground">
                {group.items.length} {t('portfolios.itemsCount')}
              </span>
            </div>
            <CardGrid columns={3} gap="lg">
              {group.items.map((card) => (
                <ShowcaseCard key={card.slug} card={card} locale={locale} labels={cardLabels} />
              ))}
            </CardGrid>
          </section>
        ))}

        {/* More — 旧作品集入口 */}
        <section className="rounded-2xl border border-border bg-card/50 p-8 sm:p-10">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{t('portfolios.moreTitle')}</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">{t('portfolios.moreDescription')}</p>
            </div>
            <Link
              href={`/${locale}/portfolios/more`}
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border border-border px-5 py-3 font-medium transition-colors hover:bg-foreground/5"
            >
              <span>{t('portfolios.moreCta')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}
