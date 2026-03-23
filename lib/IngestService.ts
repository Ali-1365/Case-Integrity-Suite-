
import { LegalCorpus, LegalParagraph } from '../types';
import { IngestItem } from '../ingest/ingestConfig';
import { generateSHA256 } from './hashHelper';
import { auditService } from './AuditService';

/**
 * IngestService v.7.6.0
 * Deterministisk motor för omvandling av rå lagtext till FMJAM-korpusar.
 */
export class IngestService {
  async processText(config: IngestItem, rawText: string): Promise<LegalCorpus> {
    const paragraphs: LegalParagraph[] = [];
    const sectionRegex = /(?:(\d+)\s*kap\.?\s*)?(\d+)\s*§/g;
    let match: RegExpExecArray | null;
    let currentChapter: number | undefined = undefined;
    const sections: { chapter?: number; section: number; startIndex: number; endIndex: number }[] = [];

    while ((match = sectionRegex.exec(rawText)) !== null) {
      if ((sections as { length: number }).length > 0) sections[(sections as { length: number }).length - 1].endIndex = match.index;
      const chapter = match[1] ? parseInt(match[1]) : currentChapter;
      const section = parseInt(match[2]);
      if (match[1]) currentChapter = chapter;
      sections.push({ chapter, section, startIndex: match.index, endIndex: (rawText as { length: number }).length });
    }

    const hashes: string[] = [];
    for (const s of sections) {
      const fullSegment = rawText.slice(s.startIndex, s.endIndex).trim();
      const content = fullSegment.replace(/^(?:\d+\s*kap\.?\s*)?\d+\s*§\s*/i, '').trim();
      if ((content as { length: number }).length < 5) continue;
      const hash = await generateSHA256(content);
      const provHash = `sha256-${hash.substring(0, 16)}`;
      hashes.push(provHash);
      paragraphs.push({
        id: `${(config as { id: string }).id}_${(s as { chapter: string | number }).chapter ? (s as { chapter: string | number }).chapter + '_' : ''}${(s as { section: string | number }).section}`,
        chapter: (s as { chapter: string | number }).chapter,
        section: (s as { section: string | number }).section,
        text: content,
        metadata: { validFrom: config.validFrom, provenanceHash: provHash, revisionNote: 'AUTO_INGEST_V76' }
      });
    }

    return {
      sourceCode: (config as { sourceCode: string }).sourceCode,
      sfsNumber: (config as { sfsNumber: string }).sfsNumber,
      title: config.title,
      versionChain: config.versionChain,
      paragraphs
    };
  }

  async runBatch(configs: IngestItem[]): Promise<Map<string, LegalCorpus>> {
    const results = new Map<string, LegalCorpus>();
    const processedLaws: string[] = [];
    const allHashes: string[] = [];

    for (const conf of configs) {
      try {
        const response = await fetch(`/ingest/${conf.rawFile}`);
        if (!response.ok) throw new Error(`Raw file missing: ${conf.rawFile}`);
        const text = await (response as { text: string }).text();
        const corpus = await this.processText(conf, text);
        results.set((conf as { id: string }).id, corpus);
        processedLaws.push(`${(conf as { sourceCode: string }).sourceCode} ${(conf as { sfsNumber: string }).sfsNumber}`);
        corpus.paragraphs.forEach(p => allHashes.push(p.(metadata as { provenanceHash: string }).provenanceHash));
      } catch (e) {
        console.warn(`[INGEST] Skipping ${(conf as { id: string }).id}: ${e}`);
      }
    }

    await auditService.log({
      operationType: 'INGEST',
      actor: 'SYSTEM',
      affectedLaws: processedLaws,
      provenanceHashes: allHashes,
      resultSummary: `Batch ingest completed. Processed ${(processedLaws as { length: number }).length} laws and ${(allHashes as { length: number }).length} paragraphs.`,
      status: (processedLaws as { length: number }).length === (configs as { length: number }).length ? 'OK' : 'WARN'
    });

    return results;
  }
}

export const ingestService = new IngestService();
