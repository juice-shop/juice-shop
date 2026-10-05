#!/usr/bin/env python3
"""
Wiz & CodeMender Orchestrator
-----------------------------
Bridge between Wiz Security findings (augmented by Wiz Green Agent) and Google
CodeMender CLI for automated, agentic vulnerability remediation.

Workflow:
  1. Parse GitHub Issue for Wiz Finding reference.
  2. Fetch enriched finding details from Wiz API (with Green Agent context) or fallback to issue markdown.
  3. Transform finding into CodeMender import JSON schema.
  4. Import finding into CodeMender (`cm report import --file ...`).
  5. Execute remediation (`cm fix <FINDING_ID>`).
  6. Prepare branch and create GitHub Pull Request.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import shutil
import subprocess
import sys
from dataclasses import asdict, dataclass
from typing import Any, Dict, List, Optional
import urllib.error
import urllib.parse
import urllib.request

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("wiz-cm-orchestrator")


@dataclass
class CodeMenderFinding:
    file_path: str
    line: int
    title: str
    message: str
    severity: str
    vuln_type: str


class WizApiClient:
    """Handles authentication and queries against the Wiz GraphQL API."""

    def __init__(
        self,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        auth_url: Optional[str] = None,
        api_url: Optional[str] = None,
    ):
        self.client_id = client_id or os.environ.get("WIZ_CLIENT_ID")
        self.client_secret = client_secret or os.environ.get("WIZ_CLIENT_SECRET")
        self.auth_url = auth_url or os.environ.get(
            "WIZ_AUTH_URL", "https://auth.wiz.io/oauth/token"
        )
        self.api_url = api_url or os.environ.get(
            "WIZ_API_URL", "https://api.us1.app.wiz.io/graphql"
        )
        self._access_token: Optional[str] = None

    def authenticate(self) -> str:
        """Authenticate with Wiz OAuth2 endpoint using client credentials."""
        if self._access_token:
            return self._access_token

        if not self.client_id or not self.client_secret:
            raise ValueError(
                "Wiz client credentials not provided. Set WIZ_CLIENT_ID and WIZ_CLIENT_SECRET."
            )

        data = urllib.parse.urlencode(
            {
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "audience": "wiz-api",
            }
        ).encode("utf-8")

        req = urllib.request.Request(
            self.auth_url,
            data=data,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                self._access_token = resp_data.get("access_token")
                if not self._access_token:
                    raise RuntimeError("OAuth response missing access_token")
                logger.info("Successfully authenticated with Wiz API.")
                return self._access_token
        except urllib.error.HTTPError as exc:
            err_msg = exc.read().decode("utf-8")
            logger.error(f"Wiz Auth failed ({exc.code}): {err_msg}")
            raise RuntimeError(f"Wiz authentication failed: {err_msg}") from exc

    def query(self, query_str: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a GraphQL query against the Wiz API."""
        token = self.authenticate()
        payload = json.dumps({"query": query_str, "variables": variables or {}}).encode("utf-8")

        req = urllib.request.Request(
            self.api_url,
            data=payload,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                if "errors" in result:
                    logger.error(f"GraphQL Errors: {result['errors']}")
                    raise RuntimeError(f"GraphQL query returned errors: {result['errors']}")
                return result.get("data", {})
        except urllib.error.HTTPError as exc:
            err_msg = exc.read().decode("utf-8")
            logger.error(f"Wiz GraphQL request failed ({exc.code}): {err_msg}")
            raise RuntimeError(f"Wiz API request failed: {err_msg}") from exc

    def get_finding_details(self, finding_id: str) -> Dict[str, Any]:
        """Fetch issue / finding details by ID, including evidence and Green Agent notes."""
        query = """
        query GetFinding($id: ID!) {
          issue(id: $id) {
            id
            sourceRule {
              name
              description
            }
            severity
            status
            description
            notes
            evidence {
              ... on VulnerabilityEvidence {
                vulnerability {
                  name
                  score
                  cwe {
                    id
                    name
                  }
                }
                location {
                  path
                  line
                }
              }
            }
          }
        }
        """
        data = self.query(query, {"id": finding_id})
        issue = data.get("issue")
        if not issue:
            raise ValueError(f"Wiz issue with ID '{finding_id}' not found.")
        return issue


class IssueBodyParser:
    """Parses Wiz finding details directly from a GitHub issue markdown body."""

    @staticmethod
    def extract_finding_id(body: str) -> Optional[str]:
        """Extract finding ID from HTML comments, Wiz URLs, or metadata labels."""
        # 1. HTML comment format: <!-- wiz-finding-id: <ID> -->
        m = re.search(r"<!--\s*wiz-finding-id:\s*([a-zA-Z0-9_\-]+)\s*-->", body, re.IGNORECASE)
        if m:
            return m.group(1).strip()

        # 2. Wiz console URL format: https://app.wiz.io/issues#issue-<ID> or /findings/<ID>
        m = re.search(
            r"https://app\.wiz\.io/(?:issues#issue-|findings/|issues/)([a-zA-Z0-9_\-]+)",
            body,
            re.IGNORECASE,
        )
        if m:
            return m.group(1).strip()

        # 3. Plain text format: Finding ID: <ID> or Wiz Issue ID: <ID>
        m = re.search(r"(?:Finding|Wiz\s*Issue|Wiz)\s*ID[:\s]+`?([a-zA-Z0-9_\-]+)`?", body, re.IGNORECASE)
        if m:
            return m.group(1).strip()

        return None

    @staticmethod
    def _get_field(name: str, text: str) -> Optional[str]:
        """Extract value from markdown table row or key-value pair."""
        # Table row: | **Field** | `Value` | or | Field | Value |
        m = re.search(r'\|\s*\*{0,2}' + name + r'\*{0,2}\s*\|\s*`?([^`|\n]+)`?\s*\|', text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
        # Colon format: **Field**: `Value` or Field: Value
        m2 = re.search(r'\*{0,2}' + name + r'\*{0,2}[:\s]+`?([^\n`|]+)`?', text, re.IGNORECASE)
        if m2:
            return m2.group(1).strip()
        return None

    @classmethod
    def parse_markdown_to_finding(cls, body: str) -> CodeMenderFinding:
        """Parse structured fields from an issue created by Wiz GitHub Automation."""
        # Extract File Path
        file_path = cls._get_field(r"File(?:\s*Path)?", body) or "src/main.py"

        # Extract Line Number
        raw_line = cls._get_field(r"Line(?:\s*Number)?", body)
        line = int(raw_line) if raw_line and raw_line.isdigit() else 1

        # Extract Severity
        severity = (cls._get_field(r"Severity", body) or "HIGH").upper()

        # Extract Title / Vulnerability Name
        title = cls._get_field(r"(?:Title|Vulnerability|Rule)", body) or "Security Vulnerability"

        # Extract CWE / Vuln Type
        vuln_type = cls._get_field(r"(?:CWE|Vuln\s*Type)", body)
        if not vuln_type:
            cwe_m = re.search(r"(CWE-\d+)", body, re.IGNORECASE)
            vuln_type = cwe_m.group(1).strip() if cwe_m else "CWE-Unknown"

        # Extract Description / Green Agent Analysis
        message_parts = []
        desc_m = re.search(
            r"### Description\s*\n([\s\S]*?)(?=###|\Z)", body, re.IGNORECASE
        )
        if desc_m:
            message_parts.append(desc_m.group(1).strip())

        green_agent_m = re.search(
            r"### Wiz Green Agent Analysis\s*\n([\s\S]*?)(?=###|\Z)", body, re.IGNORECASE
        )
        if green_agent_m:
            message_parts.append(
                f"Wiz Green Agent Analysis:\n{green_agent_m.group(1).strip()}"
            )

        if not message_parts:
            # Fallback to general body text
            message = "Remediate vulnerability identified by Wiz code scanner."
        else:
            message = "\n\n".join(message_parts)

        return CodeMenderFinding(
            file_path=file_path,
            line=line,
            title=title,
            message=message,
            severity=severity,
            vuln_type=vuln_type,
        )


def transform_wiz_payload(wiz_issue: Dict[str, Any]) -> CodeMenderFinding:
    """Transforms raw Wiz GraphQL issue data into a CodeMender finding."""
    evidence_list = wiz_issue.get("evidence", []) or []
    location_path = "src/main.py"
    location_line = 1
    cwe_id = "CWE-Unknown"
    vuln_name = (wiz_issue.get("sourceRule") or {}).get("name") or "Security Vulnerability"

    for ev in evidence_list:
        loc = ev.get("location")
        if loc:
            location_path = loc.get("path") or location_path
            location_line = loc.get("line") or location_line

        vuln = ev.get("vulnerability")
        if vuln and vuln.get("cwe"):
            cwe_id = vuln["cwe"].get("id") or cwe_id
            if vuln.get("name"):
                vuln_name = vuln.get("name")

    severity = wiz_issue.get("severity", "HIGH").upper()
    description = wiz_issue.get("description") or ""
    notes = wiz_issue.get("notes") or ""

    message_blocks = [description]
    if notes:
        message_blocks.append(f"Wiz Green Agent Analysis:\n{notes}")
    message = "\n\n".join(filter(None, message_blocks))

    return CodeMenderFinding(
        file_path=location_path,
        line=int(location_line),
        title=vuln_name,
        message=message or "Remediate vulnerability identified by Wiz.",
        severity=severity,
        vuln_type=cwe_id,
    )


class CodeMenderRunner:
    """Executes CodeMender CLI commands within the local environment."""

    def __init__(self, binary_path: str = "cm"):
        self.binary = binary_path

    def _run_cmd(self, cmd: List[str], check: bool = True) -> subprocess.CompletedProcess[str]:
        logger.info(f"Executing: {' '.join(cmd)}")
        res = subprocess.run(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False,
        )
        if res.stdout:
            logger.info(f"STDOUT:\n{res.stdout.strip()}")
        if res.stderr:
            logger.warning(f"STDERR:\n{res.stderr.strip()}")

        if check and res.returncode != 0:
            raise RuntimeError(f"Command '{' '.join(cmd)}' failed with exit code {res.returncode}")
        return res

    def import_finding(self, findings_file_path: str) -> str:
        """Runs `cm report import --file <path>` and extracts the registered finding ID."""
        cmd = [self.binary, "report", "import", "--file", findings_file_path]
        res = self._run_cmd(cmd)

        # Output format typically looks like:
        # "Finding 1 registered." or "Successfully imported finding ID: 1"
        # Or parse through `cm report`
        combined_output = res.stdout + "\n" + res.stderr
        m = re.search(r"(?:finding\s*id[:\s]+|finding\s+)(\d+|[a-zA-Z0-9_\-]+)", combined_output, re.IGNORECASE)
        if m:
            finding_id = m.group(1).strip()
            logger.info(f"Identified imported finding ID: {finding_id}")
            return finding_id

        # Fallback: check `cm report`
        report_cmd = [self.binary, "report"]
        report_res = self._run_cmd(report_cmd, check=False)
        m = re.search(r"^\s*(\d+)\s+", report_res.stdout, re.MULTILINE)
        if m:
            finding_id = m.group(1).strip()
            logger.info(f"Discovered finding ID from report: {finding_id}")
            return finding_id

        # Default fallback to finding 1
        logger.warning("Could not definitively extract finding ID from cm output; defaulting to '1'")
        return "1"

    def fix(self, finding_id: str) -> bool:
        """Runs `cm fix <finding_id> -y` to perform automated code remediation."""
        cmd = [self.binary, "fix", finding_id, "-y"]
        res = self._run_cmd(cmd, check=False)
        return res.returncode == 0


def create_remediation_pr(
    issue_number: str,
    finding: CodeMenderFinding,
    branch_name: Optional[str] = None,
) -> Optional[str]:
    """Commits remediated code and opens a GitHub Pull Request via `gh` CLI."""
    if not branch_name:
        branch_name = f"codemender/fix-issue-{issue_number}"

    # Verify if git status shows modifications
    diff_check = subprocess.run(["git", "status", "--porcelain"], stdout=subprocess.PIPE, text=True)
    if not diff_check.stdout.strip():
        logger.warning("No file modifications detected after cm fix. Nothing to commit.")
        return None

    # Check out branch
    subprocess.run(["git", "checkout", "-b", branch_name], check=True)

    # Add all changed files
    subprocess.run(["git", "add", "-A"], check=True)

    # Commit
    commit_msg = (
        f"fix: remediate {finding.vuln_type} - {finding.title}\n\n"
        f"Remediates vulnerability identified by Wiz and patched by CodeMender.\n"
        f"Resolves #{issue_number}"
    )
    subprocess.run(["git", "commit", "-m", commit_msg], check=True)

    # Push branch
    subprocess.run(["git", "push", "-u", "origin", branch_name, "--force"], check=True)

    # Create Pull Request
    pr_body = f"""## 🛡️ Autonomous Vulnerability Remediation by CodeMender

### Finding Summary
* **Vulnerability:** {finding.title}
* **Type:** `{finding.vuln_type}`
* **Severity:** `{finding.severity}`
* **Location:** `{finding.file_path}:{finding.line}`
* **Fixes Issue:** #{issue_number}

### Remediation Context & Analysis
{finding.message}

---
*Verified and patched by [Google CodeMender](https://cloud.google.com/gemini-enterprise-agent-platform) based on Wiz Security findings.*
*Wiz Green Agent will automatically scan and verify this PR.*
"""

    pr_cmd = [
        "gh",
        "pr",
        "create",
        "--title",
        f"fix(security): {finding.title} (#{issue_number})",
        "--body",
        pr_body,
        "--base",
        "main",
        "--head",
        branch_name,
    ]

    pr_res = subprocess.run(pr_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
    pr_url = pr_res.stdout.strip()
    logger.info(f"Pull Request created successfully: {pr_url}")

    # Comment back on original issue
    comment_body = (
        f"🚀 **CodeMender has remediated this finding!**\n\n"
        f"A pull request has been opened with the proposed fix: {pr_url}\n"
        f"Wiz Green Agent is now analyzing the PR to verify the patch."
    )
    subprocess.run(["gh", "issue", "comment", issue_number, "--body", comment_body], check=False)

    return pr_url


def main() -> int:
    parser = argparse.ArgumentParser(description="Wiz to CodeMender Remediation Orchestrator")
    parser.add_argument("--issue-number", required=True, help="GitHub Issue number")
    parser.add_argument("--issue-body", help="Issue body markdown string or path to markdown file")
    parser.add_argument("--wiz-finding-id", help="Explicit Wiz finding / issue ID")
    parser.add_argument(
        "--output-file",
        default="./finding.json",
        help="Target path for generated CodeMender import JSON",
    )
    parser.add_argument(
        "--skip-execution",
        action="store_true",
        help="Generate CodeMender JSON only, without executing cm import/fix",
    )
    parser.add_argument(
        "--skip-pr",
        action="store_true",
        help="Run cm import/fix but skip git commit and PR creation",
    )
    args = parser.parse_args()

    # Step 1: Obtain Issue Body
    body_text = ""
    if args.issue_body:
        if os.path.isfile(args.issue_body):
            with open(args.issue_body, "r", encoding="utf-8") as f:
                body_text = f.read()
        else:
            body_text = args.issue_body
    else:
        # Fetch from GitHub CLI if available
        if shutil.which("gh"):
            logger.info(f"Fetching issue #{args.issue_number} via GitHub CLI...")
            try:
                gh_res = subprocess.run(
                    ["gh", "issue", "view", args.issue_number, "--json", "body"],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    check=False,
                )
                if gh_res.returncode == 0:
                    body_text = json.loads(gh_res.stdout).get("body", "")
                else:
                    logger.warning("Could not fetch issue body via GitHub CLI; relying on direct parameters.")
            except Exception as e:
                logger.warning(f"Error executing 'gh': {e}")
        else:
            logger.warning("'gh' CLI not found on PATH; relying on direct parameters.")

    # Step 2: Determine Finding ID
    finding_id = args.wiz_finding_id or IssueBodyParser.extract_finding_id(body_text)
    logger.info(f"Extracted Wiz Finding ID: {finding_id}")

    finding: Optional[CodeMenderFinding] = None

    # Step 3: Attempt API Fetch if credentials and finding ID are present
    has_api_creds = bool(os.environ.get("WIZ_CLIENT_ID") and os.environ.get("WIZ_CLIENT_SECRET"))
    if finding_id and has_api_creds:
        try:
            logger.info(f"Querying Wiz API for finding '{finding_id}'...")
            wiz_client = WizApiClient()
            raw_issue = wiz_client.get_finding_details(finding_id)
            finding = transform_wiz_payload(raw_issue)
            logger.info("Successfully fetched and transformed finding from Wiz GraphQL API.")
        except Exception as exc:
            logger.warning(f"Wiz API query failed ({exc}); falling back to issue markdown parsing.")

    # Step 4: Fallback to markdown parsing
    if not finding:
        logger.info("Parsing finding details directly from issue markdown...")
        finding = IssueBodyParser.parse_markdown_to_finding(body_text)

    # Step 5: Serialize to CodeMender JSON schema format
    codemender_schema_list = [asdict(finding)]
    with open(args.output_file, "w", encoding="utf-8") as f:
        json.dump(codemender_schema_list, f, indent=2)
    logger.info(f"Wrote CodeMender finding to {args.output_file}")

    if args.skip_execution:
        logger.info("Skipping CLI execution as requested.")
        return 0

    # Step 6: CodeMender Import & Fix
    cm_runner = CodeMenderRunner()
    cm_id = cm_runner.import_finding(args.output_file)
    logger.info(f"Imported into CodeMender as ID: {cm_id}. Initiating fix...")

    fix_success = cm_runner.fix(cm_id)
    if not fix_success:
        logger.error(f"cm fix failed for finding ID {cm_id}")
        return 1
    logger.info(f"cm fix successfully completed for finding ID {cm_id}")

    # Step 7: Create PR
    if not args.skip_pr:
        create_remediation_pr(args.issue_number, finding)

    return 0


if __name__ == "__main__":
    sys.exit(main())
