/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, type Observable, of } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class HintService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/hints'

  constructor (private readonly http: HttpClient) { }

  recordHintUsage (params: { challengeKey: string, hintState: number }): Observable<any> {
    return this.http.post(this.host + '/record', params).pipe(
      catchError((err) => {
        console.error(err)
        // Return an empty observable to prevent breaking the calling code
        return of(null)
      })
    )
  }
}
