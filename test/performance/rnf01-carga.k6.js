/**
 * Script de pruebas de carga – k6
 * Caso Práctico Final QA – Persona 2 (Santiago Castaño Torres)
 *
 * RNF01: El sistema deberá responder en menos de 3 segundos
 *        con 20 usuarios concurrentes.
 *
 * Escenario:
 *   - 20 Virtual Users (VUs) constantes
 *   - Duración: 60 segundos
 *   - Endpoints bajo prueba:
 *       GET /rest/products/search?q=apple   (búsqueda principal)
 *       GET /rest/products/search?q=        (catálogo completo)
 *       GET /api/Products                   (endpoint REST de productos)
 *
 * Umbral de aceptación (RNF01):
 *   - p(95) de http_req_duration < 3000 ms
 *   - tasa de errores HTTP < 1 %
 *
 * Ejecución:
 *   k6 run test/performance/rnf01-carga.k6.js
 *
 * Con reporte HTML (requiere k6-reporter):
 *   k6 run --out json=results/k6-results.json test/performance/rnf01-carga.k6.js
 */

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend } from 'k6/metrics'

// ── Métricas personalizadas ───────────────────────────────────────────────────
const errorRate = new Rate('error_rate')
const searchTrend = new Trend('search_duration', true)
const catalogTrend = new Trend('catalog_duration', true)

// ── Opciones del escenario ────────────────────────────────────────────────────
export const options = {
  // RNF01: 20 VUs durante 60 segundos
  vus: 20,
  duration: '60s',

  // Thresholds (umbrales de aceptación del RNF01)
  thresholds: {
    // El p95 de TODAS las peticiones HTTP debe estar por debajo de 3 s
    http_req_duration: ['p(95)<3000'],
    // El p95 específico de la búsqueda debe estar bajo 3 s
    search_duration: ['p(95)<3000'],
    // La tasa de errores debe ser menor del 1 %
    error_rate: ['rate<0.01'],
    // La tasa de éxito (checks) debe ser mayor del 99 %
    checks: ['rate>0.99']
  }
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// ── Función principal (ejecutada por cada VU en cada iteración) ───────────────
export default function () {
  // ── Petición 1: Búsqueda con término con resultados ──────────────────────
  const searchRes = http.get(`${BASE_URL}/rest/products/search?q=apple`, {
    tags: { endpoint: 'search_apple' }
  })

  const searchOk = check(searchRes, {
    'search apple → status 200': (r) => r.status === 200,
    'search apple → content-type JSON': (r) => r.headers['Content-Type']?.includes('application/json') || false,
    'search apple → tiene resultados': (r) => {
      try {
        const body = JSON.parse(r.body)
        return Array.isArray(body.data) && body.data.length > 0
      } catch {
        return false
      }
    },
    'search apple → bajo 3 s': (r) => r.timings.duration < 3000
  })

  errorRate.add(!searchOk)
  searchTrend.add(searchRes.timings.duration)

  sleep(0.5)

  // ── Petición 2: Búsqueda sin término (catálogo completo) ─────────────────
  const catalogRes = http.get(`${BASE_URL}/rest/products/search?q=`, {
    tags: { endpoint: 'catalog_full' }
  })

  const catalogOk = check(catalogRes, {
    'catalog → status 200': (r) => r.status === 200,
    'catalog → body no vacío': (r) => r.body.length > 0,
    'catalog → bajo 3 s': (r) => r.timings.duration < 3000
  })

  errorRate.add(!catalogOk)
  catalogTrend.add(catalogRes.timings.duration)

  sleep(0.5)

  // ── Petición 3: API REST de productos (Sequelize) ─────────────────────────
  const productsRes = http.get(`${BASE_URL}/api/Products`, {
    tags: { endpoint: 'api_products' }
  })

  const productsOk = check(productsRes, {
    'api/Products → status 200': (r) => r.status === 200,
    'api/Products → bajo 3 s': (r) => r.timings.duration < 3000
  })

  errorRate.add(!productsOk)

  sleep(1)
}
