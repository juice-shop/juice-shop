# Entorno del Proyecto Final — WAF + SIEM para su aplicación

Su aplicación queda detrás de un WAF (ModSecurity + OWASP Core Rule Set). Filebeat envía los logs del WAF a Elasticsearch y ustedes los analizan en Kibana, que funciona como SIEM del Blue Team.

```
Usuario / Red Team ──► WAF :8080 (ModSecurity + CRS) ──► SU APLICACIÓN
                          │ access.log / modsec_audit.json
                          ▼
                      Filebeat ──► Elasticsearch ──► Kibana :5601 (Blue Team)
```

El entorno trae la infraestructura. **Ustedes construyen la defensa**: conectan su aplicación, escriben las reglas de detección, arman el dashboard, pasan el WAF a modo bloqueo y ajustan los falsos positivos. Eso es lo que se evalúa en el Hito 3.

> Solo para uso local. La seguridad de Elastic está deshabilitada. Ataquen únicamente la instancia local de su propio grupo, **nunca** la versión desplegada de su aplicación (Netlify, Vercel, Render, un servidor de la empresa, etc.).

## Archivos

| Archivo | Para qué |
|---|---|
| `docker-compose.yml` | WAF, Elasticsearch, Kibana y Filebeat. Su app no está aquí (opción A) o se agrega como servicio (opción B). |
| `.env.example` | Variables a ajustar: a dónde reenvía el WAF, puerto, modo del WAF. Cópienlo a `.env`. |
| `filebeat.yml` | Qué logs se envían al SIEM. |
| `waf/REQUEST-900-…conf`, `waf/RESPONSE-999-…conf` | Sus exclusiones para falsos positivos (paso 5). |
| `app-logs/` | Opcional: logs de su aplicación (paso 6). |

Copien esta carpeta a su repositorio como `/waf-siem` y versiónenla: sus reglas y exclusiones son entregables.

## Requisitos

- Docker Desktop (o Docker Engine + Compose v2) con **al menos 6 GB de RAM asignados**. El entorno usa ~3–3.5 GB, más lo que use su app.
- Linux: `sudo sysctl -w vm.max_map_count=524288` antes de iniciar (requisito de Elasticsearch).
- Su aplicación corriendo en local, igual que en el Proyecto DAST.

## Paso 1 — Decidir qué va detrás del WAF

El WAF protege el tráfico HTTP que pasa por él. Decidan qué componente reciben los ataques:

| Tipo de app | Qué poner detrás del WAF |
|---|---|
| API (Express, Django, Spring, FastAPI…) | La API. |
| Front (React, Vue, Angular) + API separada | **La API**. Cambien la URL base de la API en el front para que apunte al WAF (`http://localhost:8080`) y permitan ese origen en CORS. |
| App monolítica / SSR (Next.js, Laravel, Django con plantillas) | La app completa. |

Luego elijan cómo conectarla:

- **Opción A — app en su máquina (rápida):** la corren como siempre (`npm run dev`, `python manage.py runserver`…) y en `.env` ponen `APP_BACKEND=http://host.docker.internal:<puerto>`.
- **Opción B — app como servicio de Docker (recomendada si ya tiene Dockerfile):** descomenten el servicio `app` en `docker-compose.yml`, **sin `ports:`**, y pongan `APP_BACKEND=http://app:<puerto>`.

La opción B es la que se usaría en producción: la app **no es accesible directamente**, solo a través del WAF. Con la opción A, el Red Team puede saltarse el WAF entrando al puerto original de la app. Si usan la opción A, documenten ese riesgo en el informe; es un hallazgo válido.

## Paso 2 — Configurar

```bash
cp .env.example .env
```

Editen en `.env`:

- `APP_BACKEND`: a dónde reenvía el WAF (paso 1).
- `WAF_PORT`: cámbienlo si su app ya usa el 8080.
- `ALLOWED_METHODS`: el CRS solo acepta `GET HEAD POST OPTIONS`. Si su API usa `PUT`, `PATCH` o `DELETE`, agréguenlos (solo los que usen); si no, en modo bloqueo esas requests recibirán 403 (regla 911100).

## Paso 3 — Levantar y verificar

La primera vez, levántenlo por etapas y no sigan si la verificación no dice
`OK`. El detalle (qué mirar en el log y el ejercicio de apagar Elasticsearch)
está en [`docs/02-preparar-el-entorno.md`](../docs/02-preparar-el-entorno.md).

```bash
docker compose up -d elasticsearch && ./scripts/verificar.sh elasticsearch
docker compose up -d kibana        && ./scripts/verificar.sh kibana
docker compose up -d waf           && ./scripts/verificar.sh waf
docker compose up -d filebeat      && ./scripts/verificar.sh filebeat
./scripts/verificar.sh todo
```

`docker compose logs -f <servicio>` muestra el arranque. Ctrl+C corta el
seguimiento, no el contenedor. Si ya conocen el entorno: `docker compose up -d`.

