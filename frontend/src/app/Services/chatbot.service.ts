/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/chatbot'

  constructor (private readonly http: HttpClient) { }

  getChatbotStatus () {
    return this.http.get(this.host + '/status').pipe(map((response: any) => response), catchError((error: Error) => { throw error }))
  }

  getResponse (action, query) {
    return this.http.post(this.host + '/respond', { action: action, query: query }).pipe(map((response: any) => response), catchError((error: Error) => { throw error }))
  }
}
