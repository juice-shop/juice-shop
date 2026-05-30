# Enriched Finding Schema — For Member 4 Playbooks

Every finding that flows from the SOAR connector to Shuffle contains these fields:

| Field Name      | Example Value                        | Where It Comes From        |
|-----------------|--------------------------------------|----------------------------|
| tool            | trivy                                | Scanner that found it      |
| rule_id         | CVE-2021-44228                       | Scanner output             |
| cve_id          | CVE-2021-44228                       | Scanner output             |
| severity        | critical                             | Scanner output (normalised)|
| description     | Apache Log4j2 Remote Code Execution  | Scanner output             |
| file            | log4j-core / app/routes.py           | Scanner output             |
| line            | 42                                   | Scanner output             |
| cvss_score      | 10.0                                 | NVD API                    |
| cvss_vector     | CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C    | NVD API                    |
| severity_label  | CRITICAL                             | NVD API                    |
| cve_description | Full NVD text description            | NVD API                    |
| timestamp       | 2026-05-30T05:09:07                  | Set by connector           |

## Notes
- Findings from Semgrep and ZAP do NOT have a cve_id — cvss fields will be absent
- Trivy findings always have a cve_id and will be enriched via NVD
- Severity is normalised to lowercase: critical, high, medium, low, info
