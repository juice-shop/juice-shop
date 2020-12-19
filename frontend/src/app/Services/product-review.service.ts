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
export class ProductReviewService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/rest/products'

  constructor (private http: HttpClient) { }

  get (id: number) {
    return this.http.get(this.host + '/' + id + '/reviews').pipe(
      map((response: any) => response.data), catchError(err => {
        throw err
      })
    )
  }

  create (id: number, review: { message: string; author: string }) {
    return this.http.put(this.host + '/' + id + '/reviews', review).pipe(map((response: any) => response.data),
     catchError((err) => { throw err })
    )
  }

  patch (review: { id: string; message: string }) {
    return this.http.patch(this.host + '/reviews', review).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  like (_id?: string) {
    return this.http.post(this.host + '/reviews', { id: _id }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

}
