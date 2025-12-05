# ChinaDeveloper Portfolios Website

A professional portfolios website built with Next.js, TypeScript, Tailwind CSS, and next-intl for multi-language support.

## Features

- 🌍 Multi-language support (English, Chinese, Spanish, French)
- 📱 Fully responsive design
- 🔍 SEO optimized with sitemap and robots.txt
- 📡 RSS feed support
- 🍪 GDPR-compliant cookie consent
- 📊 Umami
- 🎨 Modern, clean design

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- next-intl
- remark (Markdown processing)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Content Structure

All content is stored in the `content/` directory:

```
content/
  about/
	en.md
	zh_CN.md
	es.md
	fr.md
  portfolios/
    {slug}/
      en.md
      zh_CN.md
      ...
  services/
    {slug}/
      ...
  skills/
    {slug}/
      ...
```
