/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, inject } from '@angular/core'
import { NgClass } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { HttpClient, type HttpErrorResponse } from '@angular/common/http'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { environment } from '../../environments/environment'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

@Component({
  selector: 'app-ai-widget',
  templateUrl: './ai-widget.component.html',
  styleUrls: ['./ai-widget.component.scss'],
  imports: [NgClass, FormsModule, MatButtonModule, MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule]
})
export class AiWidgetComponent {
  private readonly http = inject(HttpClient)

  isOpen = false
  isLoading = false
  draft = ''
  messages: ChatMessage[] = []

  toggle (): void {
    this.isOpen = !this.isOpen
  }

  send (): void {
    const message = this.draft.trim()
    if (!message || this.isLoading) {
      return
    }

    this.messages.push({ role: 'user', text: message })
    this.draft = ''
    this.isLoading = true

    this.http.post<{ reply: string }>(`${environment.aiAssistantUrl}/chat`, { message }).subscribe({
      next: (response) => {
        this.messages.push({ role: 'assistant', text: response.reply })
        this.isLoading = false
      },
      error: (err: HttpErrorResponse) => {
        const detail = err.status === 0
          ? 'network/CORS error contacting the assistant'
          : `HTTP ${err.status} ${err.statusText}: ${JSON.stringify(err.error ?? '')}`
        this.messages.push({ role: 'assistant', text: `Sorry, the assistant is unavailable right now. (${detail})` })
        this.isLoading = false
      }
    })
  }
}
