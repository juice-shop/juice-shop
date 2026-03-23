#!/usr/bin/env bash
#
# security-code-scan/scan.sh
# Run Claude Code to perform an AI-powered security audit on the codebase.
#
# Usage:
#   ./security-code-scan/scan.sh                    # Full scan
#   ./security-code-scan/scan.sh --diff main         # Diff scan (vs branch)
#   ./security-code-scan/scan.sh --files "routes/search.ts routes/login.ts"
#
# Requirements:
#   - Claude Code CLI (`claude`) installed and authenticated
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_DIR="$SCRIPT_DIR/reports"
TIMESTAMP="$(date -u +%Y%m%d_%H%M%S)"
REPORT_FILE="$REPORT_DIR/scan_${TIMESTAMP}.json"
SUMMARY_FILE="$REPORT_DIR/scan_${TIMESTAMP}_summary.md"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse arguments
SCAN_MODE="full"
DIFF_BASE=""
TARGET_FILES=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --diff)
      SCAN_MODE="diff"
      DIFF_BASE="${2:-main}"
      shift 2
      ;;
    --files)
      SCAN_MODE="files"
      TARGET_FILES="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [--diff <branch>] [--files \"file1 file2\"]"
      echo ""
      echo "Modes:"
      echo "  (default)       Full codebase security scan"
      echo "  --diff <branch> Scan only files changed vs <branch>"
      echo "  --files \"...\"   Scan specific files"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

mkdir -p "$REPORT_DIR"

echo -e "${CYAN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   🔒 Claude Code Security Scanner        ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Build the prompt based on scan mode
build_prompt() {
  local instructions
  instructions="$(cat "$SCRIPT_DIR/CLAUDE.md")"

  local scope_description
  case "$SCAN_MODE" in
    full)
      scope_description="Perform a FULL security audit of the codebase. Read all files in routes/, lib/, models/, data/, and server.ts."
      echo -e "${CYAN}Mode:${NC} Full codebase scan"
      ;;
    diff)
      local changed_files
      changed_files="$(cd "$PROJECT_ROOT" && git diff --name-only "$DIFF_BASE" -- '*.ts' '*.js' | grep -E '^(routes|lib|models|data|server\.ts|frontend/src)' || true)"
      if [[ -z "$changed_files" ]]; then
        echo -e "${GREEN}✅ No security-relevant files changed vs ${DIFF_BASE}. Nothing to scan.${NC}"
        exit 0
      fi
      scope_description="Perform a TARGETED security audit of ONLY these changed files (diff vs ${DIFF_BASE}):\n${changed_files}\n\nFocus exclusively on the code in these files."
      echo -e "${CYAN}Mode:${NC} Diff scan vs ${DIFF_BASE}"
      echo -e "${CYAN}Changed files:${NC}"
      echo "$changed_files" | sed 's/^/  /'
      ;;
    files)
      scope_description="Perform a TARGETED security audit of ONLY these files:\n${TARGET_FILES}\n\nFocus exclusively on the code in these files."
      echo -e "${CYAN}Mode:${NC} Targeted file scan"
      echo -e "${CYAN}Target files:${NC} ${TARGET_FILES}"
      ;;
  esac

  echo ""
  echo -e "${CYAN}Scanning...${NC} (this may take a few minutes)"
  echo ""

  cat <<EOF
${instructions}

## Scan Scope for This Run

${scope_description}

Now perform the security scan. Read each target file carefully, analyze it for vulnerabilities, and output the JSON report.
EOF
}

PROMPT="$(build_prompt)"

# Build Claude Code arguments
CLAUDE_ARGS=(-p --output-format json --max-turns 30)
if [[ -n "${CLAUDE_MODEL:-}" ]]; then
  CLAUDE_ARGS+=(--model "$CLAUDE_MODEL")
  echo -e "${CYAN}Model:${NC} ${CLAUDE_MODEL}"
fi

# Run Claude Code in print mode
cd "$PROJECT_ROOT"
claude "${CLAUDE_ARGS[@]}" \
  "$PROMPT" > "$REPORT_DIR/.scan_raw_${TIMESTAMP}.json" 2>/dev/null

