"""
Semgrep Supply Chain - Reachability demo (PyYAML, CVE-2020-14343).

PyYAML < 5.4 allows arbitrary code execution when untrusted input is passed to
yaml.load() with the default/FullLoader (CVE-2020-14343). The pinned version in
requirements.txt (PyYAML==5.3.1) is vulnerable, so Semgrep Supply Chain will
flag it. Reachability analysis then tells you whether your code actually *calls*
the vulnerable function.

HOW TO USE
----------
1) BASELINE SCAN  ->  finding = NOT reachable
   Leave the STEP 2 block below commented out and run a scan (see commands at
   the bottom). Semgrep reports the PyYAML CVE but marks reachability as
   "Unreachable" - nothing in the code reaches the vulnerable sink.

2) FLIP IT  ->  finding = REACHABLE
   Uncomment the STEP 2 block, then rescan. Semgrep now sees a call to the
   vulnerable sink yaml.load() and flips the same finding to "Reachable".
"""

import yaml


def load_config_safe(raw: str) -> dict:
    # safe_load() is NOT the vulnerable sink, so reachability stays clean.
    return yaml.safe_load(raw)


# ---------------------------------------------------------------------------
# STEP 2 - Uncomment this block to make the CVE-2020-14343 finding REACHABLE,
#          then rescan.
# ---------------------------------------------------------------------------
# def load_config_unsafe(raw: str) -> dict:
#     # yaml.load() with the default Loader is the vulnerable sink for
#     # CVE-2020-14343. Reaching this line is what flips the finding.
#     return yaml.load(raw)
#
#
# if __name__ == "__main__":
#     import sys
#     untrusted_input = sys.stdin.read()
#     print(load_config_unsafe(untrusted_input))
