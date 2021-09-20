/*
 * Copyright (c) 2014-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})

export class DataSubjectService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/user'

  constructor (private readonly http: HttpClient) { }

  erase (params: any) {
    return this.http.post(this.host + '/erasure-request', params).pipe(catchError(error => { throw error })
    )
  }

  dataExport (params: any) {
    return this.http.post(this.host + '/data-export', params).pipe(catchError((err) => { throw err }))
  }
}
