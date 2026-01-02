'use client';

import { useState, useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { ContentItem } from '@/lib/content';

interface PortfolioFilterProps {
  projects: ContentItem[];
  locale: string;
  onFilterChange: (filteredProjects: ContentItem[]) => void;
  translations: {
    filterTechnologies: string;
    clearFilters: string;
    noProjectsFound: string;
    projectsFound?: string;
    projectFound?: string;
  };
}

export default function PortfolioFilter({ 
  projects, 
  locale, 
  onFilterChange,
  translations 
}: PortfolioFilterProps) {
  // Count projects per technology and calculate sizes for tag cloud
  const techData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(project => {
      if (project.metadata.technologies) {
        project.metadata.technologies.forEach(tech => {
          counts[tech] = (counts[tech] || 0) + 1;
        });
      }
    });

    const techArray = Object.entries(counts).map(([tech, count]) => ({ tech, count }));
    
    // Calculate min and max counts for size scaling
    const countsArray = Object.values(counts);
    const minCount = Math.min(...countsArray);
    const maxCount = Math.max(...countsArray);
    const range = maxCount - minCount || 1;

    // Calculate font sizes (from 0.7rem to 1rem) and weights for compact tag cloud
    return techArray.map(({ tech, count }) => {
      const normalizedCount = (count - minCount) / range;
      const fontSize = 0.7 + normalizedCount * 0.3; // 0.7rem to 1rem
      const fontWeight = normalizedCount > 0.6 ? 'font-semibold' : normalizedCount > 0.3 ? 'font-medium' : 'font-normal';
      
      return {
        tech,
        count,
        fontSize: `${fontSize}rem`,
        fontWeight
      };
    }).sort((a, b) => b.count - a.count); // Sort by count descending
  }, [projects]);

  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());

  // Filter projects based on selected technologies
  const filteredProjects = useMemo(() => {
    if (selectedTechs.size === 0) {
      return projects;
    }
    return projects.filter(project => {
      if (!project.metadata.technologies || project.metadata.technologies.length === 0) {
        return false;
      }
      // Project must have at least one of the selected technologies
      return project.metadata.technologies.some(tech => selectedTechs.has(tech));
    });
  }, [projects, selectedTechs]);

  // Update parent component when filtered projects change
  useEffect(() => {
    onFilterChange(filteredProjects);
  }, [filteredProjects, onFilterChange]);

  const toggleTech = (tech: string) => {
    const newSelected = new Set(selectedTechs);
    if (newSelected.has(tech)) {
      newSelected.delete(tech);
    } else {
      newSelected.add(tech);
    }
    setSelectedTechs(newSelected);
  };

  const clearFilters = () => {
    setSelectedTechs(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          {translations.filterTechnologies}
        </h2>
        {selectedTechs.size > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
            title={translations.clearFilters}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {techData.length === 0 ? (
        <p className="text-xs text-muted-foreground">{translations.noProjectsFound}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {techData.map(({ tech, count, fontSize, fontWeight }) => {
            const isSelected = selectedTechs.has(tech);

            return (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded border transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-card text-card-foreground border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
                style={{ fontSize }}
                title={`${tech} (${count} ${count === 1 ? 'project' : 'projects'})`}
              >
                <span className={fontWeight}>{tech}</span>
                <span
                  className={`
                    text-[0.6rem] px-1 py-0.5 rounded leading-none
                    ${
                      isSelected
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {selectedTechs.size > 0 && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {filteredProjects.length} {filteredProjects.length === 1 
              ? (translations.projectFound || 'project found')
              : (translations.projectsFound || 'projects found')}
          </p>
        </div>
      )}
    </div>
  );
}

