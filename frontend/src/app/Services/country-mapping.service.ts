/*
 * Copyright (c) 2014-2023 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class CountryMappingService {
  private readonly hostServer = environment.hostServer
  constructor (private readonly http: HttpClient) { }

  getCountryMapping () {
    return this.http.get(this.hostServer + '/rest/country-mapping').pipe(catchError((err) => { throw err }))
  }
}
