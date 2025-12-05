import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/feed.xml'],
      },
    ],
    sitemap: 'https://chinadeveloper.net/sitemap.xml',
  };
}

