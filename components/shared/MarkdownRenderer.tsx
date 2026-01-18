
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * MarkdownRenderer v.7.2 - FMJAM Standard.
 * Renderar juridisk text med interaktiva provenance-taggar.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  if (!content) return null;

  // Split content by lines but keep structure
  const blocks = content.split('\n\n');
  
  return (
    <div className={`prose prose-invert max-w-none font-serif selection:bg-cyan-500/30 ${className}`}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
};

function renderBlock(block: string, key: number) {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('# ')) {
        return <h1 key={key} className="text-3xl font-black text-white mb-8 border-b-2 border-gray-800 pb-4 uppercase tracking-tighter italic">{parseInline(trimmed.replace('# ', ''))}</h1>;
    }
    if (trimmed.startsWith('## ')) {
        return <h2 key={key} className="text-xl font-black text-cyan-400 mt-10 mb-4 border-l-4 border-cyan-600 pl-4 bg-cyan-950/10 py-2 uppercase tracking-widest">{parseInline(trimmed.replace('## ', ''))}</h2>;
    }
    if (trimmed.startsWith('### ')) {
        return <h3 key={key} className="text-lg font-bold text-white mt-6 mb-3 italic">{parseInline(trimmed.replace('### ', ''))}</h3>;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n');
        return (
            <ul key={key} className="space-y-3 my-6">
                {items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-gray-300 leading-relaxed">
                        <span className="text-cyan-600 font-black mt-1">»</span>
                        <span>{parseInline(item.replace(/^[-*]\s+/, ''))}</span>
                    </li>
                ))}
            </ul>
        );
    }
    if (trimmed.startsWith('|')) {
        return (
            <div key={key} className="overflow-x-auto my-8 rounded-xl border border-gray-800 bg-black/40">
                <table className="min-w-full text-xs font-mono">
                    <tbody>
                        {trimmed.split('\n').map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5">
                                {row.split('|').filter(c => c.trim()).map((cell, cidx) => (
                                    <td key={cidx} className="p-3 text-gray-400">{parseInline(cell.trim())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <p key={key} className="text-gray-300 leading-[1.8] text-base mb-6 text-justify">{parseInline(trimmed)}</p>;
}

function parseInline(text: string) {
  // Regex för att fånga KÄLLA, ARKIV, INFORMATION_GAP och fetstil
  const parts = text.split(/(\*\*.*?\*\*|\[KÄLLA:.*?\]|\[ARKIV:.*?\]|\[INFORMATION_GAP:.*?\])/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[KÄLLA:') || part.startsWith('[ARKIV:')) {
      return (
        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/50 text-[10px] font-mono font-bold mx-1 cursor-help hover:bg-cyan-500 hover:text-black transition-all">
          {part}
        </span>
      );
    }
    if (part.startsWith('[INFORMATION_GAP:')) {
      return (
        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-800/50 text-[10px] font-mono font-black mx-1 animate-pulse">
          {part}
        </span>
      );
    }
    return part;
  });
}

export default MarkdownRenderer;
