/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { type DeliveryMethod } from '../Models/deliveryMethod.model'

interface DeliveryMultipleMethodResponse {
  status: string
  data: DeliveryMethod[]
}

interface DeliverySingleMethodResponse {
  status: string
  data: DeliveryMethod
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Deliverys'

  get () {
    return this.http.get(this.host).pipe(map((response: DeliveryMultipleMethodResponse) => response.data), catchError((err) => { throw err }))
  }

  getById (id) {

    return this.http.get(`${this.host}/${id}`).pipe(map((response: DeliverySingleMethodResponse) => response.data), catchError((err) => { throw err }))
  }
}
