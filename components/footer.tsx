'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Github, Twitter, Facebook, Youtube, Mail, X, Linkedin } from 'lucide-react';

interface ContactItem {
  name: string;
  value: string;
}

interface FooterProps {
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

// Upwork icon SVG component
const UpworkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.069 2.839-3.069 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.711-2.704 2.711zm-9.846 0c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.069 2.839-3.069 1.492 0 2.703 1.212 2.703 2.703 0 1.489-1.212 2.711-2.704 2.711zm-4.913 3.275c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.069 2.839-3.069 1.492 0 2.703 1.212 2.703 2.703 0 1.489-1.212 2.711-2.704 2.711zM23.182 5.5c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.069 2.839-3.069 1.492 0 2.703 1.212 2.703 2.703 0 1.489-1.212 2.711-2.704 2.711z"/>
  </svg>
);

export default function Footer({ contactInfo = [] }: FooterProps) {
  const t = useTranslations('footer');
  const locale = useLocale();
  
  // Get email and social links from contact info
  const email = contactInfo.find(item => item.name === 'Email');
  const socialLinks = contactInfo.filter(item => item.name !== 'Email' && (iconMap[item.name] || item.name === 'Upwork'));

  return (
    <footer className="border-t bg-background">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-4">{t('brandName')}</h3>
            <p className="text-sm text-foreground/60">
              {t('description')}
            </p>
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
                  const isUpwork = social.name === 'Upwork';
                  return (
                    <a
                      key={social.name}
                      href={social.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/60 hover:text-foreground transition-colors"
                      aria-label={social.name}
                    >
                      {isUpwork ? (
                        <UpworkIcon className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
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

