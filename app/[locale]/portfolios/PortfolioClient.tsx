'use client';

import { useState, useMemo } from 'react';
import { ContentItem } from '@/lib/content';
import PortfolioFilter from './PortfolioFilter';
import PortfolioGrid from './PortfolioGrid';

interface PortfolioClientProps {
  projects: ContentItem[];
  locale: string;
  isZhCN: boolean;
  translations: {
    filterTechnologies: string;
    clearFilters: string;
    noProjectsFound: string;
    viewDetails: string;
    projectsFound?: string;
    projectFound?: string;
  };
}

export default function PortfolioClient({ 
  projects, 
  locale, 
  isZhCN,
  translations 
}: PortfolioClientProps) {
  const [filteredProjects, setFilteredProjects] = useState<ContentItem[]>(projects);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Left sidebar - Filter */}
      <aside className="lg:w-56 flex-shrink-0">
        <div className="sticky top-8">
          <PortfolioFilter
            projects={projects}
            locale={locale}
            onFilterChange={setFilteredProjects}
            translations={{
              filterTechnologies: translations.filterTechnologies,
              clearFilters: translations.clearFilters,
              noProjectsFound: translations.noProjectsFound,
              projectsFound: translations.projectsFound,
              projectFound: translations.projectFound
            }}
          />
        </div>
      </aside>

      {/* Right content - Project grid */}
      <div className="flex-1 min-w-0">
        <PortfolioGrid
          projects={filteredProjects}
          locale={locale}
          isZhCN={isZhCN}
          translations={{
            viewDetails: translations.viewDetails,
            noProjectsFound: translations.noProjectsFound
          }}
        />
      </div>
    </div>
  );
}