`docker compose ps`: todos `running`; `waf-logs-init` termina en `exited (0)`.

| Servicio | URL |
|---|---|
| Su app a través del WAF | http://localhost:8080 |
| Kibana | http://localhost:5601 (tarda 1–2 min en estar listo) |
| Elasticsearch | http://localhost:9200 |

Verificación (antes de la sesión de Blue Team):

1. `curl -i http://localhost:8080/<una ruta de su app>` → responde su app, no un error 502.
2. Generen dos ataques de prueba contra una ruta real de su app:
   ```bash
   curl -G "http://localhost:8080/<ruta>" --data-urlencode "q=' OR 1=1--"
   curl -G "http://localhost:8080/<ruta>" --data-urlencode "q=<script>alert(1)</script>"
   ```
3. El WAF los registró: `docker compose exec waf tail -n 2 /var/log/waf/modsec_audit.json`
4. Llegaron a Elasticsearch: `curl "http://localhost:9200/_cat/indices?v" | grep filebeat`
5. Kibana → **Discover** → crear data view con patrón `filebeat-*` y campo de tiempo `@timestamp`.

## Paso 4 — Construir el SIEM

### 4.1 Conocer los datos

En Discover filtren `fields.fuente : "waf-audit"`, abran un documento y ubiquen estos campos:

| Campo | Qué contiene |
|---|---|
| `modsec.transaction.client_ip` | IP de origen |
| `modsec.transaction.request.uri` | Ruta atacada |
| `modsec.transaction.messages.message` | Descripción de la regla que se disparó |
| `modsec.transaction.messages.details.ruleId` | ID de la regla del CRS |
| `modsec.transaction.messages.details.data` | Qué parámetro y qué valor la dispararon |
| `modsec.transaction.messages.details.tags` | Etiquetas como `attack-sqli`, `attack-xss` |

Filebeat guarda los campos `modsec.*` como *keyword*: la búsqueda es **exacta y distingue mayúsculas**. Por eso conviene buscar por ID de regla o por etiqueta, no por el texto del mensaje. Confirmen los nombres en su propio Discover.

### 4.2 Reglas de detección (mínimo 3, Hito 3)

Las familias de reglas del CRS se identifican por los primeros tres dígitos del ID:

| Detección | KQL |
|---|---|
| Todo lo que detectó el WAF | `fields.fuente : "waf-audit"` |
| Inyección SQL | `fields.fuente : "waf-audit" and modsec.transaction.messages.details.ruleId : 942*` |
| XSS | `fields.fuente : "waf-audit" and modsec.transaction.messages.details.ruleId : 941*` |
| Inyección de comandos (RCE) | `… ruleId : 932*` |
| Path traversal / LFI | `… ruleId : 930*` |
| Request que supera el umbral de anomalía (el WAF la bloquea o la bloquearía) | `… ruleId : 949110` |
| Alternativa por etiqueta | `… modsec.transaction.messages.details.tags : "attack-sqli"` |
| Payload en la URL (access log) | `fields.fuente : "waf-access" and message : *union*` |

En el `access.log` los payloads van codificados en URL (`%27`, `%20`) y el campo `message` se indexa en minúsculas: escriban los comodines en minúsculas.

**Ráfagas o escaneo** (muchas requests en poco tiempo): en Discover, cambien a **ES|QL** y usen

```
FROM filebeat-*
| WHERE fields.fuente == "waf-audit"
| STATS eventos = COUNT(*) BY ip = modsec.transaction.client_ip, minuto = BUCKET(@timestamp, 1 minute)
| WHERE eventos > 20
| SORT eventos DESC
```

Ajusten el umbral (20) a su app y justifíquenlo. Ojo: si el Red Team ataca desde la misma laptop, todo el tráfico llega con la misma IP (la de la red de Docker). Para diferenciar al atacante usen la ruta, el `User-Agent` o que el Red Team ataque desde otra laptop (ver `WAF_BIND` en `.env.example`).

Cada regla se **guarda** (Discover → Save) con un nombre descriptivo, por ejemplo `DET-01 SQLi en API`. Una regla cuenta solo si detecta los ataques reales del Red Team: guarden capturas con la hora y el payload.

### 4.3 Dashboard

Kibana → Dashboards → crear uno con, como mínimo:

- Eventos del WAF en el tiempo (Lens, conteo sobre `@timestamp`).
- Top de reglas disparadas (`ruleId` o `message`).
- Top de rutas atacadas (`request.uri`).
- Top de IP de origen.

Exporten las búsquedas guardadas y el dashboard (Stack Management → Saved Objects → Export) y súbanlos al repositorio como `waf-siem/kibana-export.ndjson`.

## Paso 5 — Pasar a bloqueo y ajustar falsos positivos

