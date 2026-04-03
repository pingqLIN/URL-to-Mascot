import type React from 'react';
import type { ConceptResult } from '../types';

function SectionCardsGrid({
  sectionCards,
  result,
  maxHeight,
}: {
  sectionCards: {
    key: 'section1' | 'section2' | 'section3' | 'section4' | 'section5';
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    wrapClass: string;
    iconClass: string;
    colSpan: string;
    minHeight: string;
    hasKeywords: boolean;
  }[];
  result: ConceptResult;
  maxHeight: string;
}) {
  return (
    <div className="scrollbar-visible grid grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2" style={{ maxHeight }}>
      {sectionCards.map((section) => {
        const Icon = section.icon;
        const sectionData = result[section.key];
        if (!sectionData) return null;
        return (
          <div
            key={section.key}
            className={`rounded-[1.35rem] border border-white/10 bg-slate-950/38 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.2)] backdrop-blur-md ${section.wrapClass} ${section.colSpan}`}
          >
            <div className="mb-2.5 flex items-center gap-2.5">
              <Icon className={`h-4 w-4 ${section.iconClass}`} />
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/74">
                {section.title}
              </h3>
            </div>
            <p className="text-[11px] leading-relaxed text-white/62">{sectionData.content}</p>
            {section.hasKeywords && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(result.section1.keywords || []).map((kw, idx) => (
                  <span
                    key={`${kw}-${idx}`}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/52"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SectionCardsGrid;
