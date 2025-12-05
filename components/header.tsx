'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Twitter, Facebook, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

const socialLinks = [
  { name: 'GitHub', icon: Github, href: 'https://github.com' }
];

export default function Header() {
  const t = useTranslations('nav');
  const tHeader = useTranslations('header');
  const locale = useLocale();
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/portfolios`, label: t('portfolios') },
    { href: `/${locale}/skills`, label: t('skills') },
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="max-w-7xl mx-auto px-8 py-4">
				<div className="flex items-center justify-between">
					<Link href={`/${locale}`} className="flex flex-col">
						<span className="text-xl font-bold">{tHeader('brandName')}</span>
						<span className="text-xs text-muted-foreground hidden md:block">{tHeader('tagline')}</span>
					</Link>

					<nav className="hidden md:flex items-center space-x-6">
						{navItems.map((item) => {
							const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
							return (
								<Link
									key={item.href}
									href={item.href}
									className={cn(
										"text-sm font-medium transition-colors hover:text-foreground/80",
										isActive ? "text-foreground" : "text-foreground/60"
									)}
								>
									{item.label}
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
					</div>
				</div>
			</div>
		</header>
  )
}

