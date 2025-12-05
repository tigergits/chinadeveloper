import { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content';
import { locales } from '@/i18n/request';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://chinadeveloper.net';
  const routes: MetadataRoute.Sitemap = [];

  // Add main pages for each locale
  for (const locale of locales) {
    routes.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });

    routes.push({
      url: `${baseUrl}/${locale}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    });

    routes.push({
      url: `${baseUrl}/${locale}/portfolios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    routes.push({
      url: `${baseUrl}/${locale}/skills`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });

    routes.push({
      url: `${baseUrl}/${locale}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    });

    routes.push({
      url: `${baseUrl}/${locale}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    });

    // Add portfolio pages
    const portfolios = await getAllContent('portfolios', locale as any);
    for (const portfolio of portfolios) {
      routes.push({
        url: `${baseUrl}/${locale}/portfolios/${portfolio.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  return routes;
}

