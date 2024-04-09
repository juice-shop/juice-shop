/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import { type Observable } from 'rxjs'

interface TwoFactorVerifyResponse {
  authentication: AuthenticationPayload
}

interface AuthenticationPayload {
  token: string
  bid: number
  umail: string
}

interface TwoFactorAuthStatusPayload {
  setup: boolean
  secret?: string
  setupToken?: string
  email?: string
}

@Injectable({
  providedIn: 'root'
})
export class TwoFactorAuthService {
  constructor (private readonly http: HttpClient) {}

  verify (totpToken: string): Observable<AuthenticationPayload> {
    return this.http.post<TwoFactorVerifyResponse>(`${environment.hostServer}/rest/2fa/verify`, {
      tmpToken: localStorage.getItem('totp_tmp_token'),
      totpToken
    }).pipe(map((response: TwoFactorVerifyResponse) => response.authentication), catchError((error) => { throw error }))
  }

  status (): Observable<TwoFactorAuthStatusPayload> {
    return this.http.get<TwoFactorAuthStatusPayload>(`${environment.hostServer}/rest/2fa/status`)
      .pipe(map((response: TwoFactorAuthStatusPayload) => response), catchError((error) => { throw error }))
  }

  setup (password: string, initialToken: string, setupToken?: string): Observable<void> {
    return this.http.post(`${environment.hostServer}/rest/2fa/setup`, {
      password,
      setupToken,
      initialToken
    }).pipe(map(() => undefined), catchError((error) => { throw error }))
  }

  disable (password: string): Observable<void> {
    return this.http.post(`${environment.hostServer}/rest/2fa/disable`, { password })
      .pipe(map(() => undefined), catchError((error) => { throw error }))
  }
}
