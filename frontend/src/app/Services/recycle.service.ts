/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class RecycleService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Recycles'

  constructor (private readonly http: HttpClient) { }

  find (params?: any) {
    return this.http.get(this.host + '/', {
      params: params
    }).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }

  save (params: any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((error) => { throw error }))
  }
}
