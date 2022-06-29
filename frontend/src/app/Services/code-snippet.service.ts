/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'
import { Observable } from 'rxjs'

export interface CodeSnippet {
  vulnLines?: number[]
  snippet: string
}

export interface Solved {
  challenges: string[]
}

@Injectable({
  providedIn: 'root'
})
export class CodeSnippetService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/snippets'

  constructor (private readonly http: HttpClient) { }

  get (key: string): Observable<CodeSnippet> {
    return this.http.get<CodeSnippet>(`${this.host}/${key}`).pipe(map((response: CodeSnippet) => response), catchError((err) => { throw err }))
  }

  challenges () {
    return this.http.get(`${this.host}`).pipe(map((response: any) => response.challenges), catchError((err) => { throw err }))
  }
}
