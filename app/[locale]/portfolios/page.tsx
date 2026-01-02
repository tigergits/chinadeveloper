import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllContent } from '@/lib/content';
import { Locale } from '@/i18n/request';
import PortfolioClient from './PortfolioClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const isZhCN = locale === "zh-cn"
  const title = `${t('portfolios.title')} - Tiger Liu | China Developer`
  const description = isZhCN
    ? "浏览 Tiger Liu 的软件项目作品集。China Developer 展示25+年经验的全栈开发工程师的专业项目案例。"
    : "Browse Tiger Liu's portfolio of software projects. China Developer showcases professional project cases from a Senior Full-Stack Developer with 25+ years of experience.";

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
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
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
  const projects = await getAllContent('portfolios', locale);

  const isZhCN = locale === "zh-cn"
  const baseUrl = "https://chinadeveloper.net"
  
  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": isZhCN ? "首页" : "Home",
        "item": `${baseUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": isZhCN ? "作品集" : "Portfolios",
        "item": `${baseUrl}/${locale}/portfolios`,
      },
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
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">{t("portfolios.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {isZhCN 
              ? "探索我的软件项目和解决方案集合" 
              : "Explore my collection of software projects and solutions"}
          </p>
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

