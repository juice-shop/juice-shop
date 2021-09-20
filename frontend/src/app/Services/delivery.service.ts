/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { DeliveryMethod } from '../Models/deliveryMethod.model'

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
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Deliverys'

  constructor (private readonly http: HttpClient) { }

  get () {
    return this.http.get(this.host).pipe(map((response: DeliveryMultipleMethodResponse) => response.data), catchError((err) => { throw err }))
  }

  getById (id) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return this.http.get(`${this.host}/${id}`).pipe(map((response: DeliverySingleMethodResponse) => response.data), catchError((err) => { throw err }))
  }
}
