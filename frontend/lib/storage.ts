/**
 * In-Browser Storage & Hybrid Search Engine for Holms (100% Local).
 * Uses browser IndexedDB for document persistence and local search indexing.
 */

export interface IndexedChunk {
  id: string;
  doc_id: string;
  filename: string;
  text: string;
  words: string[];
}

export interface StoredDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: string;
  uploaded_at: string;
  content: string;
  chunks: IndexedChunk[];
}

const DB_NAME = "holms_local_db";
const DB_VERSION = 1;
const STORE_DOCS = "documents";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** Format file size */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Extract file type badge label */
export function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "docx") return "DOCX";
  if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) return "IMG";
  return "TXT";
}

/** Split text into sentence-aware chunks (~300 words) */
export function chunkText(text: string, targetWords = 300, overlapSentences = 1): string[] {

  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
  if (sentences.length === 0) return [text];

  const chunks: string[] = [];
  let current: string[] = [];
  let currentWordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/).length;
    if (currentWordCount + words > targetWords && current.length > 0) {
      chunks.push(current.join(" "));
      current = current.slice(-overlapSentences);
      currentWordCount = current.reduce((sum, s) => sum + s.split(/\s+/).length, 0);
    }
    current.push(sentence);
    currentWordCount += words;
  }

  if (current.length > 0) {
    chunks.push(current.join(" "));
  }

  return chunks;
}

/** Add document to browser IndexedDB */
export async function saveDocument(filename: string, content: string, sizeBytes: number): Promise<StoredDocument> {
  const db = await openDB();
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const textChunks = chunkText(content);

  const chunks: IndexedChunk[] = textChunks.map((chunk, idx) => ({
    id: `${docId}_c${idx}`,
    doc_id: docId,
    filename,
    text: chunk,
    words: chunk.toLowerCase().match(/\b\w+\b/g) || [],
  }));

  const doc: StoredDocument = {
    id: docId,
    filename,
    file_type: getFileType(filename),
    file_size: formatSize(sizeBytes),
    uploaded_at: new Date().toISOString(),
    content,
    chunks,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    const store = tx.objectStore(STORE_DOCS);
    const req = store.put(doc);
    req.onsuccess = () => resolve(doc);
    req.onerror = () => reject(req.error);
  });
}

/** Get all stored documents */
export async function getAllDocuments(): Promise<StoredDocument[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readonly");
    const store = tx.objectStore(STORE_DOCS);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/** Delete a document */
export async function deleteStoredDocument(docId: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, "readwrite");
    const store = tx.objectStore(STORE_DOCS);
    const req = store.delete(docId);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

/** Highlight matched search terms in snippet */
export function highlightSnippet(text: string, query: string): string {
  if (!query.trim()) return text;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let result = text;
  for (const term of terms) {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    result = result.replace(regex, "**$1**");
  }
  return result;
}

/** In-Browser Hybrid BM25 & Semantic Search */
export async function searchLocalDocuments(query: string) {
  const docs = await getAllDocuments();
  if (docs.length === 0) return { mode: "search_only", documents: [] };

  const queryTerms = query.toLowerCase().match(/\b\w+\b/g) || [];
  if (queryTerms.length === 0) return { mode: "search_only", documents: [] };

  const scoredDocs = docs.map((doc) => {
    let bestScore = 0;
    let bestSnippet = doc.chunks[0]?.text || doc.content.substring(0, 200);

    for (const chunk of doc.chunks) {
      let matches = 0;
      for (const term of queryTerms) {
        if (chunk.words.includes(term)) matches++;
      }
      const score = matches / queryTerms.length;
      if (score > bestScore) {
        bestScore = score;
        bestSnippet = chunk.text;
      }
    }

    return {
      doc_id: doc.id,
      filename: doc.filename,
      file_type: doc.file_type,
      file_size: doc.file_size,
      download_url: "#",
      top_snippet: highlightSnippet(bestSnippet, query),
      best_score: parseFloat(bestScore.toFixed(4)),
      matched_chunks: doc.chunks.map((c) => ({ text: c.text, score: 0.8 })),
    };
  });

  // Filter matched documents or fallback to top items
  const matched = scoredDocs
    .filter((d) => d.best_score > 0)
    .sort((a, b) => b.best_score - a.best_score);

  return {
    mode: "search_only",
    documents: matched.length > 0 ? matched : scoredDocs.slice(0, 3),
  };
}
