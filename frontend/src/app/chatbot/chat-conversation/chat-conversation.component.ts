/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, signal, viewChild, ElementRef, afterNextRender, inject, Injector, runInInjectionContext, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { ChatService } from '../../Services/chat.service'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
import { ChatInputBoxComponent } from '../chat-input-box/chat-input-box.component'
import { type ChatMessage, type StoredConversation } from '../chat.model'

@Component({
  standalone: true,
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.component.html',
  styleUrls: ['./chat-conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    ChatInputBoxComponent
  ]
})
export class ChatConversationComponent implements OnInit {
  private readonly chatService = inject(ChatService)
  private readonly conversationStorage = inject(ConversationStorageService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly injector = inject(Injector)
  private readonly chatWindow = viewChild<ElementRef<HTMLDivElement>>('chatWindow')

  messages = signal<ChatMessage[]>([])
  isLoading = signal(false)
  messageInput = signal('')

  private conversationId = ''

  ngOnInit () {
    this.conversationId = this.route.snapshot.params['id']
    const existing = this.conversationStorage.getById(this.conversationId)
    if (existing) {
      this.messages.set(existing.messages)
      this.scrollToBottom()
    }

    const initialMessage = this.route.snapshot.queryParams['initialMessage']
    if (initialMessage) {
      void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true })
      void this.sendMessage(initialMessage)
    }
  }

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

  private persistConversation () {
    const msgs = this.messages()
    const firstUserMsg = msgs.find(m => m.role === 'user')
    const title = firstUserMsg ? this.conversationStorage.generateTitle(firstUserMsg.content) : 'New conversation'
    const existing = this.conversationStorage.getById(this.conversationId)
    const conversation: StoredConversation = {
      id: this.conversationId,
      title: existing?.title || title,
      messages: msgs,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    this.conversationStorage.save(conversation)
  }

  async sendMessage (content: string) {
    if (!content || this.isLoading()) return

    this.messages.update(prev => [...prev, { role: 'user', content }])
    this.messageInput.set('')
    this.isLoading.set(true)
    this.scrollToBottom()

    const assistantIndex = this.messages().length
    this.messages.update(prev => [...prev, { role: 'assistant', content: '' }])

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
    this.persistConversation()
  }
}
