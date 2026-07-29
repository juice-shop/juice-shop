/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AiAssistantService } from '../Services/ai-assistant.service'
import { ChatInputBoxComponent } from '../chatbot/chat-input-box/chat-input-box.component'

interface WidgetMessage {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

@Component({
  standalone: true,
  selector: 'app-ai-assistant-widget',
  templateUrl: './ai-assistant-widget.component.html',
  styleUrls: ['./ai-assistant-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, ChatInputBoxComponent]
})
export class AiAssistantWidgetComponent {
  private readonly aiAssistantService = inject(AiAssistantService)
  private readonly conversationId = crypto.randomUUID()

  isOpen = signal(false)
  messages = signal<WidgetMessage[]>([])
  loading = signal(false)

  toggle () {
    this.isOpen.update((open) => !open)
  }

  sendMessage (content: string) {
    this.messages.update((messages) => [...messages, { role: 'user', content }])
    this.loading.set(true)

    this.aiAssistantService.sendMessage(content, this.conversationId).subscribe({
      next: (response) => {
        this.messages.update((messages) => [...messages, { role: 'assistant', content: response.reply }])
        this.loading.set(false)
      },
      error: () => {
        this.messages.update((messages) => [...messages, { role: 'assistant', content: 'Sorry, I could not reach the assistant. Please try again.', error: true }])
        this.loading.set(false)
      }
    })
  }
}
