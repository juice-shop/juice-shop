/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, signal, viewChild, viewChildren, ElementRef, afterNextRender, inject, Injector, runInInjectionContext, OnInit } from '@angular/core'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { TextFieldModule } from '@angular/cdk/text-field'
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
    FormsModule,
    MatButtonModule,
    MatIconModule,
    TextFieldModule,
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
  private readonly editTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('editTextarea')
  private readonly editButtons = viewChildren<ElementRef<HTMLButtonElement>>('editButton')

  messages = signal<ChatMessage[]>([])
  isLoading = signal(false)
  showToolCalls = signal(false)
  isToolCallsCollapsed = signal(true)
  messageInput = signal('')
  chatBotName = signal('Juicy the Smart Assistant')
  editingIndex = signal<number | null>(null)
  editDraft = signal('')

  private conversationId = ''

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
        if (config?.application?.chatBot?.name) {
          this.chatBotName.set(config.application.chatBot.name)
        }
      },
      error: (err) => { console.log(err) }
    })

    this.showToolCalls.set(this.cookieService.get('show_tool_calls') === 'true')

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

  private closeEditor () {
    this.editingIndex.set(null)
    this.editDraft.set('')
  }

  toggleToolCalls () {
    this.isToolCallsCollapsed.update(prev => !prev)
  }

  startEdit (index: number) {
    const message = this.messages()[index]
    if (this.isLoading() || message?.role !== 'user') return

    this.editingIndex.set(index)
    this.editDraft.set(message.content)
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.editTextarea()?.nativeElement.focus()
      })
    })
  }

  cancelEdit () {
    const index = this.editingIndex()
    this.closeEditor()
    if (index === null) return

    const editButtonPosition = this.messages().slice(0, index).filter(m => m.role === 'user').length
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => {
        this.editButtons()[editButtonPosition]?.nativeElement.focus()
      })
    })
  }

  onEditEnterKey (event: Event) {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault()
      void this.saveEdit()
    }
  }

  async saveEdit () {
    const index = this.editingIndex()
    const content = this.editDraft().trim()
    if (index === null || !content) return

    if (content === this.messages()[index].content) {
      this.cancelEdit()
      return
    }

    this.closeEditor()
    this.messages.update(prev => [...prev.slice(0, index), { role: 'user', content }])
    await this.streamAssistantReply()
  }

  async sendMessage (content: string) {
    if (!content || this.isLoading()) return

    this.closeEditor()
    this.messages.update(prev => [...prev, { role: 'user', content }])
    this.messageInput.set('')
    await this.streamAssistantReply()
  }

  private async streamAssistantReply () {
    this.isLoading.set(true)
    this.scrollToBottom()
    this.chatInput()?.focus()

    const assistantIndex = this.messages().length
    this.messages.update(prev => [...prev, { role: 'assistant', content: '' }])

    const apiMessages = this.messages()
      .slice(0, -1)
      .filter(m => !m.error)
      .map(m => ({ role: m.role, content: m.content }))

    const stream = this.chatService.streamMessages(apiMessages)
    for await (const chunk of stream) {
      if (chunk.error) {
        this.messages.update(prev => {
          const updated = [...prev]
          updated[assistantIndex] = {
            role: 'assistant',
            content: 'CHATBOT_ERROR_LLM_UNREACHABLE',
            error: true
          }
          return updated
        })
        this.scrollToBottom()
        break
      }
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
    this.chatInput()?.focus()
    this.persistConversation()
  }
}
