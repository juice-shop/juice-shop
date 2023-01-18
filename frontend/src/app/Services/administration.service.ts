/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
  })
export class AdministrationService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/admin'

  constructor (private readonly http: HttpClient) { }

  getApplicationVersion () {
    return this.http.get(this.host + '/application-version').pipe(
      map((response: any) => response.version),
      catchError((error: Error) => { throw error })
    )
  }
}