# Extract the text content from Claude's response
# Claude --output-format json wraps in {"type":"result","result":"..."}
if command -v jq &>/dev/null; then
  # Extract the result text, then find the JSON object within it
  RESULT_TEXT="$(jq -r '.result // .' "$REPORT_DIR/.scan_raw_${TIMESTAMP}.json")"

  # Try to extract JSON from the result text (it might be wrapped in markdown)
  echo "$RESULT_TEXT" | sed -n '/^{/,/^}/p' | head -1 > /dev/null 2>&1 || true

  # Use python to robustly extract JSON
  python3 -c "
import json, sys, re

text = '''${RESULT_TEXT}'''

# Try direct JSON parse first
try:
    obj = json.loads(text)
    if 'findings' in obj:
        print(json.dumps(obj, indent=2))
        sys.exit(0)
    if 'result' in obj:
        text = obj['result']
except:
    pass

# Try to find JSON block in text
match = re.search(r'\{[\s\S]*\"findings\"[\s\S]*\}', text)
if match:
    try:
        obj = json.loads(match.group())
        print(json.dumps(obj, indent=2))
        sys.exit(0)
    except:
        pass

# Fallback: save raw
print(text)
" > "$REPORT_FILE" 2>/dev/null || cp "$REPORT_DIR/.scan_raw_${TIMESTAMP}.json" "$REPORT_FILE"
else
  cp "$REPORT_DIR/.scan_raw_${TIMESTAMP}.json" "$REPORT_FILE"
fi

# Generate summary
if command -v jq &>/dev/null && jq -e '.findings' "$REPORT_FILE" > /dev/null 2>&1; then
  TOTAL="$(jq '.summary.total_findings // (.findings | length)' "$REPORT_FILE")"
  CRITICAL="$(jq '.summary.critical // ([.findings[] | select(.severity=="CRITICAL")] | length)' "$REPORT_FILE")"
  HIGH="$(jq '.summary.high // ([.findings[] | select(.severity=="HIGH")] | length)' "$REPORT_FILE")"
  MEDIUM="$(jq '.summary.medium // ([.findings[] | select(.severity=="MEDIUM")] | length)' "$REPORT_FILE")"
  LOW="$(jq '.summary.low // ([.findings[] | select(.severity=="LOW")] | length)' "$REPORT_FILE")"

  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo -e "${CYAN}  Scan Complete — Results Summary${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Total findings: ${TOTAL}"
  [[ "$CRITICAL" != "0" ]] && echo -e "  ${RED}🔴 Critical: ${CRITICAL}${NC}"
  [[ "$HIGH" != "0" ]] && echo -e "  ${RED}🟠 High:     ${HIGH}${NC}"
  [[ "$MEDIUM" != "0" ]] && echo -e "  ${YELLOW}🟡 Medium:   ${MEDIUM}${NC}"
  [[ "$LOW" != "0" ]] && echo -e "  ${GREEN}🟢 Low:      ${LOW}${NC}"
  echo ""
  echo -e "  📄 Full report: ${REPORT_FILE}"

  # Generate markdown summary
  cat > "$SUMMARY_FILE" <<SUMMARY
# Security Scan Report

**Date:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
**Mode:** ${SCAN_MODE}
**Scanner:** Claude Code Security Audit

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${CRITICAL} |
| 🟠 High | ${HIGH} |
| 🟡 Medium | ${MEDIUM} |
| 🟢 Low | ${LOW} |
| **Total** | **${TOTAL}** |

## Findings

SUMMARY

  # Append each finding to the summary
  jq -r '.findings[] | "### \(.id): \(.title)\n\n- **Severity:** \(.severity)\n- **Category:** \(.category)\n- **File:** `\(.file)` (lines \(.line_start)-\(.line_end))\n- **CWE:** \(.cwe_id)\n- **OWASP:** \(.owasp_category)\n- **Confidence:** \(.confidence)\n\n**Description:** \(.description)\n\n**Vulnerable Code:**\n```\n\(.code_snippet)\n```\n\n**Attack Vector:** \(.attack_vector)\n\n**Remediation:** \(.remediation)\n\n---\n"' "$REPORT_FILE" >> "$SUMMARY_FILE"

  echo -e "  📋 Summary:     ${SUMMARY_FILE}"
else
  echo -e "${YELLOW}⚠️  Could not parse structured findings from Claude's response.${NC}"
  echo -e "  Raw output saved to: ${REPORT_FILE}"
fi

echo ""

# Cleanup raw file
rm -f "$REPORT_DIR/.scan_raw_${TIMESTAMP}.json"
