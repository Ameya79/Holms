"""
LLM adapter — TRD §5.

One function (call_llm) that dispatches to the configured provider.
All provider-specific code stays here — never in route handlers.
New providers should be addable by adding one elif block.

Model names verified against live docs as of July 2025.
"""

from backend.config import get_config


def format_chunks(shortlist) -> str:
    """Format ranked chunks for the LLM verification prompt."""
    parts = []
    for idx, c in enumerate(shortlist):
        source = getattr(c, "filename", None) or c.doc_id if hasattr(c, "doc_id") else "unknown"
        parts.append(f"[Excerpt {idx + 1} — source: {source}]\n{c.text if hasattr(c, 'text') else c['text']}\n")
    return "\n".join(parts)


def build_prompt(query: str, shortlist) -> str:
    """
    Build the verification + answer prompt (TRD §4).
    One prompt, one LLM call — reranking and answering in one pass.
    """
    return f"""Below are candidate excerpts retrieved for a question. Some may be irrelevant — ignore those.
Answer using only the relevant excerpts. Cite which source document(s) you used.
If none are relevant, say so.

{format_chunks(shortlist)}

Question: {query}"""


def call_llm(prompt: str) -> str:
    """
    Provider-agnostic LLM call. Reads provider + key from config.
    Exactly one call per user question — this is the only place
    in the entire app that talks to an LLM API.
    """
    config = get_config()
    provider = config.get("provider")
    key = config.get("api_keys", {}).get(provider)

    if not key:
        raise ValueError(f"No API key configured for provider: {provider}")

    # --- Anthropic ---
    if provider == "anthropic":
        import anthropic

        client = anthropic.Anthropic(api_key=key)
        r = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}],
        )
        return r.content[0].text

    # --- OpenAI ---
    if provider == "openai":
        from openai import OpenAI

        client = OpenAI(api_key=key)
        r = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
        )
        return r.choices[0].message.content

    # --- Groq ---
    if provider == "groq":
        from groq import Groq

        client = Groq(api_key=key)
        r = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
        )
        return r.choices[0].message.content

    # --- Gemini (google-genai, NOT the deprecated google-generativeai) ---
    if provider == "gemini":
        from google import genai

        client = genai.Client(api_key=key)
        r = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return r.text

    raise ValueError(f"Unknown provider: {provider}")
