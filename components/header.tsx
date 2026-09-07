'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com/tigergits' }
];

export default function Header() {
  const t = useTranslations('nav');
  const tHeader = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/portfolios`, label: t('portfolios') },
    // 博客是单语英文，任何语言下都指向 /en/blog
    { href: `/en/blog`, label: t('blog') },
    { href: `/${locale}/skills`, label: t('skills') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
		<header className="sticky top-0 z-50 w-full border-b border-border/60 glass">
			<div className="max-w-7xl mx-auto px-8 py-4">
				<div className="flex items-center justify-between">
					<Link href={`/${locale}`} className="flex flex-col">
						<span className="text-xl font-bold text-gradient-brand">{tHeader('brandName')}</span>
						<span className="text-xs text-muted-foreground hidden md:block">{tHeader('tagline')}</span>
					</Link>

					<nav className="hidden md:flex items-center space-x-1">
						{navItems.map((item) => {
							const isHome = item.href === `/${locale}`
							const isActive = isHome
								? pathname === item.href || pathname === `${item.href}/`
								: pathname === item.href || pathname.startsWith(item.href + "/")
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"relative px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:text-foreground hover:bg-muted/60",
										isActive ? "text-primary" : "text-foreground/60"
									)}
								>
									{item.label}
									{isActive && (
										<span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
									)}
								</Link>
							)
						})}
					</nav>

					<div className="flex items-center space-x-4">
						<div className="hidden md:flex items-center space-x-2">
							{socialLinks.map((social) => {
								const Icon = social.icon
								return (
									<a
										key={social.name}
										href={social.href}
										target="_blank"
										rel="noopener noreferrer"
										className="text-foreground/60 hover:text-foreground transition-colors"
										aria-label={social.name}
									>
										<Icon className="h-5 w-5" />
									</a>
								)
							})}
						</div>

						<ThemeToggle />
						<LanguageSwitcher />
						<Link
							href={`/${locale}/contact`}
							className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:scale-105 hover:shadow-lg"
						>
							<Briefcase className="h-4 w-4" />
							{tHeader('hireMe')}
						</Link>
					</div>
				</div>
			</div>
		</header>
  )
}

