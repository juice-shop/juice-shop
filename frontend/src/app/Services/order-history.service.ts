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
export class OrderHistoryService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/order-history'

  get () {
    return this.http.get(this.host).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  getAll () {
    return this.http.get(this.host + '/orders').pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  toggleDeliveryStatus (id: number, params) {
    return this.http.put(`${this.host}/${id}/delivery-status`, params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
