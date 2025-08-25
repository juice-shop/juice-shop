/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import type { Observable } from 'rxjs'
import { Hint } from '../Models/hint.model'

@Injectable({
  providedIn: 'root'
})
export class HintService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Hints'

  constructor (private readonly http: HttpClient) { }

  getAll (): Observable<Hint[]> {
    return this.http.get(this.host + '/').pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  put (id: number, params): Observable<Hint> {
    return this.http.put(`${this.host}/${id}`, params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }
}
