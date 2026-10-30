#!/usr/bin/env python3
"""PipelineFortress metrics dashboard: one self-contained HTML file (no external scripts).

Metrics are chosen to drive decisions, not to look busy:
  * Gate outcome per stage  - did anything NEW and serious get in? (the merge decision)
  * Catch rate on seeded vulns, per stage - is the pipeline catching >= 80% before merge?
  * Time to feedback per stage - how long a developer waits for each signal
  * Noise reduction - raw findings -> clusters -> LLM-confirmed, and the measured FP/FN of the LLM
  * Redaction - what was stripped before anything left the runner
  * Burn-down input - findings by stage and severity, so the baseline can be reduced over time

Usage:
  python security/metrics/build_dashboard.py --scans collected/scans --metrics collected/metrics-out \
      --triage triage-out --seeded security/seeded_vulns.yaml --out triage-out/dashboard.html
"""
from __future__ import annotations

import argparse
import html
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "triage"))
from pftriage.gate import blocks, load_policy  # noqa: E402
from pftriage.models import SEVERITIES  # noqa: E402
from pftriage.normalize import load_dir  # noqa: E402

try:
    import yaml
except ImportError:  # pragma: no cover
    yaml = None

STAGE_ORDER = ["secrets", "sast", "sca", "iac", "container", "dast"]
STAGE_LABEL = {"secrets": "Secrets", "sast": "SAST", "sca": "SCA", "iac": "IaC", "container": "Container", "dast": "DAST"}
# ordinal one-hue ramp (blue), lightest step >= 2:1 on the surface; CRITICAL darkest
SEV_LIGHT = {"INFO": "#86b6ef", "LOW": "#5598e7", "MEDIUM": "#2a78d6", "HIGH": "#1c5cab", "CRITICAL": "#0d366b"}
SEV_DARK = {"INFO": "#184f95", "LOW": "#256abf", "MEDIUM": "#3987e5", "HIGH": "#6da7ec", "CRITICAL": "#b7d3f6"}
esc = html.escape


# ---------------------------------------------------------------------------- data
def load_json(p: Path, default=None):
    try:
        return json.loads(p.read_text())
    except (OSError, json.JSONDecodeError):
        return default


def seeded_results(findings, seeded_path: Path, policy: dict):
    if not seeded_path or not seeded_path.exists() or yaml is None:
        return None
    items = (yaml.safe_load(seeded_path.read_text()) or {}).get("seeded", [])
    rows = []
    present = False
    for it in items:
        m = it["match"]
        kws = [k.lower() for k in m.get("keywords", ["*"])]
        hits = []
        for f in findings:
            path = f.file[2:] if f.file.startswith("./") else f.file.lstrip("/")
            if "file" in m and path != m["file"]:
                continue
            if "package" in m and f.package != m["package"]:
                continue
            text = f"{f.rule_id} {f.title}".lower()
            if "*" in kws or any(k in text for k in kws):
                hits.append(f)
        if any(f.file == m.get("file") or f.package == m.get("package") for f in findings):
            present = True
        blocked = [f for f in hits if f.stage in policy["blocking_stages"] and blocks(f, policy)]
        rows.append({"id": it["id"], "title": it["title"], "category": it["category"],
                     "stages": sorted({f.stage for f in hits}, key=STAGE_ORDER.index),
                     "caught": bool(hits), "blocked": bool(blocked),
                     "best": max((f.severity for f in hits), key=SEVERITIES[::-1].index, default="")})
    if not present:
        return None   # this run is not the seeded branch
    return rows


