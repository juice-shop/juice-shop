"""PF_DOCKER_1: the final USER must be a numeric, non-zero UID.

Kubernetes `runAsNonRoot: true` can only verify a *numeric* user. A named user such as
`USER node` makes the kubelet refuse to start the pod ("cannot verify user is non-root"),
which teams then "fix" by removing runAsNonRoot. A numeric UID avoids that trap.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

from checkov.common.models.enums import CheckCategories, CheckResult
from checkov.dockerfile.base_dockerfile_check import BaseDockerfileCheck

if TYPE_CHECKING:
    from dockerfile_parse.parser import _Instruction


class NumericNonRootUser(BaseDockerfileCheck):
    def __init__(self) -> None:
        super().__init__(
            name="Final USER must be a numeric non-root UID (verifiable by runAsNonRoot)",
            id="PF_DOCKER_1",
            categories=(CheckCategories.APPLICATION_SECURITY,),
            supported_instructions=("USER",),
        )

    def scan_resource_conf(self, conf: list[_Instruction]) -> tuple[CheckResult, list[_Instruction] | None]:
        last = conf[-1]
        uid = str(last["value"]).split(":")[0].strip()
        if uid.isdigit() and int(uid) != 0:
            return CheckResult.PASSED, [last]
        return CheckResult.FAILED, [last]


check = NumericNonRootUser()
