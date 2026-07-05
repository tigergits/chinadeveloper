import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllContent } from '@/lib/content';
import { Locale } from '@/i18n/request';
import PortfolioClient from '../PortfolioClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const isZhCN = locale === "zh-cn"
  const title = `${t('portfolios.moreTitle')} - Tiger Liu | China Developer`
  const description = isZhCN
    ? "Tiger Liu 早期与企业级软件项目作品集：高铁仿真、教育云、交易系统等 30 年全栈项目案例。"
    : "Tiger Liu's earlier and enterprise software projects — high-speed rail simulation, education cloud, trading systems and more from 30 years of full-stack work.";

  const ogImageUrl = `https://chinadeveloper.net/assets/images/og-image.png`

  return {
    title,
    description,
    authors: [{ name: "Tiger Liu", url: "https://chinadeveloper.net" }],
    alternates: {
      canonical: `https://chinadeveloper.net/${locale}/portfolios/more`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://chinadeveloper.net/${locale}/portfolios/more`,
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

export default async function MorePortfolioPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const projects = await getAllContent('portfolios', locale);

  const isZhCN = locale === "zh-cn"
  const baseUrl = "https://chinadeveloper.net"

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": isZhCN ? "首页" : "Home", "item": `${baseUrl}/${locale}` },
      { "@type": "ListItem", "position": 2, "name": t('portfolios.title'), "item": `${baseUrl}/${locale}/portfolios` },
      { "@type": "ListItem", "position": 3, "name": t('portfolios.moreTitle'), "item": `${baseUrl}/${locale}/portfolios/more` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <Link
          href={`/${locale}/portfolios`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('portfolios.backToShowcase')}
        </Link>
        <div className="mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-gradient-brand">{t("portfolios.moreTitle")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">{t("portfolios.moreDescription")}</p>
        </div>
        <PortfolioClient
          projects={projects}
          locale={locale}
          isZhCN={isZhCN}
          translations={{
            filterTechnologies: isZhCN ? "筛选技术栈" : "Filter by Technologies",
            clearFilters: isZhCN ? "清除筛选" : "Clear filters",
            noProjectsFound: isZhCN ? "未找到项目" : "No projects found",
            viewDetails: t("portfolios.viewDetails"),
            projectsFound: isZhCN ? "个项目" : "projects found",
            projectFound: isZhCN ? "个项目" : "project found"
          }}
        />
      </div>
    </>
  )
}
