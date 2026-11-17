# Política de bloqueo del pipeline

Para esta preentrega, el pipeline cuenta con dos etapas de seguridad con umbrales de bloqueo reales:

1. **SAST (Semgrep):** 
   * **Qué bloquea:** Hallazgos de severidad `ERROR` (Alta) en el código propio. 
   * **Qué solo avisa:** Hallazgos de severidad `WARNING` o `INFO`.

2. **SCA (Grype):**
   * **Qué bloquea:** Vulnerabilidades en dependencias de severidad **High** o **Critical** (`severity-cutoff: high`, `fail-build: true`).
   * **Qué solo avisa:** Severidades Medium, Low y Unknown (se publican como artefacto).
   * *Nota:* Al ser Juice Shop una aplicación intencionalmente vulnerable, es esperado que el gate de SCA falle con severidad High. Esto demuestra que el mecanismo de bloqueo funciona.