/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private readonly http = inject(HttpClient);

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/rest/chatbot'

  getChatbotStatus () {
    return this.http.get(this.host + '/status').pipe(map((response: any) => response), catchError((error: Error) => { throw error }))
  }

  getResponse (action, query) {
    return this.http.post(this.host + '/respond', { action, query }).pipe(map((response: any) => response), catchError((error: Error) => { throw error }))
  }
}
