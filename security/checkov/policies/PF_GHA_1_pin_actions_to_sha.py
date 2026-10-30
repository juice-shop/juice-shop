"""PF_GHA_1: third-party GitHub Actions must be pinned to a full commit SHA.

Why: a tag like `@v1` is mutable. In March 2026 attackers rewrote most tags of the
aquasecurity/trivy-action and setup-trivy actions to credential-stealing code
(CVE-2026-33634). Every pipeline that referenced those tags ran the malicious version.
A 40-character SHA cannot be moved. Actions owned by GitHub itself (actions/*, github/*)
are allowed to use tags for readability, but SHA pinning is still preferred.
"""
from __future__ import annotations

import re
from typing import Any

from checkov.common.models.enums import CheckResult
from checkov.github_actions.checks.base_github_action_check import BaseGithubActionsCheck
from checkov.yaml_doc.enums import BlockType

SHA_RE = re.compile(r"@[0-9a-f]{40}$")
TRUSTED_OWNERS = ("actions/", "github/")


class PinActionsToSha(BaseGithubActionsCheck):
    def __init__(self) -> None:
        super().__init__(
            name="Third-party GitHub Actions must be pinned to a full-length commit SHA",
            id="PF_GHA_1",
            block_type=BlockType.ARRAY,
            supported_entities=("jobs", "jobs.*.steps[]"),
        )

    def scan_conf(self, conf: dict[str, Any]) -> tuple[CheckResult, dict[str, Any]]:
        if not isinstance(conf, dict):
            return CheckResult.UNKNOWN, conf
        uses = conf.get("uses")
        if not uses or not isinstance(uses, str) or uses.startswith(("./", "docker://")):
            return CheckResult.PASSED, conf
        if uses.startswith(TRUSTED_OWNERS) or SHA_RE.search(uses):
            return CheckResult.PASSED, conf
        return CheckResult.FAILED, conf


check = PinActionsToSha()
