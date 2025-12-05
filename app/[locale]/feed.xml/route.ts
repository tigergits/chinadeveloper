import { Feed } from 'feed';
import { getAllContent } from '@/lib/content';
import { locales } from '@/i18n/request';

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

  const feed = new Feed({
    title: 'ChinaDeveloper Portfolio',
    description: 'Software development projects and updates',
    id: 'https://chinadeveloper.net',
    link: 'https://chinadeveloper.net',
    language: locale,
    copyright: `Copyright ${new Date().getFullYear()} ChinaDeveloper`,
    updated: new Date(),
  });

  try {
    const projects = await getAllContent('projects', locale as any);
    
    for (const project of projects.slice(0, 10)) {
      feed.addItem({
        title: project.metadata.title || project.slug,
        id: `https://chinadeveloper.net/${locale}/portfolio/${project.slug}`,
        link: `https://chinadeveloper.net/${locale}/portfolio/${project.slug}`,
        description: project.content.substring(0, 200),
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
