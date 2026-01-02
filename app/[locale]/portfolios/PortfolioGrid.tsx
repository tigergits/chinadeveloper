'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { ContentItem } from '@/lib/content';

interface PortfolioGridProps {
  projects: ContentItem[];
  locale: string;
  isZhCN: boolean;
  translations: {
    viewDetails: string;
    noProjectsFound?: string;
  };
}

export default function PortfolioGrid({ 
  projects, 
  locale, 
  isZhCN,
  translations 
}: PortfolioGridProps) {
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          {translations.noProjectsFound || (isZhCN ? "未找到项目" : "No projects found")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {projects.map((project) => (
        <Link
          key={project.slug}
          href={`/${locale}/portfolios/${project.slug}`}
          className="group relative bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 flex flex-col"
        >
          {project.metadata.cover && (
            <div className="relative w-full h-48 sm:h-56 overflow-hidden bg-muted">
              <Image
                src={"/assets/images/portfolios/" + project.slug + "/" + project.metadata.cover}
                alt={`${project.metadata.title || project.slug} - ${isZhCN ? "作品集项目" : "Portfolio project"} by Tiger Liu, China Developer`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          )}
          <div className="p-6 flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-3 text-card-foreground group-hover:text-primary transition-colors duration-300">
              {project.metadata.title || project.slug}
            </h2>
            {project.metadata.technologies && project.metadata.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {project.metadata.technologies.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full border border-border/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto pt-4">
              <div className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all duration-300">
                <span>{translations.viewDetails}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

