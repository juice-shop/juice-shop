#!/usr/bin/env python3
import json
import csv
import sys

def extract_vulnerabilities_from_semgrep(json_input_path, csv_output_path):
    """Извлекает ключевые поля из JSON Semgrep и сохраняет в CSV"""

    with open(json_input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    fieldnames = [
        "vulnerability_name",
        "file_path",
        "severity",
        "cwe",
        "owasp",
        "line_number",
        "references",
    ]

    with open(csv_output_path, "w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()

        for result in data.get("results", []):
            vulnerability_name = result.get("check_id", "Unknown Check")
            file_path = result.get("path", "N/A")
            severity_level = result.get("extra", {}).get("severity", "N/A")
            metadata = result.get("extra", {}).get("metadata", {})

            cwe_list = metadata.get("cwe", [])
            cwe_str = ", ".join(cwe_list) if cwe_list else "None"

            owasp_list = metadata.get("owasp", [])
            owasp_str = ", ".join(owasp_list) if owasp_list else "None"

            line_number = result.get("start", {}).get("line", "N/A")

            references_list = metadata.get("references", [])
            shortlink = metadata.get("shortlink")
            if shortlink:
                references_list.append(shortlink)

            references_str = ", ".join(references_list) if references_list else "None"

            writer.writerow({
                "vulnerability_name": vulnerability_name,
                "file_path": file_path,
                "severity": severity_level,
                "cwe": cwe_str,
                "owasp": owasp_str,
                "line_number": line_number,
                "references": references_str,
            })

    print(f"[+] CSV экспорт завершен: {csv_output_path}")

if __name__ == "__main__":
    json_input = sys.argv[1] if len(sys.argv) > 1 else "semgrep-report.json"
    csv_output = sys.argv[2] if len(sys.argv) > 2 else "semgrep-cleaned.csv"
    extract_vulnerabilities_from_semgrep(json_input, csv_output)