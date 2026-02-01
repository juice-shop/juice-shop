/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import {throwError} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Addresss'

  get () {
    return this.http.get(this.host).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }

  getById (id:any) {

    return this.http.get(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((error: Error) => throwError(() => error)))
  }

  save (params:any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }

  put (id:any, params:any) {

    return this.http.put(`${this.host}/${id}`, params).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }

  del (id: number) {
    return this.http.delete(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError(err=>throwError(()=>err)))
  }
}
