"use client"

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Github, Linkedin, Mail, Facebook, Youtube, X, ArrowRight, Zap } from "lucide-react"

interface ContactItem {
  name: string;
  value: string;
}

interface HeroSectionProps {
  contactInfo?: ContactItem[];
}

const iconMap: Record<string, typeof Github> = {
  'GitHub': Github,
  'X': X,
  'Twitter': X,
  'Facebook': Facebook,
  'YouTube': Youtube,
  'LinkedIn': Linkedin,
  'Email': Mail,
};

export function HeroSection({ contactInfo = [] }: HeroSectionProps) {
  const t = useTranslations('home')
  const locale = useLocale()

  // Get email and social links from contact info
  const email = contactInfo.find(item => item.name === 'Email');
  const socialLinks = contactInfo.filter(item => item.name !== 'Email' && iconMap[item.name]);

  const getAvatarText = () => {
    return locale === 'zh-cn' ? '虎' : 'Tiger'
  }

  // Capability tags (array) from i18n
  const tags = (t.raw('tags') as string[] | undefined) ?? []

  return (
    <section className="relative px-6 py-20 md:py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Eyebrow + Avatar */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-6 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent/30 ring-2 ring-primary/20 shadow-xl overflow-hidden">
            <Image
              src="/assets/images/tiger.jpg"
              alt={getAvatarText()}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {t('welcome')}
          </p>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl font-semibold text-foreground/80 mb-4 max-w-3xl mx-auto">
            {t('experience')}
          </p>
          <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </p>
          {/* Speed badge */}
          <p className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-primary" />
            {t('speed')}
          </p>
        </div>

        {/* Capability tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-muted text-foreground/80 text-sm font-medium border border-border/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Primary CTA: Email */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {email && (
              <a
                href={`mailto:${email.value}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform"
              >
                <Mail size={20} />
                {t('emailCta')}
              </a>
            )}
            <Link
              href={`/${locale}/services`}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold border border-border bg-card hover:bg-muted transition"
            >
              {t('viewServices')}
              <ArrowRight size={18} />
            </Link>
          </div>
          {email && (
            <p className="text-sm text-muted-foreground">
              <a href={`mailto:${email.value}`} className="font-medium text-foreground hover:text-primary transition-colors">
                {email.value}
              </a>
              {' · '}
              {t('emailNote')}
            </p>
          )}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          {socialLinks.map((social) => {
            const Icon = iconMap[social.name] || Github;
            const isX = social.name === 'X' || social.name === 'Twitter';
            return (
              <a
                key={social.name}
                href={social.value}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
                aria-label={social.name}
              >
                {isX ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.614l-5.106-6.677-5.829 6.677h-3.307l7.735-8.835L2.564 2.25h6.614l4.888 6.469L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                ) : social.name === 'YouTube' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.175c-3.674-3.175-9.546-3.175-13.22 0-3.674 3.175-3.674 8.325 0 11.5 3.674 3.175 9.546 3.175 13.22 0 3.674-3.175 3.674-8.325 0-11.5zm-9.615 12.325v-8l5.5 4-5.5 4z" />
                  </svg>
                ) : (
                  <Icon size={20} />
                )}
              </a>
            );
          })}
          {email && (
            <a
              href={`mailto:${email.value}`}
              className="p-3 rounded-lg bg-muted hover:bg-muted/80 text-foreground transition"
              aria-label="Email"
            >
              <Mail size={20} />
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
