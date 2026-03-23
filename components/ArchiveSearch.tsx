
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
      <div className={`p-8 bg-slate-50 dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-4 ${className}`}>
        <Spinner className="h-8 w-8 text-blue-500" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Söker i arkivet efter "{query}"...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null; // Visa inget om inget hittas för att inte störa vyn
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
          <MagnifyingGlassIcon className="w-5 h-5 mr-3 text-blue-500" />
          {title}
        </h3>
        <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
          {results.length} Träffar
        </span>
      </div>

      <div className="space-y-4">
        {results.map((res, idx) => (
          <div 
            key={`${res.document.id}-${idx}`}
            className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] hover:border-blue-500/40 transition-all group relative overflow-hidden shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
              <FileIcon className="w-12 h-12 text-slate-900 dark:text-white" />
            </div>

            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                  <FileIcon className="w-4 h-4" />
                </div>
                <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{res.document.title}</p>
              </div>
              <span className="text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">ID: {res.document.id}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-4 font-medium italic">
              "{res.document.content.substring(0, 150)}..."
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50 relative z-10">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-3 h-3 text-blue-500/60" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{res.matchReason}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                <CheckCircleIcon className="w-3 h-3 text-emerald-500/60" />
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Relevans: {res.relevanceScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
