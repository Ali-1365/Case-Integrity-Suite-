
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { StoredDocument, OpinionResult } from '../types';
import { AuditLogEntry, CISCase } from './cis.types';
export type { AuditLogEntry, CISCase };

const DB_NAME = 'LegalAnalysisDB';
const DB_VERSION = 5; // Upgraded version
const DOC_STORE_NAME = 'documents';
const SETTINGS_STORE_NAME = 'settings';
const AUDIT_STORE_NAME = 'audit_logs';
const CASE_STORE_NAME = 'cases';
const ECONOMIC_STORE_NAME = 'economic_data';

interface Settings {
    key: string;
    value: any;
}

interface LegalDB extends DBSchema {
  [DOC_STORE_NAME]: {
    key: string;
    value: StoredDocument;
  };
  [SETTINGS_STORE_NAME]: {
      key: string;
      value: Settings;
  };
  [AUDIT_STORE_NAME]: {
    key: string;
    value: AuditLogEntry;
  };
  [CASE_STORE_NAME]: {
    key: string;
    value: CISCase;
  };
  [ECONOMIC_STORE_NAME]: {
    key: string;
    value: { id: string; type: string; data: any };
  };
}

let dbPromise: Promise<IDBPDatabase<LegalDB>> | null = null;

const getDb = (): Promise<IDBPDatabase<LegalDB>> => {
    if (!dbPromise) {
        dbPromise = openDB<LegalDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                if (!db.objectStoreNames.contains(DOC_STORE_NAME)) {
                    db.createObjectStore(DOC_STORE_NAME, { keyPath: 'id' });
                }
                if (oldVersion < 2 && !db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
                    db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'key' });
                }
                if (oldVersion < 3 && !db.objectStoreNames.contains(AUDIT_STORE_NAME)) {
                    db.createObjectStore(AUDIT_STORE_NAME, { keyPath: 'id' });
                }
                if (oldVersion < 4 && !db.objectStoreNames.contains(CASE_STORE_NAME)) {
                    db.createObjectStore(CASE_STORE_NAME, { keyPath: 'caseId' });
                }
                if (!db.objectStoreNames.contains(ECONOMIC_STORE_NAME)) {
                    db.createObjectStore(ECONOMIC_STORE_NAME, { keyPath: 'id' });
                }
            },
        });
    }
    return dbPromise;
};

export const db = {
  async saveEconomicData(id: string, type: string, data: any): Promise<void> {
    const db = await getDb();
    await db.put(ECONOMIC_STORE_NAME, { id, type, data });
  },

  async getEconomicData(id: string): Promise<any | undefined> {
    const db = await getDb();
    const entry = await db.get(ECONOMIC_STORE_NAME, id);
    return entry?.data;
  },

  async getAllEconomicDataByType(type: string): Promise<any[]> {
    const db = await getDb();
    const all = await db.getAll(ECONOMIC_STORE_NAME);
    return all.filter(item => item.type === type).map(item => item.data);
  },

  async deleteEconomicData(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(ECONOMIC_STORE_NAME, id);
  },
  async addDocument(doc: StoredDocument): Promise<void> {
    const db = await getDb();
    await db.put(DOC_STORE_NAME, doc);
  },

  async getDocument(id: string): Promise<StoredDocument | undefined> {
    const db = await getDb();
    return await db.get(DOC_STORE_NAME, id);
  },

  async getAllDocuments(): Promise<StoredDocument[]> {
    const db = await getDb();
    const allDocs = await db.getAll(DOC_STORE_NAME);
    return allDocs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async saveOpinion(documentId: string, opinion: OpinionResult): Promise<void> {
    const db = await getDb();
    const doc = await db.get(DOC_STORE_NAME, documentId);
    if (doc) {
      doc.opinion = opinion;
      await db.put(DOC_STORE_NAME, doc);
    } else {
        throw new Error("Document not found");
    }
  },

  async addAuditLog(entry: AuditLogEntry): Promise<void> {
    const db = await getDb();
    await db.put(AUDIT_STORE_NAME, entry);
  },

  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const db = await getDb();
    const logs = await db.getAll(AUDIT_STORE_NAME);
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async saveCase(cisCase: CISCase): Promise<void> {
    const db = await getDb();
    await db.put(CASE_STORE_NAME, cisCase);
  },

  async getCase(caseId: string): Promise<CISCase | undefined> {
    const db = await getDb();
    return await db.get(CASE_STORE_NAME, caseId);
  },

  async getAllCases(): Promise<CISCase[]> {
    const db = await getDb();
    const allCases = await db.getAll(CASE_STORE_NAME);
    return allCases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async deleteCase(caseId: string): Promise<void> {
    const db = await getDb();
    await db.delete(CASE_STORE_NAME, caseId);
  },

  async deleteDocument(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(DOC_STORE_NAME, id);
  },

  async repairPersistence(): Promise<void> {
      if (dbPromise) {
          const db = await dbPromise;
          db.close();
      }
      dbPromise = null;
      console.log("[PERSISTENCE] Integrity Repair Executed. Locks released.");
  }
};
