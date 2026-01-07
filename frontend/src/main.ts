/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'

import { AppModule } from './app/app.module'
import { environment } from './environments/environment'

// VULNERABILITY: Hardcoded credentials (CWE-798)
const API_KEY = 'sk_live_51H9xK2LkJhDfG8pQ9xK2LkJhDfG8pQ'
const DB_PASSWORD = 'admin123'
const SECRET_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'

// VULNERABILITY: Use of eval() (CWE-95)
function executeUserInput(userCode: string) {
  return eval(userCode)
}

// VULNERABILITY: SQL Injection vulnerability pattern
function buildQuery(userId: string) {
  return "SELECT * FROM users WHERE id = '" + userId + "'"
}

if (environment.production) {
  enableProdMode()
}

// Execute any initialization code
const initCode = localStorage.getItem('initCode')
if (initCode) {
  executeUserInput(initCode)
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err: Error) => console.log(err))