# ---------------------------------------------------------------------------- svg helpers
def stacked_bars(by_stage: dict) -> str:
    stages = [s for s in STAGE_ORDER if s in by_stage]
    if not stages:
        return "<p class='muted'>No findings.</p>"
    maxv = max(sum(by_stage[s].values()) for s in stages) or 1
    W, bar_h, gap, left, right = 640, 22, 14, 86, 56
    H = len(stages) * (bar_h + gap) + 8
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="Findings by stage and severity" class="chart">']
    for i, s in enumerate(stages):
        y = 4 + i * (bar_h + gap)
        out.append(f'<text x="{left - 10}" y="{y + bar_h / 2 + 4}" text-anchor="end" class="axis">{STAGE_LABEL[s]}</text>')
        x = left
        total = sum(by_stage[s].values())
        segs = [(sev, by_stage[s].get(sev, 0)) for sev in reversed(SEVERITIES) if by_stage[s].get(sev, 0)]
        for j, (sev, v) in enumerate(segs):
            w = max(2.0, (W - left - right) * v / maxv)
            last = j == len(segs) - 1
            w_draw = w - (0 if last else 2)   # 2px surface gap between segments
            rx = 4 if last else 0
            out.append(f'<rect x="{x:.1f}" y="{y}" width="{w_draw:.1f}" height="{bar_h}" rx="{rx}" fill="{SEV_LIGHT[sev]}" '
                       f'class="sev-{sev.lower()} mark" data-tip="{STAGE_LABEL[s]} · {sev}: {v}"><title>{STAGE_LABEL[s]} {sev}: {v}</title></rect>')
            if last and rx:
                out.append(f'<rect x="{x:.1f}" y="{y}" width="{min(4, w_draw):.1f}" height="{bar_h}" fill="{SEV_LIGHT[sev]}" class="sev-{sev.lower()}" pointer-events="none"/>')
            x += w
        out.append(f'<text x="{x + 6:.1f}" y="{y + bar_h / 2 + 4}" class="value">{total}</text>')
    out.append("</svg>")
    legend = "".join(f'<span class="key"><i class="sev-{s.lower()}"></i>{s.title()}</span>' for s in SEVERITIES)
    return "".join(out) + f'<div class="legend">{legend}</div>'


def simple_bars(rows: list[tuple[str, float]], unit: str, aria: str) -> str:
    rows = [r for r in rows if r[1] is not None]
    if not rows:
        return "<p class='muted'>No data.</p>"
    maxv = max(v for _, v in rows) or 1
    W, bar_h, gap, right = 640, 18, 12, 110
    left = max(86, 24 + 8 * max(len(label) for label, _ in rows))
    H = len(rows) * (bar_h + gap) + 8
    out = [f'<svg viewBox="0 0 {W} {H}" role="img" aria-label="{esc(aria)}" class="chart">']
    for i, (label, v) in enumerate(rows):
        y = 4 + i * (bar_h + gap)
        w = max(2.0, (W - left - right) * v / maxv)
        out.append(f'<text x="{left - 10}" y="{y + bar_h / 2 + 4}" text-anchor="end" class="axis">{esc(label)}</text>')
        out.append(f'<rect x="{left}" y="{y}" width="{w:.1f}" height="{bar_h}" rx="4" fill="#2a78d6" class="series-1 mark" '
                   f'data-tip="{esc(label)}: {v:g} {unit}"><title>{esc(label)}: {v:g} {unit}</title></rect>')
        out.append(f'<rect x="{left}" y="{y}" width="{min(4, w):.1f}" height="{bar_h}" fill="#2a78d6" class="series-1" pointer-events="none"/>')
        out.append(f'<text x="{left + w + 6:.1f}" y="{y + bar_h / 2 + 4}" class="value">{v:g} {unit}</text>')
    out.append("</svg>")
    return "".join(out)


def status_badge(status: str) -> str:
    if status == "FAILED":
        return '<span class="badge crit">✕ Blocked</span>'
    if status == "passed":
        return '<span class="badge good">✓ Passed</span>'
    if status.startswith("report-only"):
        return '<span class="badge warn">◷ Report-only (no baseline)</span>'
    return f'<span class="badge warn">! {esc(status)}</span>'


def tile(label: str, value: str, sub: str = "") -> str:
    return f'<div class="tile"><div class="tl">{esc(label)}</div><div class="tv">{esc(value)}</div><div class="ts">{esc(sub)}</div></div>'


