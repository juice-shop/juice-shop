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
export class CodeSnippetService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/snippet'

  constructor (private readonly http: HttpClient) { }

  get (key: string) {
    return this.http.get(`${this.host}/${key}`).pipe(map((response: any) => response), catchError((err) => { throw err }))
  }
}
