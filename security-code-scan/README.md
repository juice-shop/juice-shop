# Security Code Scanner — Claude Code Demo

AI-powered security vulnerability scanner using [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

## Quick Start

```bash
# Full codebase scan
./security-code-scan/scan.sh

# Scan only files changed vs main branch
./security-code-scan/scan.sh --diff main

# Scan specific files
./security-code-scan/scan.sh --files "routes/search.ts routes/login.ts"
```

## What It Does

Uses Claude Code as a "senior security engineer" to:

1. **Read** source code files in the target scope
2. **Analyze** for OWASP Top 10 vulnerabilities (SQLi, XSS, RCE, IDOR, etc.)
3. **Output** structured JSON reports with:
   - Severity rating (Critical / High / Medium / Low)
   - Exact file paths and line numbers
   - Vulnerable code snippets
   - CWE ID mapping
   - Specific remediation advice

## Files

```
security-code-scan/
├── README.md          # This file
├── CLAUDE.md          # Security audit instructions (the prompt)
├── scan.sh            # Scanner entry point
└── reports/           # Generated reports (gitignored)
    ├── scan_<ts>.json          # Full JSON report
    └── scan_<ts>_summary.md   # Human-readable summary
```

## Scan Modes

| Mode | Command | Use Case |
|------|---------|----------|
| **Full** | `./scan.sh` | Initial audit, baseline scan |
| **Diff** | `./scan.sh --diff main` | PR review, incremental changes |
| **Files** | `./scan.sh --files "..."` | Focused investigation |

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- `jq` (optional, for report parsing)
- `python3` (optional, for JSON extraction)

## Example Output

```
╔═══════════════════════════════════════════╗
║   🔒 Claude Code Security Scanner        ║
╚═══════════════════════════════════════════╝

Mode: Full codebase scan
Scanning... (this may take a few minutes)

═══════════════════════════════════════════
  Scan Complete — Results Summary
═══════════════════════════════════════════

  Total findings: 15
  🔴 Critical: 3
  🟠 High:     5
  🟡 Medium:   4
  🟢 Low:      3

  📄 Full report: reports/scan_20260323_155800.json
  📋 Summary:     reports/scan_20260323_155800_summary.md
```

## Customization

Edit `CLAUDE.md` to:
- Add/remove vulnerability categories
- Adjust severity thresholds
- Change output format
- Add project-specific security rules
