/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { type Observable } from 'rxjs'

export interface SystemWideNotificationResponse {
  message: string
  enabled: boolean
  updatedAt: string
}

@Injectable({
  providedIn: 'root'
})
export class CtfSystemWideNotificationService {
  private readonly http = inject(HttpClient)

  fetchNotification (url: string): Observable<SystemWideNotificationResponse> {
    return this.http.get<SystemWideNotificationResponse>(url)
  }
}
