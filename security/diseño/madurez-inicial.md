# Diagnóstico de madurez inicial (OWASP SAMM)

Aplicación: OWASP Juice Shop (fork: proyecto-final-juice-shop)
Marco: OWASP SAMM 2.0 — 5 funciones, 15 prácticas, escala 0–3.

Se revisaron los archivos del repositorio uno por uno: workflows (`.github/workflows/`), Dockerfile, `SECURITY.md`, `threat-model.json`, `.dependabot/config.yml`, `CONTRIBUTING.md`, `test/` y `monitoring/`. Cuando no se encontró evidencia o no cumplía el criterio de SAMM para nivel 1, se asignó 0. Las prácticas con objetivo 0 quedan fuera del alcance del proyecto.

| Práctica SAMM | Nivel actual | Nivel objetivo | Evidencia del nivel actual |
|---|---|---|---|
| Estrategia y métricas | 0 | 1 | No hay plan ni metas de seguridad. `frontend-bundle-analysis.yml` mide tamaño de bundle, no seguridad. Objetivo 1: medir hallazgos y tiempos de remediación (Fase 7) |
| Políticas y cumplimiento | 0 | 1 | `SECURITY.md` cubre divulgación de vulnerabilidades, pero no hay política de seguridad del SDLC ni `politica-de-bloqueo.md`. Objetivo 1: crear política de bloqueo y protección de rama (Fase 7) |
| Educación y guía | 0 | 0 | `CONTRIBUTING.md` tiene reglas de contribución pero no de codificación segura; ESLint sin plugins de seguridad. Objetivo 0: el proyecto se enfoca en el pipeline, no en capacitación |
| Evaluación de amenazas | 0 | 2 | `threat-model.json` contiene un DFD STRIDE con 31 elementos (actores, procesos, almacenes, flujos y límites de confianza), pero 0 amenazas identificadas. Objetivo 2: agregar 12+ amenazas con mitigación y trazabilidad (Fase 2) |
| Requisitos de seguridad | 0 | 1 | No hay requisitos de seguridad. `swagger.yml` es especificación de API, no requisitos. Objetivo 1: definir 10+ requisitos ASVS nivel 1/2 (Fase 1) |
| Arquitectura de seguridad | 0 | 1 | README describe arquitectura funcional, pero no hay diseño de seguridad ni clasificación de datos. Objetivo 1: diagrama de arquitectura, DFD y clasificación de datos (Fase 1) |
| Construcción segura | 1 | 2 | `codeql-analysis.yml` corre SAST en cada push y PR con `security-extended`, permisos mínimos (actions: read, contents: read, security-events: write). `actions/checkout` fijada por SHA; CodeQL fijada a @v3. No bloquea el merge. Objetivo 2: agregar SCA + SBOM + gate de bloqueo (Fases 3–4) |
| Despliegue seguro | 1 | 2 | Dockerfile con imagen distroless (`gcr.io/distroless/nodejs24-debian13`) y `USER 65532` (no root). Sin escaneo de IaC. Objetivo 2: escaneo de IaC e imagen con Checkov/Trivy (Fase 5) |
| Gestión de defectos | 0 | 1 | `.github/ISSUE_TEMPLATE/` tiene plantillas de bugs y features, pero no hay plantilla de seguridad ni proceso de triage/remediación. Objetivo 1: centralizar hallazgos y corregir 5 vía PR (Fase 7) |
| Evaluación de arquitectura | 0 | 0 | No hay revisión formal de arquitectura. Objetivo 0: la arquitectura viene del proyecto original; el alcance cubre modelo de amenazas (TA), no revisión de arquitectura (AA) |
| Pruebas basadas en requisitos | 0 | 0 | Existen pruebas funcionales en `test/` y Cypress, pero no están trazadas a requisitos de seguridad. Objetivo 0: se definen requisitos ASVS pero no alcanza a crear pruebas para cada uno |
| Pruebas de seguridad | 0 | 1 | No hay DAST (ZAP). CodeQL es SAST y cuenta en Construcción segura. Objetivo 1: ZAP baseline en cada PR + full scan autenticado (Fase 6) |
| Gestión de incidentes | 1 | 1 | `SECURITY.md` con proceso de reporte de vulnerabilidades, incluyendo correo con PGP. Se mantiene el nivel |
| Gestión de entornos | 0 | 0 | Existen `docker-compose.test.yml` y `.devcontainer.json`, pero no hay ambientes separados (dev/staging/producción). Objetivo 0: no hay infraestructura en producción que gestionar |
| Gestión operativa | 0 | 0 | `monitoring/grafana-dashboard.json` existe pero es monitoreo funcional, no de seguridad, y no hay clasificación de datos. Objetivo 0: se necesitaría la app en producción |

Nota: `.dependabot/config.yml` usa formato antiguo (v1) y apunta a la rama `develop`, que no existe en el fork. No existe `.github/dependabot.yml` (v2). No se considera evidencia.

Nota metodológica: `SECURITY.md` se clasifica como divulgación (Gestión de incidentes), no como política del SDLC (Políticas y cumplimiento). CodeQL se clasifica como SAST (Construcción segura), no como prueba de seguridad (Pruebas de seguridad), porque analiza código estático sin ejecutar la aplicación.
