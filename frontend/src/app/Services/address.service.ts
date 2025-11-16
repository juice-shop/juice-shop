/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Addresss'

  get () {
    return this.http.get(this.host).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  getById (id) {

    return this.http.get(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((err: Error) => { throw err }))
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  put (id, params) {

    return this.http.put(`${this.host}/${id}`, params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  del (id: number) {
    return this.http.delete(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
