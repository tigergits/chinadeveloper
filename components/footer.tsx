'use client';

import type { ComponentType } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Github, Facebook, Youtube, Mail, Linkedin } from 'lucide-react';

interface ContactItem {
  name: string;
  value: string;
}

interface FooterProps {
  contactInfo?: ContactItem[];
}

// lucide 的 X 是「关闭」叉号，不是 X（原 Twitter）品牌标，这里用官方 logo 路径自绘。
function XLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  'GitHub': Github,
  'X': XLogo,
  'Twitter': XLogo,
  'Facebook': Facebook,
  'YouTube': Youtube,
  'LinkedIn': Linkedin,
  'Email': Mail,
};

export default function Footer({ contactInfo = [] }: FooterProps) {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  // Get email and social links from contact info
  const email = contactInfo.find(item => item.name === 'Email');
  const socialLinks = contactInfo.filter(item => item.name !== 'Email' && iconMap[item.name]);

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4 text-gradient-brand inline-block">{t('brandName')}</h3>
            <p className="text-sm text-foreground/60">
              {t('description')}
            </p>
            {email && (
              <a
                href={`mailto:${email.value}`}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-105 transition transform"
              >
                <Mail className="h-4 w-4" />
                {t('emailCta')}
              </a>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="text-foreground/60 hover:text-foreground">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/portfolios`} className="text-foreground/60 hover:text-foreground">
                  {t('portfolio')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/services`} className="text-foreground/60 hover:text-foreground">
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-foreground/60 hover:text-foreground">
                  {t('contact')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="text-foreground/60 hover:text-foreground">
                  {t('privacy')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">{t('connect')}</h3>
            <div className="flex flex-col space-y-2">
              {email && (
                <a
                  href={`mailto:${email.value}`}
                  className="flex items-center space-x-2 text-sm text-foreground/60 hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                  <span>{email.value}</span>
                </a>
              )}
              <div className="flex items-center space-x-4 mt-2">
                {socialLinks.map((social) => {
                  const Icon = iconMap[social.name] || Github;
                  return (
                    <a
                      key={social.name}
                      href={social.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      aria-label={social.name}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} {t('brandName')}. {t('copyright')}</p>
          <p className="mt-2">
            {t('builtWith')}{' '}
            <a
              href="https://github.com/tigergits/chinadeveloper"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-accent transition-colors underline"
            >
              {t('openSource')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