1. En `.env` cambien `MODSEC_RULE_ENGINE=On` y ejecuten `docker compose up -d waf` (recrea el WAF con el nuevo modo).
2. Usen la app **como usuario normal**: registro, login, formularios, búsqueda, carga de archivos. Todo lo legítimo que reciba un 403 es un **falso positivo**.
3. Para cada falso positivo: encuéntrenlo en Kibana, identifiquen el `ruleId` y el parámetro (`details.data`, la frase `found within`), y escriban la exclusión **más pequeña posible** en `waf/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf` (el archivo trae ejemplos comentados de cada tipo). El `949110` es el umbral: no se excluye. Si el ejemplo no es su caso, no lo copien: busquen ese `ruleId` en las reglas del contenedor y en la [guía de ajuste del CRS](https://coreruleset.org/docs/2-how-crs-works/2-3-false-positives-and-tuning/).
4. `docker compose restart waf` y repitan el flujo legítimo.
5. El Red Team repite sus PoC: deben recibir 403.
6. Documenten en el informe cada exclusión: ruta, regla, por qué es falso positivo y qué riesgo aceptan.

No desactiven el CRS completo ni bajen el nivel de detección para "que todo pase": eso se califica como ajuste incorrecto. Subir `BLOCKING_PARANOIA` a 2 es opcional y suma falsos positivos que también deben ajustar.

## Paso 6 (opcional) — Logs de su aplicación en el SIEM

El WAF ve el tráfico, pero no sabe si un login falló. Para detectar fuerza bruta o abuso de lógica de negocio:

1. Hagan que su app escriba una línea JSON por evento de seguridad en un archivo, por ejemplo `{"evento":"login_fallido","usuario":"ana@x.com","ip":"…","ts":"…"}`.
2. Pongan la carpeta de ese archivo en `APP_LOGS_DIR` (`.env`) y cambien `enabled: true` en el input `app` de `filebeat.yml`.
3. `docker compose up -d filebeat` y busquen `fields.fuente : "app"`.

Detrás del WAF, su app ve como origen la IP del WAF. La IP real del cliente llega en el header `X-Real-IP`: úsenla en sus logs (en Express, `app.set('trust proxy', 1)`; en Django, lean `request.META['HTTP_X_REAL_IP']`).

**Nunca escriban contraseñas ni tokens en los logs** (CWE-532).

## Seguridad de este entorno

- **Usen solo datos y cuentas de prueba.** El log de auditoría guarda el cuerpo de las requests: un login real dejaría la contraseña en Elasticsearch. Mencionen en el informe cómo lo resolverían en producción.
- Los puertos quedan en `127.0.0.1`. No cambien `WAF_BIND` a `0.0.0.0` en la red de la Universidad.
- No suban `.env` con secretos al repositorio.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| 502 Bad Gateway en :8080 | El WAF no llega a su app. Revisen `APP_BACKEND` y que la app esté corriendo. En **Linux** (opción A), la app debe escuchar en `0.0.0.0`, no solo en `127.0.0.1`. |
| `PUT`, `PATCH` o `DELETE` reciben 403 en modo On | Falta el método en `ALLOWED_METHODS` (`.env`), regla 911100. Agréguenlo y `docker compose up -d waf`. |
| Una redirección de la app pierde el puerto 8080 | Revisen que la app use el header `Host` que envía el WAF (`localhost:8080`) y no una URL fija. |
| El puerto 8080 está ocupado | Su app ya lo usa: cambien `WAF_PORT` en `.env`. |
| El front no llama a la API a través del WAF | La URL base de la API sigue apuntando al puerto original. Cámbienla a `http://localhost:8080` y ajusten CORS. |
| Kibana no muestra nada | Esperen 1–2 min; revisen `docker compose logs filebeat` y que el data view sea `filebeat-*`. |
| Una búsqueda por texto no devuelve nada | Los campos `modsec.*` son exactos: busquen por `ruleId` o `tags`. |
| Elasticsearch se cae al iniciar | Poca RAM para Docker (mínimo 6 GB) o falta `vm.max_map_count` en Linux. |
| El WAF no toma sus exclusiones | Reinicien con `docker compose restart waf` y revisen `docker compose logs waf` por errores de sintaxis. |

## Si Elastic no corre en la laptop

Usen **Elastic Cloud** (prueba gratuita de 14 días; creen la cuenta lo más cerca posible de la sesión de Blue Team). En `filebeat.yml`, reemplacen la salida:

```yaml
cloud.id: "<CLOUD_ID>"
cloud.auth: "elastic:<PASSWORD>"
```

En `docker-compose.yml`, eliminen los servicios `elasticsearch` y `kibana`. Elastic Cloud trae habilitado el **Detection Engine** (Security → Rules), que en este entorno local no está disponible porque la seguridad está deshabilitada. Ahí pueden convertir sus búsquedas en reglas con alertas.

## Apagar y limpiar

```bash
docker compose down        # conserva los datos
docker compose down -v     # borra logs e índices
```
