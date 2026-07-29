/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { type Observable } from 'rxjs'

export interface AiAssistantResponse {
  reply: string
  conversation_id: string
}

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private readonly http = inject(HttpClient)
  private readonly host = environment.aiAssistantUrl + '/chat'

  sendMessage (message: string, conversationId: string): Observable<AiAssistantResponse> {
    return this.http.post<AiAssistantResponse>(this.host, { message, conversation_id: conversationId })
  }
}
