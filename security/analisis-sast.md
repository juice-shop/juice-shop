# Análisis de Hallazgos SAST (Semgrep)

Tras la ejecución del pipeline en el Pull Request #1, Semgrep analizó el código fuente de Juice Shop y generó un reporte en formato SARIF. A continuación, se analizan los 5 hallazgos más relevantes (visibles en la pestaña Security de GitHub) y su relación con nuestros requisitos ASVS.

| # | Regla / ID Semgrep | Archivo de Juice Shop | Severidad | ¿Verdadero o falso positivo? | Causa / Justificación (Vinc. ASVS) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `javascript.jwt.security.audit.jwt-hardcoded-secret` | `lib/insecurity.ts` | Alta | **Verdadero positivo** | Llave criptográfica hardcodeada para firmar JWT. **(REQ-07)** |
| 2 | `javascript.lang.security.audit.sqli.node-sequelize` | `routes/login.ts` | Alta | **Verdadero positivo** | Concatenación de entrada de usuario en consulta SQL. **(REQ-06)** |
| 3 | `javascript.express.security.audit.xss.direct-response-write` | `routes/search.ts` | Media | **Verdadero positivo** | Reflejo de parámetros de búsqueda sin sanitizar en el HTML. **(REQ-06)** |
| 4 | `javascript.express.security.audit.express-check-csurf-middleware-usage` | `server.ts` | Media | **Verdadero positivo** | Falta de middleware CSRF en formularios. **(REQ-12)** |
| 5 | `generic.secrets.security.detected-private-key` | `encryptionkeys/` | Baja | **Falso positivo** | Semgrep detecta llaves de prueba del juego, no son de producción. |

*(Nota: Las advertencias de sintaxis YAML reportadas por Semgrep en el log se deben a las variables nativas de GitHub Actions y no afectan el código de la aplicación).*