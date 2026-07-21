"use client";
import { useEffect, useState } from "react";
import { getSettings, saveSettings, testConnection } from "@/lib/api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (isOpen) {
      getSettings()
        .then((data) => {
          setProvider(data.provider || "anthropic");
          setApiKey("");
        })
        .catch(() => {
          setStatusMsg({ text: "Could not connect to backend.", type: "error" });
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setStatusMsg(null);
    try {
      await saveSettings(provider, apiKey);
      setStatusMsg({ text: "Settings saved successfully.", type: "success" });
      setApiKey("");
    } catch {
      setStatusMsg({ text: "Failed to save settings.", type: "error" });
    }
  };

  const handleTest = async () => {
    setStatusMsg({ text: "Testing connection...", type: "info" });
    try {
      const data = await testConnection();
      if (data.status === "success") {
        setStatusMsg({ text: `Connected! Response: "${data.response}"`, type: "success" });
      } else {
        setStatusMsg({ text: data.message || "Test failed", type: "error" });
      }
    } catch {
      setStatusMsg({ text: "Backend unreachable.", type: "error" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-foam border border-teal rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-teal/15">
          <h2 className="font-serif text-xl font-normal text-teal">Settings</h2>
          <button onClick={onClose} className="text-muted text-2xl hover:text-ink cursor-pointer">&times;</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-teal">AI Provider</label>
            <p className="text-xs text-muted mb-1">
              Optional — Holms works without an API key. Adding one turns search results into written answers.
            </p>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="p-2.5 border border-teal/30 rounded-md text-sm bg-white text-ink outline-none focus:border-teal"
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="gemini">Google (Gemini)</option>
              <option value="groq">Groq (Llama)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-teal">API Key</label>
            <div className="flex gap-1.5">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key..."
                className="flex-1 p-2.5 border border-teal/30 rounded-md text-sm bg-white text-ink outline-none focus:border-teal"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="px-3 border border-teal/30 bg-white rounded-md text-teal cursor-pointer hover:bg-teal/5"
              >
                👁
              </button>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-drift text-white rounded-md text-sm font-medium hover:bg-[#9a7d63] cursor-pointer"
            >
              Save Settings
            </button>
            <button
              onClick={handleTest}
              className="px-4 py-2 border border-teal/30 bg-white text-teal rounded-md text-sm font-medium hover:bg-teal/5 cursor-pointer"
            >
              Test Connection
            </button>
          </div>

          {statusMsg && (
            <div
              className={`p-2.5 rounded-md text-xs ${
                statusMsg.type === "success"
                  ? "bg-green-100 text-green-800"
                  : statusMsg.type === "error"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {statusMsg.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
