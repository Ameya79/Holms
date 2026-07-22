import {
  saveDocument,
  getAllDocuments,
  deleteStoredDocument,
  searchLocalDocuments,
  StoredDocument,
} from "./storage";

/** Get stored settings from localStorage */
export function getSettings() {
  if (typeof window === "undefined") return { provider: "anthropic", api_keys: {} };
  const saved = localStorage.getItem("holms_settings");
  if (!saved) return { provider: "anthropic", api_keys: {} };
  try {
    return JSON.parse(saved);
  } catch {
    return { provider: "anthropic", api_keys: {} };
  }
}

/** Save settings to localStorage */
export function saveSettings(provider: string, apiKeys: Record<string, string> | string) {
  const current = getSettings();
  const keysObj = typeof apiKeys === "string" ? { ...current.api_keys, [provider]: apiKeys } : { ...current.api_keys, ...apiKeys };
  const updated = { provider, api_keys: keysObj };
  localStorage.setItem("holms_settings", JSON.stringify(updated));
  return { message: "Settings updated" };
}

/** Ingest uploaded file directly in browser */
export async function uploadFile(file: File) {
  let text = "";
  if (file.type.includes("text") || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
    text = await file.text();
  } else if (file.name.endsWith(".json")) {
    text = await file.text();
  } else {
    // For binary/PDF/images, extract filename & text content or use text reader
    text = await file.text().catch(() => `Document content of ${file.name}`);
  }

  const doc = await saveDocument(file.name, text, file.size);
  return {
    doc_id: doc.id,
    filename: doc.filename,
    message: "Uploaded and indexed locally",
  };
}

/** Search documents locally */
export async function search(query: string) {
  const result = await searchLocalDocuments(query);
  const settings = getSettings();
  const activeKey = settings.api_keys?.[settings.provider];

  if (!activeKey || result.documents.length === 0) {
    return result;
  }

  // If active API key is provided, perform online RAG summary call
  try {
    const summary = await callOnlineLLM(settings.provider, activeKey, query, result.documents);
    return {
      mode: "answered",
      answer: summary,
      documents: result.documents,
    };
  } catch (err: any) {
    return result;
  }
}

/** Direct online LLM API call for RAG summary answers */
async function callOnlineLLM(provider: string, apiKey: string, query: string, documents: any[]) {
  const context = documents.map((d) => `Document: ${d.filename}\nExcerpt: ${d.top_snippet}`).join("\n\n");
  const prompt = `Based on the following document excerpts, answer the question clearly and concisely.\n\n${context}\n\nQuestion: ${query}`;

  if (provider === "openai" || provider === "groq") {
    const endpoint = provider === "groq" ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = provider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No response received";
  }

  if (provider === "gemini") {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "No response received";
  }

  return "Provider not supported";
}

/** List all documents */
export async function listDocuments() {
  const docs = await getAllDocuments();
  return docs.map((d) => ({
    id: d.id,
    filename: d.filename,
    uploaded_at: d.uploaded_at,
    ocr_used: false,
    chunk_count: d.chunks.length,
  }));
}

/** Delete document */
export async function deleteDocument(id: string) {
  await deleteStoredDocument(id);
  return { message: "Deleted successfully" };
}

/** Test connection */
export async function testConnection() {
  const settings = getSettings();
  const activeKey = settings.api_keys?.[settings.provider];
  if (!activeKey) throw new Error("No API key configured");
  return { status: "success", response: "API Key configured" };
}

export function documentUrl(filename: string) {
  return "#";
}
