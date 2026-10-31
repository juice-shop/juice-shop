/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

// Used by `ng serve` together with proxy.conf.json so that the dev server
// talks to the backend through its own origin (localhost:4200). Requests stay
// same-origin, which is required for the `token` cookie to be sent along.
export const environment = {
  production: false,
  hostServer: '.'
}
