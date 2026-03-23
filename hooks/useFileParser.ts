
import { useState, useCallback } from 'react';
import { ParsedDocument } from '../types';

// These are expected to be available globally or via importmap
declare const pdfjsLib: unknown;
declare const mammoth: unknown;

export const useFileParser = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [parsingError, setParsingError] = useState<string | null>(null);

  const cleanText = (text: string): string => {
    return text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Ta bort kontrolltecken
      .replace(/\s{2,}/g, ' ') // Ersätt multipla blanksteg med ett
      .trim();
  };

  const parseExcel = async (file: File): Promise<string> => {
    // Dynamic import to keep main bundle light
    const XLSX = await import('xlsx');
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    
    let fullContent = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      // Convert to JSON with headers to create a readable text representation
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      fullContent += `--- BLAD: ${sheetName} ---\n`;
      (jsonData as unknown[]).forEach(row => {
        if (Array.isArray(row)) {
          fullContent += row.join(' | ') + '\n';
        }
      });
      fullContent += '\n';
    });
    
    return fullContent;
  };

  const parseFile = useCallback(async (file: File): Promise<ParsedDocument | null> => {
    setIsParsing(true);
    setParsingError(null);

    try {
      let textContent = '';
      const mimeType = file.type;
      const fileName = (file as { name: string }).name.toLowerCase();

      if (mimeType === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = (pdfjsLib as { getDocument: (opts: unknown) => { promise: Promise<unknown> } }).getDocument({
            data: arrayBuffer,
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true
        });
        
        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        let fullText = '';
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((item: unknown) => (item as { str: string }).str);
          fullText += strings.join(' ') + '\n';
        }
        textContent = cleanText(fullText);
      } 
      else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await (mammoth as { extractRawText: (opts: unknown) => Promise<{value: string}> }).extractRawText({ arrayBuffer: arrayBuffer });
        textContent = cleanText(result.value);
      } 
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv') || mimeType === 'text/csv') {
        textContent = await parseExcel(file);
      }
      else if (fileName.endsWith('.json') || mimeType === 'application/json') {
        const rawJson = await (file as { text: string }).text();
        try {
          const parsed = JSON.parse(rawJson);
          textContent = `--- STRUKTURERAD JSON-DATA ---\n${(JSON as { str: string }).stringify(parsed, null, 2)}`;
        } catch (e) {
          textContent = rawJson; // Fallback to raw text if invalid JSON
        }
      }
      else if (mimeType === 'text/plain' || fileName.endsWith('.txt')) {
        textContent = cleanText(await (file as { text: string }).text());
      } 
      else {
        // Försök läsa som text om formatet är okänt men filändelsen antyder text/data
        try {
           textContent = cleanText(await (file as { text: string }).text());
        } catch (e) {
           throw new Error(`Filformat som inte stöds: ${mimeType || 'okänd typ'}`);
        }
      }

      if (!textContent || (textContent as { length: number }).length < 5) {
          throw new Error("Kunde inte extrahera tillräcklig data från dokumentet.");
      }

      return {
        name: (file as { name: string }).name,
        mimeType: mimeType || 'application/octet-stream',
        textContent: textContent,
      };
    } catch (error) {
      console.error('File parsing error:', error);
      const message = error instanceof Error ? (error as Error).message : 'Ett okänt fel uppstod vid filbehandling.';
      setParsingError(message);
      return null;
    } finally {
      setIsParsing(false);
    }
  }, []);

  return { isParsing, parsingError, parseFile };
};
