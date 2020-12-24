/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
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
