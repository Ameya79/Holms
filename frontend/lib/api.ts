const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function search(query: string) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function uploadFile(file: File) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${BASE}/documents`);
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

export async function deleteDocument(id: string) {
  const res = await fetch(`${BASE}/documents/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return res.json();
}

export function documentUrl(filename: string) {
  return `${BASE}/documents/${encodeURIComponent(filename)}`;
}

export async function getSettings() {
  const res = await fetch(`${BASE}/settings`);
  if (!res.ok) throw new Error(`Get settings failed: ${res.status}`);
  return res.json();
}

export async function saveSettings(provider: string, apiKey: string) {
  const res = await fetch(`${BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      api_keys: { [provider]: apiKey },
    }),
  });
  if (!res.ok) throw new Error(`Save settings failed: ${res.status}`);
  return res.json();
}

export async function testConnection() {
  const res = await fetch(`${BASE}/settings/test`, { method: "POST" });
  if (!res.ok) throw new Error(`Test connection failed: ${res.status}`);
  return res.json();
}
