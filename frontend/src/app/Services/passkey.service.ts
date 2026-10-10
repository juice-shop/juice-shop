/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map } from 'rxjs/operators'
import { environment } from '../../environments/environment'
import { type Observable } from 'rxjs'
import {
  type AuthenticationResponseJSON,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
  startAuthentication,
  startRegistration
} from '@simplewebauthn/browser'

interface AuthenticationPayload {
  token: string
  bid: number
  umail: string
}

export interface PasskeyLoginOptions {
  options: PublicKeyCredentialRequestOptionsJSON
  authToken: string
}

export interface PasskeyRegisterOptions {
  options: PublicKeyCredentialCreationOptionsJSON
  regToken: string
}

export interface PasskeyCredential {
  id: number
  credentialID: string
  transports: string
  aaguid: string
  createdAt: string
}

@Injectable({
  providedIn: 'root'
})
export class PasskeyService {
  private readonly http = inject(HttpClient)
  private readonly host = `${environment.hostServer}/rest/passkey`

  loginOptions (email?: string): Observable<PasskeyLoginOptions> {
    return this.http.post<PasskeyLoginOptions>(`${this.host}/login-options`, email ? { email } : {})
  }

  loginVerify (assertion: AuthenticationResponseJSON, authToken: string): Observable<AuthenticationPayload> {
    return this.http.post<{ authentication: AuthenticationPayload }>(`${this.host}/login-verify`, { assertion, authToken })
      .pipe(map((response) => response.authentication))
  }

  registerOptions (): Observable<PasskeyRegisterOptions> {
    return this.http.get<PasskeyRegisterOptions>(`${this.host}/register-options`)
  }

  registerVerify (attestation: RegistrationResponseJSON, regToken: string): Observable<void> {
    return this.http.post(`${this.host}/register-verify`, { attestation, regToken })
      .pipe(map(() => undefined))
  }

  listCredentials (): Observable<PasskeyCredential[]> {
    return this.http.get<{ data: PasskeyCredential[] }>(`${this.host}/credentials`)
      .pipe(map((response) => response.data))
  }

  deleteCredential (id: number): Observable<void> {
    return this.http.delete(`${this.host}/credentials/${id}`)
      .pipe(map(() => undefined))
  }

  // Thin wrappers around the browser WebAuthn ceremonies so components can mock them via this service
  createAssertion (options: PublicKeyCredentialRequestOptionsJSON): Promise<AuthenticationResponseJSON> {
    return startAuthentication({ optionsJSON: options })
  }

  createAttestation (options: PublicKeyCredentialCreationOptionsJSON): Promise<RegistrationResponseJSON> {
    return startRegistration({ optionsJSON: options })
  }
}
