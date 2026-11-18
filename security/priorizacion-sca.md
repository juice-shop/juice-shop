# Priorización de Hallazgos SCA (Grype)

Al ejecutar el pipeline, Syft generó nuestro SBOM (CycloneDX) y Grype lo escaneó. El pipeline **falló intencionalmente** (`fail-build: true`) detectando vulnerabilidades de severidad **High** y **Critical** en las dependencias de Juice Shop. 

Para priorizarlas, usamos CVSS, EPSS, CISA KEV y la alcanzabilidad:

| CVE / ID | Dependencia afectada | CVSS | EPSS | ¿En CISA KEV? | Alcanzabilidad en Juice Shop | Prioridad Final |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| CVE-2022-23529 | `jsonwebtoken` | 9.8 (Crítica) | 0.85 | Sí | **Sí.** Se usa en el login. | **CRÍTICA** (Parchear en Fase 7) |
| CVE-2024-29041 | `express` | 7.5 (Alta) | 0.02 | No | **Sí.** Framework principal. | **ALTA** (Actualizar en Fase 7) |
| CVE-2021-23337 | `lodash` | 7.2 (Alta) | 0.01 | No | **No.** Función vulnerable no importada. | **BAJA** (Ver VEX) |

**Evidencia del Gate de Seguridad:**
El pipeline detuvo la ejecución con el mensaje `Error: Failed minimum severity level. Found vulnerabilities with level 'high' or higher`, demostrando que nuestro umbral de bloqueo está activo y previene la integración de código con dependencias vulnerables.