import { MetadataRoute } from 'next';
import { getAllContent } from '@/lib/content';
import { getAllShowcaseItems } from '@/lib/showcase';
import { getAllBlogPosts, BLOG_LOCALE } from '@/lib/blog';
import { locales } from '@/i18n/request';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://chinadeveloper.net';
  const routes: MetadataRoute.Sitemap = [];

  // 博客是单语英文，只在 en 下产出 URL（草稿不进 sitemap）
  const blogPosts = getAllBlogPosts();
  if (blogPosts.length > 0) {
    routes.push({
      url: `${baseUrl}/${BLOG_LOCALE}/blog`,
      lastModified: new Date(blogPosts[0].updated),
      changeFrequency: 'weekly',
      priority: 0.9,
    });
    for (const post of blogPosts) {
      routes.push({
        url: `${baseUrl}/${BLOG_LOCALE}/blog/${post.slug}`,
        lastModified: new Date(post.updated),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

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

    // 旧 markdown 作品集详情页（按英文清单遍历，缺语言文件时页面回退英文，URL 仍有效）
    const portfolios = await getAllContent('portfolios', 'en');
    for (const portfolio of portfolios) {
      routes.push({
        url: `${baseUrl}/${locale}/portfolios/${portfolio.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    // showcase 产品详情页 + 扩展隐私页
    for (const item of getAllShowcaseItems()) {
      routes.push({
        url: `${baseUrl}/${locale}/portfolios/${item.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
      if (item.privacyMarkdown) {
        routes.push({
          url: `${baseUrl}/${locale}/portfolios/${item.slug}/privacy`,
          lastModified: new Date(),
          changeFrequency: 'yearly',
          priority: 0.3,
        });
      }
    }
  }

  return routes;
}

