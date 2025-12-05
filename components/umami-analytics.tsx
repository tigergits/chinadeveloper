'use client';

import Script from 'next/script';

export default function UmamiAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const websiteId =
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ?? '763d48d1-25d6-4bae-8f2b-3dfefe65c1ad';

  if (!websiteId) {
    return null;
  }

  return (
    <Script
      src="https://cloud.umami.is/script.js"
      strategy="lazyOnload"
      data-website-id={websiteId}
    />
  );
}

