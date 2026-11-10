#!/usr/bin/env bash
# Comprueba una etapa del entorno WAF + SIEM.
# Uso, desde waf-siem/:  ./scripts/verificar.sh elasticsearch|kibana|waf|filebeat|todo
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)" || exit 1
cd "$ROOT" || exit 1

ES_URL="${ES_URL:-http://127.0.0.1:9200}"
KIBANA_URL="${KIBANA_URL:-http://127.0.0.1:5601}"
WAF_URL="${WAF_URL:-http://127.0.0.1:8080}"

fail=0

ok() { printf 'OK     %s\n' "$1"; }
bad() { printf 'FALLO  %s\n' "$1"; fail=1; }

check_elasticsearch() {
  local body status
  body="$(curl -sf --max-time 10 "$ES_URL/_cluster/health" 2>/dev/null || true)"
  status="$(printf '%s' "$body" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')"
  case "$status" in
    green|yellow)
      ok "Elasticsearch responde ($status) en $ES_URL"
      ;;
    *)
      bad "Elasticsearch no está listo en $ES_URL (status='${status:-sin respuesta}'). Vean: docker compose logs elasticsearch"
      ;;
  esac
}

check_kibana() {
  local body
  body="$(curl -sf --max-time 15 "$KIBANA_URL/api/status" 2>/dev/null || true)"
  if printf '%s' "$body" | grep -q '"level":"available"'; then
    ok "Kibana está available en $KIBANA_URL"
  else
    bad "Kibana no está available en $KIBANA_URL. La primera vez tarda 1–2 min. Vean: docker compose logs kibana"
  fi
}

check_waf() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 -I "$WAF_URL/" 2>/dev/null || true)"
  case "$code" in
    ""|000)
      bad "El WAF no responde en $WAF_URL. Vean: docker compose ps y docker compose logs waf"
      ;;
    502)
      bad "El WAF responde 502: el contenedor está arriba, pero no llega a APP_BACKEND. Revisen .env y que su app esté corriendo."
      ;;
    *)
      ok "El WAF responde HTTP $code en $WAF_URL (no es 502: llega a la app)"
      ;;
  esac
}

check_filebeat() {
  if ! docker compose exec -T filebeat filebeat test output --strict.perms=false >/dev/null 2>&1; then
    bad "Filebeat no puede escribir en Elasticsearch. Vean: docker compose logs filebeat"
    return
  fi
  ok "filebeat test output conecta con Elasticsearch"
  local indices
  indices="$(curl -sf --max-time 10 "$ES_URL/_cat/indices/filebeat-*?h=index" 2>/dev/null || true)"
  if [ -n "$indices" ]; then
    ok "Hay índice de Filebeat:"
    printf '%s\n' "$indices" | sed 's/^/       /'
  else
    bad "Filebeat conecta, pero todavía no existe filebeat-*. Manden tráfico (./scripts/trafico-legitimo.sh) y vuelvan a verificar."
  fi
}

usage() {
  printf 'Uso: %s elasticsearch|kibana|waf|filebeat|todo\n' "$0"
  exit 2
}

etapa="${1:-}"
case "$etapa" in
  elasticsearch) check_elasticsearch ;;
  kibana) check_kibana ;;
  waf) check_waf ;;
  filebeat) check_filebeat ;;
  todo)
    check_elasticsearch
    check_kibana
    check_waf
    check_filebeat
    ;;
  *) usage ;;
esac

if [ "$fail" -ne 0 ]; then
  exit 1
fi
