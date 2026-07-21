"use client";
import { useEffect, useState } from "react";
import { getSettings, saveSettings, testConnection } from "@/lib/api";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [provider, setProvider] = useState("anthropic");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    anthropic: "",
    gemini: "",
    openai: "",
    groq: "",
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSettings().then((cfg) => {
        setProvider(cfg.provider || "anthropic");
        setApiKeys((prev) => ({ ...prev, ...(cfg.api_keys || {}) }));
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(provider, apiKeys);
      onClose();
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-xl text-white">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-800">
          <h2 className="text-lg font-bold font-sans">Settings & AI Keys</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-2">
              Select AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 outline-none"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT-4o Mini)</option>
              <option value="gemini">Google Gemini (2.0 Flash)</option>
              <option value="groq">Groq (Llama 3.3 70B)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              API Keys
            </label>
            {["anthropic", "openai", "gemini", "groq"].map((p) => (
              <div key={p}>
                <label className="block text-xs text-neutral-400 capitalize mb-1">{p} Key</label>
                <input
                  type="password"
                  value={apiKeys[p] || ""}
                  onChange={(e) => setApiKeys({ ...apiKeys, [p]: e.target.value })}
                  placeholder={`Enter ${p} API key...`}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-emerald-500 outline-none font-mono"
                />
              </div>
            ))}
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testResult.success ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800" : "bg-red-950/80 text-red-300 border border-red-800"
            }`}>
              {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-neutral-800">
          <button
            onClick={handleTest}
            disabled={testing}
            className="px-4 py-2 bg-neutral-800 text-neutral-200 text-xs font-medium rounded-lg hover:bg-neutral-700 disabled:opacity-50 cursor-pointer"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
