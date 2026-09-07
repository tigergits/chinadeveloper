import { Feed } from 'feed';
import { getAllContent } from '@/lib/content';
import { locales, type Locale } from '@/i18n/request';
import { getAllShowcaseItems, localizeShowcase } from '@/lib/showcase';
import { getAllBlogPosts, BLOG_LOCALE } from '@/lib/blog';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    return new Response('Not Found', { status: 404 });
  }

  const baseUrl = 'https://chinadeveloper.net';
  const feed = new Feed({
    title: 'ChinaDeveloper Portfolio',
    description: 'Software development projects and updates',
    id: baseUrl,
    link: baseUrl,
    language: locale,
    copyright: `Copyright ${new Date().getFullYear()} ChinaDeveloper`,
    updated: new Date(),
  });

  try {
    // 博客文章（单语英文，只进英文 feed），按日期倒序排在最前
    if (locale === BLOG_LOCALE) {
      for (const post of getAllBlogPosts()) {
        const url = `${baseUrl}/${BLOG_LOCALE}/blog/${post.slug}/`;
        feed.addItem({
          title: post.title,
          id: url,
          link: url,
          description: post.description,
          date: new Date(`${post.updated}T00:00:00Z`),
          author: [{ name: 'Tiger Liu', link: baseUrl }],
          category: post.tags.map((name) => ({ name })),
        });
      }
    }

    // showcase 产品（自动采集）
    for (const item of getAllShowcaseItems()) {
      const c = localizeShowcase(item, locale as Locale);
      const url = `${baseUrl}/${locale}/portfolios/${item.slug}`;
      feed.addItem({
        title: c.name,
        id: url,
        link: url,
        description: c.short || c.tagline || c.name,
        date: new Date(),
      });
    }

    // 旧 markdown 作品集
    const portfolios = await getAllContent('portfolios', locale as Locale);
    for (const portfolio of portfolios) {
      const url = `${baseUrl}/${locale}/portfolios/${portfolio.slug}`;
      feed.addItem({
        title: portfolio.metadata.title || portfolio.slug,
        id: url,
        link: url,
        description: portfolio.content.substring(0, 200),
        date: new Date(),
      });
    }
  } catch (error) {
    console.error('Error generating feed:', error);
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
