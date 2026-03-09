/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, signal, viewChild, computed, ElementRef, afterNextRender, inject, Injector, runInInjectionContext } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ChatService, type ToolCall } from '../Services/chat.service'
import { ChatInputBoxComponent } from './chat-input-box/chat-input-box.component'
import { ChatWelcomeScreenComponent } from './chat-welcome-screen/chat-welcome-screen.component'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  tool_calls?: ToolCall[]
}

@Component({
  standalone: true,
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    ChatInputBoxComponent,
    ChatWelcomeScreenComponent
  ]
})
export class ChatbotComponent {
  private readonly chatService = inject(ChatService)
  private readonly injector = inject(Injector)
  private readonly chatWindow = viewChild<ElementRef<HTMLDivElement>>('chatWindow')

  messages = signal<ChatMessage[]>([])
  isLoading = signal(false)
  messageInput = signal('')
  hasStarted = computed(() => this.messages().length > 0)

  private scrollToBottom () {
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        const el = this.chatWindow()?.nativeElement
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    })
  }

  async sendMessage (content: string) {
    if (!content || this.isLoading()) return

    this.messages.update(prev => [...prev, { role: 'user', content }])
    this.messageInput.set('')
    this.isLoading.set(true)
    this.scrollToBottom()

    const assistantIndex = this.messages().length
    this.messages.update(prev => [...prev, { role: 'assistant', content: '' }])

    // Send full conversation history, excluding the empty assistant placeholder
    const apiMessages = this.messages()
      .slice(0, -1)
      .map(m => ({ role: m.role, content: m.content }))

    const stream = this.chatService.streamMessages(apiMessages)
    for await (const chunk of stream) {
      if (chunk.deltaContent) {
        this.messages.update(prev => {
          const updated = [...prev]
          updated[assistantIndex] = {
            ...updated[assistantIndex],
            content: updated[assistantIndex].content + chunk.deltaContent
          }
          return updated
        })
      }
      if (chunk.deltaToolCalls) {
        this.messages.update(prev => {
          const updated = [...prev]
          updated[assistantIndex] = {
            ...updated[assistantIndex],
            tool_calls: [...(updated[assistantIndex].tool_calls || []), ...chunk.deltaToolCalls!]
          }
          return updated
        })
      }
      this.scrollToBottom()
    }
    this.isLoading.set(false)
  }
}
