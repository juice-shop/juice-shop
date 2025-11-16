/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})

export class DataSubjectService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/user'

  erase (params: any) {
    return this.http.post(this.host + '/erasure-request', params).pipe(catchError((error: Error) => { throw error })
    )
  }

  dataExport (params: any) {
    return this.http.post(this.host + '/data-export', params).pipe(catchError((err) => { throw err }))
  }
}
