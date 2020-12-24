/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/Products'

  constructor (private readonly http: HttpClient) { }

  search (criteria: any) {
    return this.http.get(this.hostServer + '/rest/products/search?q=' + criteria).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  find (params: any) {
    return this.http.get(this.host + '/', { params: params }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  get (id: number) {
    return this.http.get(this.host + '/' + id + '?d=' + encodeURIComponent(new Date().toDateString())).pipe(map((response: any) =>
      response.data), catchError((err) => { throw err }))
  }

  put (id, params) {
    return this.http.put(this.host + '/' + id, params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
