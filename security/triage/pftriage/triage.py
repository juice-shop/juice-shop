"""LLM triage orchestration: clusters -> redacted batches -> LLM -> guard -> report."""
from __future__ import annotations

import hashlib
import json
import time
from datetime import datetime, timezone
from pathlib import Path

from .cluster import Cluster, build_clusters
from .guard import check_all
from .llm import LLMError, Provider, extract_json
from .models import Finding
from .redact import RedactionConfig, RedactionError, Redactor

PROMPTS = Path(__file__).parent / "prompts"

SECRET_PLAYBOOK = (
    "Handled locally, never sent to the LLM. 1) Treat the credential as compromised and rotate/revoke it now. "
    "2) Remove it from the code and load it from a secret store (GitHub Actions secrets, Vault, K8s Secret via "
    "external-secrets). 3) Purge it from git history (git filter-repo) if the repo was ever shared. "
    "4) Add a gitleaks allowlist entry only if it is a documented test fixture."
)


def load_prompt(name: str) -> str:
    return (PROMPTS / name).read_text()


class AuditLog:
    """Writes every outbound request and inbound response, so redaction can be verified later."""

    def __init__(self, out_dir: Path):
        self.dir = out_dir / "llm_audit"
        self.dir.mkdir(parents=True, exist_ok=True)
        self.n = len(list(self.dir.glob("*.json")))   # append after earlier runs, never overwrite

    def record(self, kind: str, system: str, user: str, response: str | None, meta: dict) -> None:
        self.n += 1
        entry = {"seq": self.n, "kind": kind, "time": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                 "sha256_user": hashlib.sha256(user.encode()).hexdigest(), "meta": meta,
                 "system_prompt": system, "user_payload": user, "response": response}
        (self.dir / f"{self.n:03d}_{kind}.json").write_text(json.dumps(entry, indent=1, ensure_ascii=False))


def triage(findings: list[Finding], provider: Provider, out_dir: Path, redaction_cfg: RedactionConfig,
           max_clusters: int = 40, batch_size: int = 20) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    started = time.time()
    clusters = build_clusters(findings)
    red = Redactor(redaction_cfg)
    audit = AuditLog(out_dir)

    secret_clusters = [c for c in clusters if c.is_secret]
    candidates = [c for c in clusters if not c.is_secret]
    to_llm = candidates[:max_clusters]
    skipped = candidates[max_clusters:]

    views, blocked = [], []
    for c in to_llm:
        try:
            views.append(red.cluster_view(c))
        except RedactionError as e:
            blocked.append({"cluster_id": c.cluster_id, "reason": str(e)})

    system = load_prompt("triage_system.md")
    template = load_prompt("triage_user.md")
    raw_results, errors = [], []
    llm_calls = 0
    for i in range(0, len(views), batch_size):
        batch = views[i:i + batch_size]
        try:
            payload = red.safe_payload({"clusters": batch})          # layer 4: verify or raise
        except RedactionError as e:
            # fall back to sending clusters one by one so one bad cluster does not block the rest
            payload = None
            errors.append(f"batch {i // batch_size}: {e}")
            for v in batch:
                try:
                    red.safe_payload({"clusters": [v]})
                except RedactionError as e2:
                    blocked.append({"cluster_id": v["cluster_id"], "reason": str(e2)})
            batch = [v for v in batch if v["cluster_id"] not in {b["cluster_id"] for b in blocked}]
            if batch:
                payload = red.safe_payload({"clusters": batch})
        if not payload:
            continue
        user = template.replace("{payload}", payload)
        response = None
        try:
            response = provider.complete(system, user, max_tokens=8192)
            llm_calls += 1
            parsed = extract_json(response)
            raw_results.extend(parsed.get("results", []) if isinstance(parsed, dict) else parsed)
        except (LLMError, json.JSONDecodeError, ValueError) as e:
            errors.append(f"batch {i // batch_size}: {e}")
        finally:
            audit.record("triage", system, user, response,
                         {"provider": provider.name, "model": getattr(provider, "model", ""), "clusters": len(batch)})

    sent_views = [v for v in views if v["cluster_id"] not in {b["cluster_id"] for b in blocked}]
    checked, guard_stats = check_all(raw_results, sent_views)
    by_id = {c.cluster_id: c for c in clusters}

    rows = []
    for r in checked:
        c = by_id[r["cluster_id"]]
        r["fix"] = red.unalias(r["fix"])
        r["rationale"] = red.unalias(r["rationale"])
        rows.append({**c.summary(), "triage": r, "final_rank_score": c.risk_score + 8 * r["priority_adjustment"]})
    for c in secret_clusters:
        rows.append({**c.summary(), "triage": {"cluster_id": c.cluster_id, "verdict": "needs_review",
                     "confidence": "n/a", "priority_adjustment": 0,
                     "rationale": "Looks like a secret: the LLM is not allowed to see or act on it. A human must "
                                  "confirm it is real, then follow the playbook.",
                     "fix": SECRET_PLAYBOOK, "hallucination": False, "handled_locally": True},
                     "final_rank_score": c.risk_score + 20})
    for c in skipped:
        rows.append({**c.summary(), "triage": {"cluster_id": c.cluster_id, "verdict": "not_triaged",
                     "rationale": "below the LLM budget for this run (lower risk score)"},
                     "final_rank_score": c.risk_score})
    for b in blocked:
        c = by_id[b["cluster_id"]]
        rows.append({**c.summary(), "triage": {"cluster_id": c.cluster_id, "verdict": "blocked_by_redaction",
                     "rationale": b["reason"]}, "final_rank_score": c.risk_score})
    rows.sort(key=lambda r: -r["final_rank_score"])

    result = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "provider": provider.name, "model": getattr(provider, "model", ""),
        "duration_s": round(time.time() - started, 1), "llm_calls": llm_calls,
        "counts": {"findings": len(findings), "clusters": len(clusters), "sent_to_llm": len(sent_views),
                   "secret_clusters_local": len(secret_clusters), "not_triaged": len(skipped),
                   "blocked_by_redaction": len(blocked)},
        "dedup_ratio": round(1 - len(clusters) / max(1, len(findings)), 3),
        "guard": guard_stats, "errors": errors,
        "redaction_events": {k: v for k, v in sorted(red.events.items()) if v},
        "clusters": rows,
    }
    (out_dir / "triage.json").write_text(json.dumps(result, indent=1))
    (out_dir / "triage.md").write_text(to_markdown(result))
    # keep the alias map local so humans can map FILE_xx back; it never goes to the LLM
    (out_dir / "_path_aliases.json").write_text(json.dumps(red.path_aliases, indent=1))
    return result


