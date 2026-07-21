/* ==========================================================================
   Holms — App JavaScript
   Talks to the local FastAPI backend over HTTP.
   API URL is configurable (TRD §6 — needed for Vercel deployment).
   ========================================================================== */

(() => {
    "use strict";

    // ---------------------------------------------------------------------------
    // Config
    // ---------------------------------------------------------------------------
    const DEFAULT_API_URL = "http://localhost:8000";

    function getApiUrl() {
        return localStorage.getItem("holms_api_url") || DEFAULT_API_URL;
    }

    function setApiUrl(url) {
        localStorage.setItem("holms_api_url", url.replace(/\/+$/, ""));
    }

    // ---------------------------------------------------------------------------
    // DOM refs
    // ---------------------------------------------------------------------------
    const navBtns = document.querySelectorAll(".nav-btn");
    const views = document.querySelectorAll(".view");

    const chatMessages = document.getElementById("chat-messages");
    const queryInput = document.getElementById("query-input");
    const sendBtn = document.getElementById("send-btn");
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    const documentsList = document.getElementById("documents-list");
    const uploadBtn = document.getElementById("upload-btn");

    const providerSelect = document.getElementById("provider-select");
    const apiKeyInput = document.getElementById("api-key-input");
    const toggleKeyBtn = document.getElementById("toggle-key-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const testConnectionBtn = document.getElementById("test-connection-btn");
    const settingsStatus = document.getElementById("settings-status");
    const apiUrlInput = document.getElementById("api-url-input");

    const installBtn = document.getElementById("install-btn");

    // ---------------------------------------------------------------------------
    // Navigation
    // ---------------------------------------------------------------------------
    function switchView(viewName) {
        views.forEach(v => v.classList.remove("active"));
        navBtns.forEach(b => b.classList.remove("active"));

        const view = document.getElementById(`view-${viewName}`);
        const btn = document.querySelector(`[data-view="${viewName}"]`);
        if (view) view.classList.add("active");
        if (btn) btn.classList.add("active");

        if (viewName === "documents") loadDocuments();
        if (viewName === "settings") loadSettings();
    }

    navBtns.forEach(btn => {
        btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    // ---------------------------------------------------------------------------
    // Chat
    // ---------------------------------------------------------------------------
    let welcomeVisible = true;

    function clearWelcome() {
        if (welcomeVisible) {
            const welcome = chatMessages.querySelector(".welcome-message");
            if (welcome) welcome.remove();
            welcomeVisible = false;
        }
    }

    function addUserMessage(text) {
        clearWelcome();
        const div = document.createElement("div");
        div.className = "message user";
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingMessage() {
        clearWelcome();
        const div = document.createElement("div");
        div.className = "message assistant loading-msg";
        div.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div;
    }

    function removeLoadingMessage(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    function renderSearchResults(results) {
        clearWelcome();

        const label = document.createElement("div");
        label.className = "search-mode-label";
        label.textContent = "Search results (no API key configured — add one in Settings for AI answers)";
        chatMessages.appendChild(label);

        const container = document.createElement("div");
        container.className = "search-results";

        results.forEach((r, i) => {
            const card = document.createElement("div");
            card.className = "search-result-card";
            card.innerHTML = `
                <div class="result-header">
                    <span class="result-filename">${escapeHtml(r.filename || r.doc_id)}</span>
                    <span class="result-score">#${i + 1}</span>
                </div>
                <div class="result-snippet">${formatSnippet(r.snippet)}</div>
            `;
            container.appendChild(card);
        });

        chatMessages.appendChild(container);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function renderAnswer(answer, sources) {
        clearWelcome();

        const div = document.createElement("div");
        div.className = "message assistant";

        let sourcesHtml = "";
        if (sources && sources.length > 0) {
            const sourceNames = sources.map(s => {
                if (Array.isArray(s)) return escapeHtml(s[1]);  // [doc_id, filename] tuple
                return escapeHtml(s);
            });
            sourcesHtml = `<div class="sources">Sources: ${[...new Set(sourceNames)].join(", ")}</div>`;
        }

        div.innerHTML = `
            <div class="answer-text">${formatAnswer(answer)}</div>
            ${sourcesHtml}
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendQuery() {
        const query = queryInput.value.trim();
        if (!query) return;

        addUserMessage(query);
        queryInput.value = "";
        sendBtn.disabled = true;

        const loading = addLoadingMessage();

        try {
            const res = await fetch(`${getApiUrl()}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            removeLoadingMessage(loading);

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Server error" }));
                renderAnswer(`Error: ${err.detail || "Request failed"}`, []);
                return;
            }

            const data = await res.json();

            if (data.mode === "search_only") {
                renderSearchResults(data.results || []);
            } else {
                renderAnswer(data.answer, data.sources);
            }
        } catch (err) {
            removeLoadingMessage(loading);
            renderAnswer(`Could not reach the backend at ${getApiUrl()}. Is it running?`, []);
        }

        sendBtn.disabled = false;
    }

    queryInput.addEventListener("input", () => {
        sendBtn.disabled = !queryInput.value.trim();
    });

    queryInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendQuery();
        }
    });

    sendBtn.addEventListener("click", sendQuery);

    // ---------------------------------------------------------------------------
    // File upload
    // ---------------------------------------------------------------------------
    async function uploadFile(file) {
        const toast = showToast(`Uploading ${file.name}...`);
        dropZone.classList.add("uploading");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${getApiUrl()}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Upload failed" }));
                toast.textContent = `❌ ${err.detail}`;
            } else {
                const data = await res.json();
                toast.textContent = `✓ ${data.filename} indexed`;
            }
        } catch (err) {
            toast.textContent = `❌ Could not reach backend`;
        }

        dropZone.classList.remove("uploading");
        setTimeout(() => toast.remove(), 3000);
    }

    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
        [...fileInput.files].forEach(uploadFile);
        fileInput.value = "";
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        [...e.dataTransfer.files].forEach(uploadFile);
    });

    // Upload button on documents page
    if (uploadBtn) {
        uploadBtn.addEventListener("click", () => {
            const input = document.createElement("input");
            input.type = "file";
            input.multiple = true;
            input.accept = ".pdf,.docx,.png,.jpg,.jpeg";
            input.addEventListener("change", () => {
                [...input.files].forEach(uploadFile);
            });
            input.click();
        });
    }

    // ---------------------------------------------------------------------------
    // Documents
    // ---------------------------------------------------------------------------
    async function loadDocuments() {
        try {
            const res = await fetch(`${getApiUrl()}/documents`);
            if (!res.ok) throw new Error();
            const docs = await res.json();

            if (docs.length === 0) {
                documentsList.innerHTML = '<p class="empty-state">No documents indexed yet. Upload some files to get started.</p>';
                return;
            }

            documentsList.innerHTML = docs.map(d => `
                <div class="doc-card" data-id="${d.id}">
                    <div class="doc-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div class="doc-info">
                        <div class="doc-name">${escapeHtml(d.filename)}</div>
                        <div class="doc-meta">
                            <span>${d.chunk_count || 0} chunks</span>
                            <span>${formatDate(d.uploaded_at)}</span>
                            ${d.ocr_used ? '<span class="doc-badge">OCR</span>' : ""}
                        </div>
                    </div>
                    <button class="doc-delete" title="Delete" onclick="deleteDoc('${d.id}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            `).join("");
        } catch {
            documentsList.innerHTML = '<p class="empty-state">Could not load documents. Is the backend running?</p>';
        }
    }

    // Expose to onclick handlers
    window.deleteDoc = async function (id) {
        if (!confirm("Delete this document and remove it from the index?")) return;
        try {
            await fetch(`${getApiUrl()}/documents/${id}`, { method: "DELETE" });
            loadDocuments();
        } catch {
            alert("Failed to delete document.");
        }
    };

    // ---------------------------------------------------------------------------
    // Settings
    // ---------------------------------------------------------------------------
    async function loadSettings() {
        apiUrlInput.value = getApiUrl();
        try {
            const res = await fetch(`${getApiUrl()}/settings`);
            if (!res.ok) throw new Error();
            const data = await res.json();
            providerSelect.value = data.provider || "anthropic";
            apiKeyInput.value = "";
            apiKeyInput.placeholder = data.api_keys[data.provider] || "Paste your API key...";
        } catch {
            settingsStatus.className = "settings-status error";
            settingsStatus.textContent = "Could not load settings. Is the backend running?";
        }
    }

    saveSettingsBtn.addEventListener("click", async () => {
        const apiUrl = apiUrlInput.value.trim();
        if (apiUrl) setApiUrl(apiUrl);

        try {
            const res = await fetch(`${getApiUrl()}/settings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: providerSelect.value,
                    api_keys: { [providerSelect.value]: apiKeyInput.value },
                }),
            });

            if (res.ok) {
                settingsStatus.className = "settings-status success";
                settingsStatus.textContent = "Settings saved.";
                apiKeyInput.value = "";
                loadSettings();
            } else {
                throw new Error();
            }
        } catch {
            settingsStatus.className = "settings-status error";
            settingsStatus.textContent = "Failed to save settings.";
        }
    });

    testConnectionBtn.addEventListener("click", async () => {
        settingsStatus.className = "settings-status";
        settingsStatus.style.display = "block";
        settingsStatus.textContent = "Testing connection...";

        try {
            const res = await fetch(`${getApiUrl()}/settings/test`, { method: "POST" });
            const data = await res.json();

            if (data.status === "success") {
                settingsStatus.className = "settings-status success";
                settingsStatus.textContent = `✓ Connected! Response: "${data.response}"`;
            } else {
                settingsStatus.className = "settings-status error";
                settingsStatus.textContent = `✗ ${data.message}`;
            }
        } catch {
            settingsStatus.className = "settings-status error";
            settingsStatus.textContent = "Could not reach the backend.";
        }
    });

    toggleKeyBtn.addEventListener("click", () => {
        apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
    });

    // ---------------------------------------------------------------------------
    // PWA install prompt (TRD §9)
    // ---------------------------------------------------------------------------
    let deferredPrompt = null;

    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = "flex";
    });

    installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.style.display = "none";
        }
    });

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function formatSnippet(snippet) {
        // Convert **bold** markers from highlight() to <strong> tags
        return escapeHtml(snippet).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }

    function formatAnswer(text) {
        // Basic markdown-like formatting
        return escapeHtml(text)
            .replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }

    function formatDate(dateStr) {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        } catch {
            return dateStr;
        }
    }

    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "upload-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        return toast;
    }
})();
