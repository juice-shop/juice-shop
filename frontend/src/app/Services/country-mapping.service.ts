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
export class CountryMappingService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer

  getCountryMapping () {
    return this.http.get(this.hostServer + '/rest/country-mapping').pipe(catchError((err) => { throw err }))
  }
}
