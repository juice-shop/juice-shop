# Análisis de Hallazgos SAST (Semgrep)

Se ejecutó el pipeline en el Pull Request #2 y Semgrep analizó el código fuente de Juice Shop con las reglas públicas `p/default`. El resultado se generó en formato SARIF y contiene 75 hallazgos. A continuación se analizan los 5 más relevantes y su relación con los requisitos ASVS definidos en el diseño.

| # | Regla / ID Semgrep | Archivo de Juice Shop | Severidad | ¿Verdadero o falso positivo? | Causa / Justificación (Vinc. ASVS) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `express-sequelize-injection` | `routes/login.ts:34` | Alta | **Verdadero positivo** | El correo del usuario se concatena directo dentro de la consulta SQL del login, lo que permite modificarla. **(REQ-06)** |
| 2 | `hardcoded-jwt-secret` | `lib/insecurity.ts:54` | Media | **Verdadero positivo** | La llave privada RSA con la que se firman los JWT está escrita en el código (línea 21). Quien tenga acceso al repositorio puede falsificar tokens. **(REQ-07)** |
| 3 | `code-string-concat` | `routes/userProfile.ts:65` | Alta | **Verdadero positivo** | Se arma un texto con el nombre de usuario y se ejecuta con `eval`, lo que permite ejecutar código en el servidor. **(REQ-06)** |
| 4 | `express-open-redirect` | `routes/redirect.ts:18` | Media | **Verdadero positivo** | Se redirige a la URL que envía el usuario. La validación usa `includes`, por lo que se puede saltar. **(REQ-06)** |
| 5 | `detected-jwt-token` | `frontend/src/app/app.guard.spec.ts:46` | Alta | **Falso positivo** | Es un token de ejemplo dentro de una prueba unitaria, no una credencial real. |