# ---------------------------------------------------------------------------- build
def build(args) -> tuple[str, str]:
    scans = Path(args.scans)
    findings = load_dir(scans) if scans.exists() else []
    policy = load_policy(args.policy)
    stage_metrics = {}
    for p in sorted(Path(args.metrics).glob("stage-*.json")) if Path(args.metrics).exists() else []:
        m = load_json(p, {})
        stage_metrics[m.get("stage")] = m
    tri = load_json(Path(args.triage) / "triage.json", {}) or {}
    ev = load_json(Path(args.triage) / "evaluation.json", None)
    seeded = seeded_results(findings, Path(args.seeded) if args.seeded else None, policy)

    by_stage: dict[str, dict] = {}
    for f in findings:
        by_stage.setdefault(f.stage, {}).setdefault(f.severity, 0)
        by_stage[f.stage][f.severity] += 1

    fast = [stage_metrics[s]["duration_s"] for s in ("secrets", "sast", "sca", "iac")
            if s in stage_metrics and stage_metrics[s].get("duration_s")]
    feedback = max(fast) if fast else None
    blocked = [s for s, m in stage_metrics.items() if m.get("failed")]
    counts = tri.get("counts", {})
    verdicts: dict[str, int] = {}
    for r in tri.get("clusters", []):
        v = r["triage"].get("verdict", "?")
        verdicts[v] = verdicts.get(v, 0) + 1
    run = next(iter(stage_metrics.values()), {})

    tiles = [
        tile("Merge decision", "BLOCKED" if blocked else "OK to merge",
             ("blocked by " + ", ".join(STAGE_LABEL.get(s, s) for s in blocked)) if blocked else "no new finding above any threshold"),
        tile("Time to first feedback", f"{feedback / 60:.1f} min" if feedback else "n/a", "slowest of the 4 parallel fast stages"),
        tile("Raw findings → clusters", f"{len(findings)} → {counts.get('clusters', '?')}",
             f"{tri.get('dedup_ratio', 0):.0%} duplicates merged" if tri else ""),
    ]
    if seeded:
        caught = sum(r["caught"] for r in seeded)
        blk = sum(r["blocked"] for r in seeded)
        tiles.append(tile("Seeded vulns blocked before merge", f"{blk}/{len(seeded)}",
                          f"{blk / len(seeded):.0%} blocked · {caught / len(seeded):.0%} detected · target 80%"))
    if ev:
        tiles.append(tile("LLM triage precision", f"{ev['precision'] if ev['precision'] is not None else 'n/a'}",
                          f"scanner-only {ev['scanner_only_precision']} · {ev['confusion']['FN']} real issue(s) dismissed"))
    if tri:
        tiles.append(tile("Guard catches", str(tri.get("guard", {}).get("hallucinations", 0)),
                          "LLM answers with invented ids/versions"))

    gate_rows = []
    for s in STAGE_ORDER:
        m = stage_metrics.get(s)
        if not m:
            continue
        thr = policy["thresholds"].get(s, "")
        gate_rows.append(
            f"<tr><td>{STAGE_LABEL[s]}</td><td>{esc(m.get('tool', ''))}</td><td>{status_badge(m.get('status', ''))}</td>"
            f"<td>{thr}+{'' if s in policy['blocking_stages'] else ' (non-blocking)'}</td>"
            f"<td class='num'>{m.get('total', 0)}</td><td class='num'>{'' if m.get('new') is None else m['new']}</td>"
            f"<td class='num'>{m.get('violations', 0)}</td>"
            f"<td class='num'>{'' if not m.get('duration_s') else f'{m['duration_s'] / 60:.1f} min'}</td></tr>")

    seeded_html = ""
    if seeded:
        head = "".join(f"<th>{STAGE_LABEL[s]}</th>" for s in STAGE_ORDER)
        body = []
        for r in seeded:
            cells = "".join(f"<td class='c'>{'●' if s in r['stages'] else '<span class=muted>·</span>'}</td>" for s in STAGE_ORDER)
            res = ('<span class="badge good">✓ Blocked</span>' if r["blocked"] else
                   '<span class="badge warn">! Detected, not blocked</span>' if r["caught"] else
                   '<span class="badge crit">✕ Missed</span>')
            body.append(f"<tr><td>{r['id']}</td><td>{esc(r['title'])}</td>{cells}<td>{res}</td></tr>")
        seeded_html = (f"<section><h2>Seeded vulnerabilities: what caught what</h2><p class='muted'>Nine known bugs "
                       f"were planted on a demo branch (security/seeded_vulns.yaml). ● = the stage reported it. "
                       f"'Blocked' = a blocking gate would stop the merge.</p><div class='scroll'><table><thead><tr><th>ID</th>"
                       f"<th>Seeded issue</th>{head}<th>Result</th></tr></thead><tbody>{''.join(body)}</tbody></table></div></section>")

    ev_html = ""
    if ev:
        cm = ev["confusion"]
        ev_html = f"""<section><h2>LLM triage quality vs. human labels</h2>
<p class="muted">{ev['labelled_clusters']} clusters labelled by hand in security/ground_truth.yaml. A false negative
(real issue dismissed as a false positive) is the dangerous error.</p>
<div class="scroll"><table class="cm"><thead><tr><th></th><th>Label: real</th><th>Label: false positive</th></tr></thead><tbody>
<tr><th>LLM: true positive</th><td class="num">TP {cm['TP']}</td><td class="num">FP {cm['FP']}</td></tr>
<tr><th>LLM: likely false positive</th><td class="num"><b>FN {cm['FN']}</b></td><td class="num">TN {cm['TN']}</td></tr>
<tr><th>LLM: needs review</th><td class="num">{cm['deferred_real']}</td><td class="num">{cm['deferred_fp']}</td></tr>
</tbody></table></div></section>"""

    red = tri.get("redaction_events", {})
    red_rows = "".join(f"<tr><td>{esc(k)}</td><td class='num'>{v}</td></tr>" for k, v in sorted(red.items(), key=lambda kv: -kv[1]))
    top_rows = []
    for r in tri.get("clusters", [])[:12]:
        t = r["triage"]
        where = r.get("package") or (r["files"][0] if r.get("files") else "")
        top_rows.append(f"<tr><td>{esc(r['severity'])}</td><td>{esc((r['title'].strip() or r['rule_id'] or r.get('package', ''))[:80])}</td><td>{esc(where[:50])}</td>"
                        f"<td>{esc(t.get('verdict', ''))}{' ⚠ guard' if t.get('hallucination') else ''}</td>"
                        f"<td class='num'>{r['final_rank_score']:.0f}</td></tr>")

    dur_rows = [(STAGE_LABEL[s], round(stage_metrics[s]["duration_s"] / 60, 1)) for s in STAGE_ORDER
                if s in stage_metrics and stage_metrics[s].get("duration_s")]
    sev_table = "".join(f"<tr><td>{STAGE_LABEL[s]}</td>" + "".join(f"<td class='num'>{by_stage[s].get(v, 0)}</td>" for v in SEVERITIES) + "</tr>"
                        for s in STAGE_ORDER if s in by_stage)
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    vars_light = "".join(f"--sev-{k.lower()}:{v};" for k, v in SEV_LIGHT.items())
    vars_dark = "".join(f"--sev-{k.lower()}:{v};" for k, v in SEV_DARK.items())
    sev_classes = "".join(f".sev-{k.lower()}{{fill:var(--sev-{k.lower()});background:var(--sev-{k.lower()})}}" for k in SEV_LIGHT)
    page = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PipelineFortress Metrics</title>
