
import React, { useState, useEffect } from 'react';
import { ArchiveService, ArchiveSearchResult } from '../services/archiveService';
import { 
  MagnifyingGlassIcon, 
  FileIcon, 
  LinkIcon, 
  CheckCircleIcon, 
  Spinner, 
  SparklesIcon,
  CpuChipIcon
} from './icons';

interface ArchiveSearchProps {
  query: string;
  title?: string;
  limit?: number;
  className?: string;
}

export const ArchiveSearch: React.FC<ArchiveSearchProps> = ({ query, title = "Arkivsökning (Bakgrund)", limit = 3, className = "" }) => {
  const [results, setResults] = useState<ArchiveSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query) return;

    setIsSearching(true);
    // Simulera en liten fördröjning för "bakgrundssökning"-känsla
    const timer = setTimeout(() => {
      const searchResults = ArchiveService.search(query, limit);
      setResults(searchResults);
      setIsSearching(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [query, limit]);

  if (isSearching) {
    return (
      <div className={`p-8 bg-[var(--bg-main)] rounded-3xl border border-[var(--border)] flex flex-col items-center justify-center space-y-4 shadow-inner ${className}`}>
        <Spinner className="h-8 w-8 text-[var(--accent)]" />
        <p className="text-[10px] font-black text-[var(--ink-muted)] uppercase tracking-widest animate-pulse">Söker i arkivet efter "{query}"...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null; // Visa inget om inget hittas för att inte störa vyn
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xs font-black text-[var(--ink-muted)] uppercase tracking-[0.2em] flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 mr-3 text-[var(--accent)]" />
          {title}
        </h3>
        <span className="text-[9px] font-black text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/5 px-3 py-1 rounded-full border border-[var(--accent)]/10">
          {results.length} Träffar
        </span>
      </div>

      <div className="space-y-4">
        {results.map((res, idx) => (
          <div 
            key={`${res.document.id}-${idx}`} 
            className="p-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl hover:border-[var(--accent)]/40 transition-all group relative overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <FileIcon className="w-12 h-12 text-[var(--ink-main)]" />
            </div>

            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--accent)]/10 rounded-lg text-[var(--accent)]">
                  <FileIcon className="w-4 h-4" />
                </div>
                <p className="text-sm font-black text-[var(--ink-main)] tracking-tight group-hover:text-[var(--accent)] transition-colors">{res.document.title}</p>
              </div>
              <span className="text-[9px] font-mono font-black text-[var(--ink-muted)] uppercase tracking-widest">ID: {res.document.id}</span>
            </div>

            <p className="text-xs text-[var(--ink-muted)] leading-relaxed line-clamp-2 mb-4 font-medium italic">
              "{res.document.content.substring(0, 150)}..."
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)] relative z-10">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-3 h-3 text-[var(--accent)]/60" />
                <span className="text-[9px] font-black text-[var(--ink-muted)] uppercase tracking-widest">{res.matchReason}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--success)]/5 border border-[var(--success)]/10 rounded-lg">
                <CheckCircleIcon className="w-3 h-3 text-[var(--success)]/60" />
                <span className="text-[9px] font-black text-[var(--success)] uppercase tracking-widest">Relevans: {res.relevanceScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
