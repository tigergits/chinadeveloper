"use client"

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Github, Linkedin, Mail, ExternalLink, Facebook, Youtube, X } from "lucide-react"

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

  const welcomeText = t('welcome')
  const experienceText = t('experience')
  const descriptionText = t('description')

  const getAvatarText = () => {
    return locale === 'zh-cn' ? '虎' : 'Tiger'
  }

  return (
    <section className="relative px-8 py-24 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Avatar */}
        <div className="mb-12 flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent/30 flex items-center justify-center ring-2 ring-primary/20 shadow-2xl">
              <Image 
                src="/assets/images/tiger.jpg" 
                alt={getAvatarText()}
                width={160}
                height={160}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-12">
          <p className="text-primary font-semibold text-lg mb-4 uppercase tracking-wide">
            {welcomeText}
          </p>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-balance leading-tight">{t('title')}</h1>
          <p className="text-2xl font-semibold text-foreground/80 mb-4">{experienceText}</p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            {descriptionText}
          </p>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-12">
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
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.614l-5.106-6.677-5.829 6.677h-3.307l7.735-8.835L2.564 2.25h6.614l4.888 6.469L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                  </svg>
                ) : social.name === 'YouTube' ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.175c-3.674-3.175-9.546-3.175-13.22 0-3.674 3.175-3.674 8.325 0 11.5 3.674 3.175 9.546 3.175 13.22 0 3.674-3.175 3.674-8.325 0-11.5zm-9.615 12.325v-8l5.5 4-5.5 4z" />
                  </svg>
                ) : (
                  <Icon size={24} />
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
              <Mail size={24} />
            </a>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition transform"
          >
            {t('cta')}
            <ExternalLink size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}

