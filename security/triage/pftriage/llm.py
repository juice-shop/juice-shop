"""LLM providers. Standard library only (urllib), so the runner needs no extra SDKs.

Provider is chosen with PF_LLM_PROVIDER = gemini | anthropic | openai | offline.
Model is chosen with PF_LLM_MODEL (each provider has a default).

Every call goes through `complete()`, which only accepts a payload string that has already
passed Redactor.verify(). The provider classes never see Finding objects.
"""
from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request

DEFAULT_MODELS = {
    "gemini": "gemini-flash-lite-latest",   # free tier friendly; override with PF_LLM_MODEL
    "anthropic": "claude-haiku-5-5",
    "openai": "gpt-4o-mini",
}


class LLMError(RuntimeError):
    pass


def _post(url: str, headers: dict, body: dict, timeout: int = 90, retries: int = 4) -> dict:
    data = json.dumps(body).encode()
    delay = 8.0
    for attempt in range(retries + 1):
        req = urllib.request.Request(url, data=data, headers={"content-type": "application/json", **headers})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:400]
            if e.code in (429, 500, 502, 503, 504) and attempt < retries:
                wait = float(e.headers.get("retry-after") or delay)
                print(f"[llm] HTTP {e.code}, retrying in {wait:.0f}s ({attempt + 1}/{retries})")
                time.sleep(wait)
                delay *= 2
                continue
            raise LLMError(f"HTTP {e.code}: {detail}") from None
        except urllib.error.URLError as e:
            if attempt < retries:
                time.sleep(delay)
                delay *= 2
                continue
            raise LLMError(f"network error: {e.reason}") from None
    raise LLMError("unreachable")


def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", text)
        if not m:
            raise LLMError("model did not return JSON")
        return json.loads(m.group(1))


class Provider:
    name = "base"

    def __init__(self, model: str | None = None):
        self.model = model or os.environ.get("PF_LLM_MODEL") or DEFAULT_MODELS.get(self.name, "")

    def complete(self, system: str, user: str, max_tokens: int = 4000) -> str:  # pragma: no cover
        raise NotImplementedError


class GeminiProvider(Provider):
    name = "gemini"

    def complete(self, system: str, user: str, max_tokens: int = 4000) -> str:
        key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        if not key:
            raise LLMError("GEMINI_API_KEY is not set")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"
        body = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": user}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": max_tokens,
                                 "responseMimeType": "application/json"},
        }
        resp = _post(url, {"x-goog-api-key": key}, body)
        try:
            return "".join(p.get("text", "") for p in resp["candidates"][0]["content"]["parts"])
        except (KeyError, IndexError):
            raise LLMError(f"unexpected Gemini response: {str(resp)[:300]}") from None


class AnthropicProvider(Provider):
    name = "anthropic"

    def complete(self, system: str, user: str, max_tokens: int = 4000) -> str:
        key = os.environ.get("ANTHROPIC_API_KEY")
        if not key:
            raise LLMError("ANTHROPIC_API_KEY is not set")
        body = {"model": self.model, "max_tokens": max_tokens, "temperature": 0.1, "system": system,
                "messages": [{"role": "user", "content": user}]}
        resp = _post("https://api.anthropic.com/v1/messages",
                     {"x-api-key": key, "anthropic-version": "2023-06-01"}, body)
        return "".join(b.get("text", "") for b in resp.get("content", []) if b.get("type") == "text")


class OpenAIProvider(Provider):
    name = "openai"

    def complete(self, system: str, user: str, max_tokens: int = 4000) -> str:
        key = os.environ.get("OPENAI_API_KEY")
        if not key:
            raise LLMError("OPENAI_API_KEY is not set")
        body = {"model": self.model, "temperature": 0.1, "response_format": {"type": "json_object"},
                "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}]}
        resp = _post("https://api.openai.com/v1/chat/completions", {"authorization": f"Bearer {key}"}, body)
        return resp["choices"][0]["message"]["content"]


class OfflineProvider(Provider):
    """No network. Deterministic answers from the metadata alone.

    Used when no API key is configured (e.g. a fork without secrets) and in unit tests.
    Output is clearly labelled so nobody mistakes it for LLM output.
    """
    name = "offline"

    def complete(self, system: str, user: str, max_tokens: int = 4000) -> str:
        payload = json.JSONDecoder().raw_decode(user[user.index("{"):])[0] if "{" in user else {}
        if "clusters" in payload:
            return json.dumps({"results": [self._triage(c) for c in payload["clusters"]]})
        if "finding" in payload:
            return json.dumps({"refuse": True, "reason": "offline mode cannot draft fixes"})
        return json.dumps({"results": []})

    @staticmethod
    def _triage(c: dict) -> dict:
        likely_fp = bool(c.get("in_test_code")) or (c.get("stage") == "iac" and c.get("severity") in ("LOW", "INFO"))
        if c.get("fixed_version"):
            fix = f"Upgrade {c.get('package')} from {c.get('installed_version')} to {c.get('fixed_version')} or later."
        else:
            fix = f"Review {c.get('rule_id')} ({', '.join(c.get('cwe', [])) or 'no CWE'}) and apply the scanner guidance."
        return {"cluster_id": c["cluster_id"], "verdict": "likely_false_positive" if likely_fp else "true_positive",
                "confidence": "low", "priority_adjustment": 0, "rationale": "offline heuristic (no LLM used)",
                "fix": fix, "cited_ids": c.get("vuln_ids", [])}


PROVIDERS = {p.name: p for p in (GeminiProvider, AnthropicProvider, OpenAIProvider, OfflineProvider)}


def get_provider(name: str | None = None, model: str | None = None) -> Provider:
    name = (name or os.environ.get("PF_LLM_PROVIDER") or "gemini").lower()
    if name not in PROVIDERS:
        raise LLMError(f"unknown provider {name}; choose from {sorted(PROVIDERS)}")
    prov = PROVIDERS[name](model)
    # fall back to offline when the key is missing, so the pipeline still produces a report
    key_env = {"gemini": ("GEMINI_API_KEY", "GOOGLE_API_KEY"), "anthropic": ("ANTHROPIC_API_KEY",),
               "openai": ("OPENAI_API_KEY",)}.get(name, ())
    if key_env and not any(os.environ.get(k) for k in key_env):
        print(f"[llm] no API key for {name}; using offline heuristics instead")
        return OfflineProvider()
    return prov
