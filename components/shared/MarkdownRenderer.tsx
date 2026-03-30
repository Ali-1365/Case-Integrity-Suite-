
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

  // Filter out internal IDs like [FACT_...], [CONTR_...], [INFOGAP_...], [ATOM_...]
  const cleanContent = content.replace(/\[(FACT|CONTR|INFOGAP|ATOM|PROV|HASH)_[^\]]+\]/g, '');

  // Split content by lines but keep structure
  const blocks = cleanContent.split('\n\n');
  
  return (
    <div className={`prose prose-invert max-w-none font-serif selection:bg-[var(--accent)]/30 ${className}`}>
      {blocks.map((block, i) => renderBlock(block, i))}
    </div>
  );
};

function renderBlock(block: string, key: number) {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('# ')) {
        return <h1 key={key} className="text-2xl font-semibold text-[var(--ink-main)] mb-6 border-b border-[var(--border)] pb-3">{parseInline(trimmed.replace('# ', ''))}</h1>;
    }
    if (trimmed.startsWith('## ')) {
        return <h2 key={key} className="text-lg font-medium text-[var(--accent)] mt-8 mb-4 border-l-2 border-[var(--accent)] pl-3 py-1">{parseInline(trimmed.replace('## ', ''))}</h2>;
    }
    if (trimmed.startsWith('### ')) {
        return <h3 key={key} className="text-base font-medium text-[var(--ink-main)] mt-6 mb-3">{parseInline(trimmed.replace('### ', ''))}</h3>;
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const items = trimmed.split('\n');
        return (
            <ul key={key} className="space-y-2 my-4 pl-4 list-disc list-outside text-[var(--ink-muted)]">
                {items.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">
                        <span>{parseInline(item.replace(/^[-*]\s+/, ''))}</span>
                    </li>
                ))}
            </ul>
        );
    }
    if (trimmed.startsWith('|')) {
        return (
            <div key={key} className="overflow-x-auto my-6 rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
                <table className="min-w-full text-sm">
                    <tbody>
                        {trimmed.split('\n').map((row, idx) => (
                            <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--bg-main)] transition-colors">
                                {row.split('|').filter(c => c.trim()).map((cell, cidx) => (
                                    <td key={cidx} className="p-3 text-[var(--ink-muted)]">{parseInline(cell.trim())}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return <p key={key} className="text-[var(--ink-muted)] leading-relaxed text-sm mb-4">{parseInline(trimmed)}</p>;
}

function parseInline(text: string) {
  // Regex för att fånga KÄLLA, ARKIV, INFORMATION_GAP och fetstil
  const parts = text.split(/(\*\*.*?\*\*|\[KÄLLA:.*?\]|\[ARKIV:.*?\]|\[INFORMATION_GAP:.*?\])/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-[var(--ink-main)] font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('[KÄLLA:') || part.startsWith('[ARKIV:')) {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 text-[10px] font-mono mx-1 cursor-help hover:bg-[var(--accent)]/20 transition-colors">
          {part}
        </span>
      );
    }
    if (part.startsWith('[INFORMATION_GAP:')) {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 text-[10px] font-mono mx-1">
          {part}
        </span>
      );
    }
    return part;
  });
}

export default MarkdownRenderer;
