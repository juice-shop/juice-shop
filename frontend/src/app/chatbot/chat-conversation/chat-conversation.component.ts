/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, signal, viewChild, ElementRef, afterNextRender, inject, Injector, runInInjectionContext, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule } from '@ngx-translate/core'
import { ChatService } from '../../Services/chat.service'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
import { ConfigurationService } from '../../Services/configuration.service'
import { CookieService } from 'ngy-cookie'
import { UserService } from '../../Services/user.service'
import { LoginGuard } from '../../app.guard'
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
    ChatInputBoxComponent,
    TranslateModule,
    RouterLink
  ]
})
export class ChatConversationComponent implements OnInit {
  private readonly chatService = inject(ChatService)
  private readonly conversationStorage = inject(ConversationStorageService)
  private readonly configurationService = inject(ConfigurationService)
  private readonly cookieService = inject(CookieService)
  private readonly userService = inject(UserService)
  private readonly loginGuard = inject(LoginGuard)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly injector = inject(Injector)
  private readonly chatWindow = viewChild<ElementRef<HTMLDivElement>>('chatWindow')
  private readonly chatInput = viewChild(ChatInputBoxComponent)

  messages = signal<ChatMessage[]>([])
  isLoading = signal(false)
  showToolCalls = signal(false)
  messageInput = signal('')
  chatBotName = signal('Juicy')
  chatBotAvatar = signal('assets/public/images/JuicyBot.png')

  private conversationId = ''

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
        if (config?.application?.chatBot?.name) {
          this.chatBotName.set(config.application.chatBot.name)
        }
        if (config?.application?.chatBot?.avatar) {
          this.chatBotAvatar.set('assets/public/images/' + config.application.chatBot.avatar)
        }
      },
      error: (err) => { console.error('Config load failed', err) }
    })

    // Enable tool calls view for debugging/transparency
    this.showToolCalls.set(true)

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
    if (msgs.length === 0) return

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

    // Update UI with user message
    this.messages.update(prev => [...prev, { role: 'user', content }])
    this.messageInput.set('')
    this.isLoading.set(true)
    this.scrollToBottom()
    this.chatInput()?.focus()

    // Placeholder for bot response
    const assistantIndex = this.messages().length
    this.messages.update(prev => [...prev, { role: 'assistant', content: '' }])

    const apiMessages = this.messages()
      .slice(0, -1)
      .filter(m => !m.error)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const stream = this.chatService.streamMessages(apiMessages)
      for await (const chunk of stream) {
        if (chunk.error) {
          this.handleStreamError(assistantIndex)
          break
        }

        this.updateMessageStream(assistantIndex, chunk)
        this.scrollToBottom()
      }
    } catch (err) {
      console.error('Chat stream error:', err)
      this.handleStreamError(assistantIndex)
    } finally {
      this.isLoading.set(false)
      this.chatInput()?.focus()
      this.persistConversation()
    }
  }

  private updateMessageStream (index: number, chunk: any) {
    this.messages.update(prev => {
      const updated = [...prev]
      const msg = { ...updated[index] }
      
      if (chunk.deltaContent) {
        msg.content += chunk.deltaContent
      }
      
      if (chunk.deltaToolCalls) {
        msg.tool_calls = [...(msg.tool_calls || []), ...chunk.deltaToolCalls]
      }
      
      updated[index] = msg
      return updated
    })
  }

  private handleStreamError (index: number) {
    this.messages.update(prev => {
      const updated = [...prev]
      updated[index] = {
        role: 'assistant',
        content: 'CHATBOT_ERROR_LLM_UNREACHABLE',
        error: true
      }
      return updated
    })
  }
}