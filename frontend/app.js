/* ==========================================================================
   Holms v0.2 — App JavaScript
   Document-centric search engine client logic.
   Talks to the local FastAPI backend over HTTP.
   ========================================================================== */

(() => {
    "use strict";

    const DEFAULT_API_URL = "http://localhost:8000";

    function getApiUrl() {
        return localStorage.getItem("holms_api_url") || DEFAULT_API_URL;
    }

    function setApiUrl(url) {
        localStorage.setItem("holms_api_url", url.replace(/\/+$/, ""));
    }

    // --- DOM Elements ---
    const searchSection = document.getElementById("search-section");
    const searchPrompt = document.getElementById("search-prompt");
    const queryInput = document.getElementById("query-input");
    const searchBtn = document.getElementById("search-btn");

    const resultsSection = document.getElementById("results-section");
    const resultsStatus = document.getElementById("results-status");
    const documentsGrid = document.getElementById("documents-grid");
    const aiAnswerCard = document.getElementById("ai-answer-card");
    const aiAnswerBody = document.getElementById("ai-answer-body");

    const docsCountPill = document.getElementById("docs-count-pill");
    const indexedPills = document.getElementById("indexed-pills");
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("file-input");

    const openSettingsBtn = document.getElementById("open-settings-btn");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const providerSelect = document.getElementById("provider-select");
    const apiKeyInput = document.getElementById("api-key-input");
    const toggleKeyBtn = document.getElementById("toggle-key-btn");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const testConnectionBtn = document.getElementById("test-connection-btn");
    const settingsStatus = document.getElementById("settings-status");
    const apiUrlInput = document.getElementById("api-url-input");

    const installBtn = document.getElementById("install-btn");

    // --- Search Submission ---
    async function executeSearch() {
        const query = queryInput.value.trim();
        if (!query) return;

        // Transition search box upwards
        searchSection.classList.remove("centered");
        searchSection.classList.add("active-results");
        searchPrompt.style.display = "none";

        // Show results section
        resultsSection.style.display = "flex";
        resultsStatus.textContent = "Searching documents...";
        documentsGrid.innerHTML = "";
        aiAnswerCard.style.display = "none";

        searchBtn.disabled = true;
        searchBtn.querySelector("span").textContent = "Searching...";

        try {
            const res = await fetch(`${getApiUrl()}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ detail: "Request failed" }));
                resultsStatus.textContent = `Error: ${err.detail || "Server error"}`;
                searchBtn.disabled = false;
                searchBtn.querySelector("span").textContent = "Search";
                return;
            }

            const data = await res.json();
            const docs = data.documents || [];

            resultsStatus.textContent = `${docs.length} ${docs.length === 1 ? "document" : "documents"} matched`;

            if (docs.length === 0) {
                documentsGrid.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: var(--muted); font-size: 0.9rem;">
                        No matching documents found. Try a different query or upload more files.
                    </div>
                `;
            } else {
                renderDocumentCards(docs);
            }

            // Render AI Answer box below document cards if key configured & mode == answered
            if (data.mode === "answered" && data.answer) {
                aiAnswerBody.innerHTML = formatMarkdown(data.answer);
                aiAnswerCard.style.display = "block";
            }
        } catch (err) {
            resultsStatus.textContent = `Could not reach backend at ${getApiUrl()}. Is Holms running?`;
        }

        searchBtn.disabled = false;
        searchBtn.querySelector("span").textContent = "Search";
    }

    function renderDocumentCards(docs) {
        documentsGrid.innerHTML = docs.map(d => {
            const typeClass = `type-${(d.file_type || "txt").toLowerCase()}`;
            const fullDownloadUrl = d.download_url.startsWith("http") ? d.download_url : `${getApiUrl()}${d.download_url}`;

            return `
                <div class="doc-result-card ${typeClass}">
                    <div class="doc-card-header">
                        <div class="doc-card-title">
                            <span class="doc-filename">${escapeHtml(d.filename)}</span>
                            <span class="badge-type">${escapeHtml(d.file_type)}</span>
                        </div>
                        <span class="doc-filesize">${escapeHtml(d.file_size)}</span>
                    </div>

                    <div class="doc-snippet">${formatSnippet(d.top_snippet)}</div>

                    <div class="doc-card-actions">
                        <a href="${fullDownloadUrl}" target="_blank" class="btn-open-doc">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Open Document
                        </a>
                        <button class="btn-copy-path" onclick="copyDocPath('${escapeHtml(d.filename)}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                            Copy Path
                        </button>
                    </div>
                </div>
            `;
        }).join("");
    }

    queryInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            executeSearch();
        }
    });

    searchBtn.addEventListener("click", executeSearch);

    // --- Global copy helper ---
    window.copyDocPath = function (filename) {
        const path = `data/documents/${filename}`;
        navigator.clipboard.writeText(path).then(() => {
            alert(`Copied path: ${path}`);
        });
    };

    // --- Upload Logic ---
    async function uploadFiles(files) {
        dropZone.style.opacity = "0.6";

        for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch(`${getApiUrl()}/upload`, {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(`Failed to upload ${file.name}: ${err.detail || "Error"}`);
                }
            } catch {
                alert(`Could not upload ${file.name}. Backend unreachable.`);
            }
        }

        dropZone.style.opacity = "1";
        loadIndexedPills();
    }

    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) uploadFiles([...fileInput.files]);
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
        if (e.dataTransfer.files.length) uploadFiles([...e.dataTransfer.files]);
    });

    // --- Indexed Document Pills ---
    async function loadIndexedPills() {
        try {
            const res = await fetch(`${getApiUrl()}/documents`);
            if (!res.ok) return;
            const docs = await res.json();

            docsCountPill.textContent = `${docs.length} ${docs.length === 1 ? "indexed doc" : "indexed docs"}`;

            if (docs.length === 0) {
                indexedPills.innerHTML = '<span style="font-size: 0.78rem; color: var(--muted);">No documents uploaded yet.</span>';
                return;
            }

            indexedPills.innerHTML = docs.map(d => `
                <span class="pill-doc" title="Uploaded ${d.uploaded_at}">
                    📄 ${escapeHtml(d.filename)}
                    <button class="pill-delete" onclick="deleteDocPill('${d.id}')" title="Delete from index">&times;</button>
                </span>
            `).join("");
        } catch {
            docsCountPill.textContent = "Backend offline";
        }
    }

    window.deleteDocPill = async function (id) {
        if (!confirm("Delete this document from Holms index?")) return;
        try {
            await fetch(`${getApiUrl()}/documents/${id}`, { method: "DELETE" });
            loadIndexedPills();
        } catch {
            alert("Delete failed.");
        }
    };

    // --- Settings Modal ---
    function openSettings() {
        apiUrlInput.value = getApiUrl();
        settingsModal.style.display = "flex";
        loadSettingsData();
    }

    function closeSettings() {
        settingsModal.style.display = "none";
    }

    async function loadSettingsData() {
        try {
            const res = await fetch(`${getApiUrl()}/settings`);
            if (!res.ok) return;
            const data = await res.json();
            providerSelect.value = data.provider || "anthropic";
            apiKeyInput.value = "";
            apiKeyInput.placeholder = data.api_keys[data.provider] || "Paste your API key...";
        } catch {
            settingsStatus.className = "settings-status error";
            settingsStatus.textContent = "Could not load settings.";
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
                loadSettingsData();
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
                settingsStatus.textContent = `Connected! Response: "${data.response}"`;
            } else {
                settingsStatus.className = "settings-status error";
                settingsStatus.textContent = data.message;
            }
        } catch {
            settingsStatus.className = "settings-status error";
            settingsStatus.textContent = "Backend unreachable.";
        }
    });

    toggleKeyBtn.addEventListener("click", () => {
        apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
    });

    openSettingsBtn.addEventListener("click", openSettings);
    closeSettingsBtn.addEventListener("click", closeSettings);

    // --- PWA Install Prompt ---
    let deferredPrompt = null;
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = "inline-flex";
    });

    installBtn.addEventListener("click", async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.style.display = "none";
        }
    });

    // --- Formatting Helpers ---
    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str;
        return div.innerHTML;
    }

    function formatSnippet(snippet) {
        // Convert **match** markers from backend highlight() to <mark class="match">
        return escapeHtml(snippet || "").replace(/\*\*(.+?)\*\*/g, '<mark class="match">$1</mark>');
    }

    function formatMarkdown(text) {
        return escapeHtml(text || "")
            .replace(/\n\n/g, "</p><p>")
            .replace(/\n/g, "<br>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }

    // Init
    loadIndexedPills();
})();