<style>
:root{{--surface:#fcfcfb;--page:#f9f9f7;--ink:#0b0b0b;--ink2:#52514e;--muted:#898781;--grid:#e1e0d9;--ring:rgba(11,11,11,.10);
--s1:#2a78d6;--good:#0ca30c;--warn:#fab219;--crit:#d03b3b;{vars_light}color-scheme:light}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--surface:#1a1a19;--page:#0d0d0d;--ink:#f0efec;--ink2:#c3c2b7;--muted:#898781;--grid:#2c2c2a;--ring:rgba(255,255,255,.10);--s1:#3987e5;{vars_dark}color-scheme:dark}}}}
:root[data-theme="dark"]{{--surface:#1a1a19;--page:#0d0d0d;--ink:#f0efec;--ink2:#c3c2b7;--grid:#2c2c2a;--ring:rgba(255,255,255,.10);--s1:#3987e5;{vars_dark}color-scheme:dark}}
{sev_classes}
*{{box-sizing:border-box}}body{{margin:0;background:var(--page);color:var(--ink);font:14px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}}
main{{max-width:1040px;margin:0 auto;padding:24px 16px 48px}}h1{{font-size:22px;margin:0 0 4px}}h2{{font-size:16px;margin:0 0 8px}}
.muted{{color:var(--ink2)}}section{{background:var(--surface);border:1px solid var(--ring);border-radius:10px;padding:16px;margin:16px 0}}
.tiles{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:16px}}
.tile{{background:var(--surface);border:1px solid var(--ring);border-radius:10px;padding:14px}}.tl{{color:var(--ink2);font-size:12px;text-transform:uppercase;letter-spacing:.04em}}
.tv{{font-size:26px;font-weight:650;margin:2px 0}}.ts{{color:var(--ink2);font-size:12px}}
table{{border-collapse:collapse;width:100%}}th,td{{text-align:left;padding:6px 8px;border-bottom:1px solid var(--grid);vertical-align:top}}
th{{color:var(--ink2);font-weight:600;font-size:12px}}.num{{text-align:right;font-variant-numeric:tabular-nums}}td.c{{text-align:center}}
.scroll{{overflow-x:auto}}.badge{{display:inline-block;padding:1px 8px;border-radius:999px;font-size:12px;font-weight:600;border:1px solid var(--ring);white-space:nowrap}}
.badge.good{{color:var(--ink)}}.badge.good::first-letter{{color:var(--good)}}.badge.warn::first-letter{{color:#c98500}}.badge.crit::first-letter{{color:var(--crit)}}
.chart{{width:100%;height:auto;display:block}}.axis{{fill:var(--ink2);font-size:12px}}.value{{fill:var(--ink);font-size:12px;font-variant-numeric:tabular-nums}}
.series-1{{fill:var(--s1)}}.mark:hover{{opacity:.8}}.legend{{display:flex;flex-wrap:wrap;gap:14px;margin-top:6px;color:var(--ink2);font-size:12px}}
.key i{{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:6px;vertical-align:-1px}}
.grid2{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}}details{{margin-top:8px}}summary{{cursor:pointer;color:var(--ink2);font-size:12px}}
#tip{{position:fixed;pointer-events:none;background:var(--surface);color:var(--ink);border:1px solid var(--ring);border-radius:6px;padding:4px 8px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.15);display:none}}
</style></head><body><main>
<h1>PipelineFortress metrics</h1>
<div class="muted">Run {esc(str(run.get('run_id', 'local')))} · {esc(str(run.get('event', '')))} · {esc(str(run.get('sha', '')))} · generated {generated}</div>
<div class="tiles">{''.join(tiles)}</div>
<section><h2>Gates (new findings only, compared with the baseline)</h2><div class="scroll"><table><thead><tr><th>Stage</th><th>Tool</th><th>Result</th>
<th>Threshold</th><th class="num">Total</th><th class="num">New</th><th class="num">Blocking</th><th class="num">Duration</th></tr></thead>
<tbody>{''.join(gate_rows) or '<tr><td colspan=8 class=muted>No stage metrics found.</td></tr>'}</tbody></table></div></section>
{seeded_html}
<div class="grid2">
<section><h2>Findings by stage and severity</h2>{stacked_bars(by_stage)}
<details><summary>Table view</summary><div class="scroll"><table><thead><tr><th>Stage</th>{''.join(f'<th class=num>{s.title()}</th>' for s in SEVERITIES)}</tr></thead><tbody>{sev_table}</tbody></table></div></details></section>
<section><h2>Time to feedback per stage</h2>{simple_bars(dur_rows, 'min', 'Duration per stage in minutes')}
<p class="muted">Secrets, SAST, SCA and IaC run in parallel; the build/DAST job runs alongside them.</p></section>
</div>
{ev_html}
<div class="grid2">
<section><h2>Triage verdicts</h2>{simple_bars(sorted(verdicts.items(), key=lambda kv: -kv[1]), 'clusters', 'Clusters per triage verdict')}
<p class="muted">{counts.get('sent_to_llm', 0)} clusters sent to the LLM ({esc(tri.get('provider', ''))} {esc(tri.get('model', ''))}),
{counts.get('secret_clusters_local', 0)} secret clusters kept local, {counts.get('blocked_by_redaction', 0)} blocked by redaction.</p></section>
<section><h2>Redaction: what never left the runner</h2><div class="scroll"><table><thead><tr><th>Item</th><th class="num">Count</th></tr></thead>
<tbody>{red_rows or '<tr><td colspan=2 class=muted>No triage run.</td></tr>'}</tbody></table></div></section>
</div>
<section><h2>Top risks after triage</h2><div class="scroll"><table><thead><tr><th>Severity</th><th>Finding</th><th>Where</th><th>LLM verdict</th><th class="num">Score</th></tr></thead>
<tbody>{''.join(top_rows) or '<tr><td colspan=5 class=muted>No triage run.</td></tr>'}</tbody></table></div></section>
</main><div id="tip"></div>
<script>
const tip=document.getElementById('tip');
document.querySelectorAll('[data-tip]').forEach(el=>{{
 el.addEventListener('mousemove',e=>{{tip.textContent=el.dataset.tip;tip.style.display='block';tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY+12)+'px'}});
 el.addEventListener('mouseleave',()=>tip.style.display='none');}});
</script></body></html>"""

    md = ["## 📊 PipelineFortress summary", "",
          f"**Merge decision:** {'❌ BLOCKED by ' + ', '.join(STAGE_LABEL.get(s, s) for s in blocked) if blocked else '✅ no new finding above any threshold'}",
          f"**Time to first feedback:** {f'{feedback / 60:.1f} min' if feedback else 'n/a'} · "
          f"**Findings:** {len(findings)} raw → {counts.get('clusters', '?')} clusters", ""]
    if stage_metrics:
        md += ["| Stage | Result | Total | New | Blocking |", "|---|---|---|---|---|"]
        for s in STAGE_ORDER:
            if s in stage_metrics:
                m = stage_metrics[s]
                md.append(f"| {STAGE_LABEL[s]} | {m['status']} | {m['total']} | {'' if m['new'] is None else m['new']} | {m['violations']} |")
    if seeded:
        blk = sum(r["blocked"] for r in seeded)
        md += ["", f"**Seeded vulnerabilities blocked before merge: {blk}/{len(seeded)} ({blk / len(seeded):.0%})**, "
                   f"detected: {sum(r['caught'] for r in seeded)}/{len(seeded)} (target 80%)", "",
               "| ID | Issue | Caught by | Result |", "|---|---|---|---|"]
        for r in seeded:
            md.append(f"| {r['id']} | {r['title']} | {', '.join(STAGE_LABEL[s] for s in r['stages']) or '—'} | "
                      f"{'✅ blocked' if r['blocked'] else '⚠️ detected only' if r['caught'] else '❌ missed'} |")
    md.append("")
    return page, "\n".join(md)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scans", default="collected/scans")
    ap.add_argument("--metrics", default="collected/metrics-out")
    ap.add_argument("--triage", default="triage-out")
    ap.add_argument("--seeded", default="security/seeded_vulns.yaml")
    ap.add_argument("--policy", default="security/policy.yaml")
    ap.add_argument("--out", default="triage-out/dashboard.html")
    args = ap.parse_args()
    page, md = build(args)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(page)
    (out.parent / "dashboard_summary.md").write_text(md)
    print(f"dashboard -> {out}")


if __name__ == "__main__":
    main()
