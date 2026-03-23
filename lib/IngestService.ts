
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
      if (sections.length > 0) sections[sections.length - 1].endIndex = match.index;
      const chapter = match[1] ? parseInt(match[1]) : currentChapter;
      const section = parseInt(match[2]);
      if (match[1]) currentChapter = chapter;
      sections.push({ chapter, section, startIndex: match.index, endIndex: rawText.length });
    }

    const hashes: string[] = [];
    for (const s of sections) {
      const fullSegment = rawText.slice(s.startIndex, s.endIndex).trim();
      const content = fullSegment.replace(/^(?:\d+\s*kap\.?\s*)?\d+\s*§\s*/i, '').trim();
      if (content.length < 5) continue;
      const hash = await generateSHA256(content);
      const provHash = `sha256-${hash.substring(0, 16)}`;
      hashes.push(provHash);
      paragraphs.push({
        id: `${config.id}_${s.chapter ? s.chapter + '_' : ''}${s.section}`,
        chapter: s.chapter,
        section: s.section,
        text: content,
        metadata: { validFrom: config.validFrom, provenanceHash: provHash, revisionNote: 'AUTO_INGEST_V76' }
      });
    }

    return {
      sourceCode: config.sourceCode,
      sfsNumber: config.sfsNumber,
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
        const text = await response.text();
        const corpus = await this.processText(conf, text);
        results.set(conf.id, corpus);
        processedLaws.push(`${conf.sourceCode} ${conf.sfsNumber}`);
        corpus.paragraphs.forEach(p => allHashes.push(p.metadata.provenanceHash));
      } catch (err: unknown) {
        console.warn(`[INGEST] Skipping ${conf.id}: ${err}`);
      }
    }

    await auditService.log({
      operationType: 'INGEST',
      actor: 'SYSTEM',
      affectedLaws: processedLaws,
      provenanceHashes: allHashes,
      resultSummary: `Batch ingest completed. Processed ${processedLaws.length} laws and ${allHashes.length} paragraphs.`,
      status: processedLaws.length === configs.length ? 'OK' : 'WARN'
    });

    return results;
  }
}

export const ingestService = new IngestService();
