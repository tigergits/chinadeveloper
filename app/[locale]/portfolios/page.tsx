import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getAllContent } from '@/lib/content';
import { Locale } from '@/i18n/request';

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  const isZhCN = locale === "zh_CN"
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

  const isZhCN = locale === "zh_CN"
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
					Explore my collection of software projects and solutions
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
				{projects.map((project) => (
					<Link
						key={project.slug}
						href={`/${locale}/portfolios/${project.slug}`}
						className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex flex-col"
					>
						{project.metadata.cover && (
							<div className="relative w-full h-48 sm:h-56 overflow-hidden bg-muted">
								<Image
									src={"/assets/images/portfolios/" + project.slug + "/" + project.metadata.cover}
									alt={`${project.metadata.title || project.slug} - ${isZhCN ? "作品集项目" : "Portfolio project"} by Tiger Liu, China Developer`}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
						)}
						<div className="p-6 flex-1 flex flex-col">
							<h2 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
								{project.metadata.title || project.slug}
							</h2>
							{project.metadata.technologies && project.metadata.technologies.length > 0 && (
								<div className="flex flex-wrap gap-2 mb-4">
									{project.metadata.technologies.map((tech) => (
										<span 
											key={tech} 
											className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full border border-border/50"
										>
											{tech}
										</span>
									))}
								</div>
							)}
							<div className="mt-auto pt-4">
								<div className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all duration-300">
									<span>{t("portfolios.viewDetails")}</span>
									<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
								</div>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
    </>
  )
}

