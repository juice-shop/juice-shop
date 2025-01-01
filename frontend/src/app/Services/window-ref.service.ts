/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class WindowRefService {
  get nativeWindow (): any {
    return getWindow()
  }
}

function getWindow (): any {
  return window
}
