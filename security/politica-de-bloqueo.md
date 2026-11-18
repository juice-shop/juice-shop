# Política de bloqueo del pipeline

Para esta preentrega, el pipeline cuenta con dos etapas de seguridad con umbrales de bloqueo:

1. **SAST (Semgrep):**
   * **Qué bloquea:** Hallazgos de severidad `ERROR` (Alta) en el código propio.
   * **Qué solo avisa:** Hallazgos de severidad `WARNING` o `INFO`.

2. **SCA (Grype):**
   * **Qué bloquea:** Vulnerabilidades en dependencias de severidad **High** o **Critical** (`severity-cutoff: high`, `fail-build: true`).
   * **Qué solo avisa:** Severidades Medium, Low y Unknown.
   * *Nota:* Juice Shop no incluye `package-lock.json`, por lo que todavía no se revisan las librerías de npm. Esto se completa en la Fase 4.