VERDICT_ICON = {"true_positive": "🔴", "likely_false_positive": "⚪", "needs_review": "🟡",
                "not_triaged": "·", "blocked_by_redaction": "🛑"}


def to_markdown(result: dict, top: int = 15) -> str:
    c = result["counts"]
    g = result["guard"]
    lines = [
        "## 🛡️ PipelineFortress GenAI triage",
        f"Provider: `{result['provider']}` {result['model']} · {c['findings']} findings → {c['clusters']} clusters "
        f"(dedup {result['dedup_ratio']:.0%}) · {c['sent_to_llm']} sent to LLM · "
        f"{c['secret_clusters_local']} secret clusters handled locally · guard flagged {g['hallucinations']} "
        f"hallucination(s)",
        "",
        "| # | Verdict | Sev | Score | Finding | Where | Suggested fix |",
        "|---|---|---|---|---|---|---|",
    ]
    for i, r in enumerate(result["clusters"][:top], 1):
        t = r["triage"]
        where = r["package"] + (f" {r['installed_version']}" if r["package"] else "")
        where = where or (r["files"][0] if r["files"] else "")
        if r["count"] > 1:
            where += f" (+{r['count'] - 1})"
        fix = (t.get("fix") or "").replace("\n", " ").replace("|", "\\|")[:220]
        flag = " ⚠️guard" if t.get("hallucination") else ""
        lines.append(f"| {i} | {VERDICT_ICON.get(t['verdict'], '')} {t['verdict']}{flag} | {r['severity']} | "
                     f"{r['final_rank_score']:.0f} | {r['title'][:70].replace('|', '/')} | {where[:60]} | {fix} |")
    lines += ["", "_AI-assisted triage. Verdicts are suggestions; a human owns every decision. "
                  "Secrets and source code never leave the runner (see `llm_audit/`)._"]
    return "\n".join(lines) + "\n"
