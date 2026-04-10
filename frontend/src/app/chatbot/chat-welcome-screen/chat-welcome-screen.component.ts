/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, output, model, viewChild, signal, inject, OnInit } from '@angular/core'
import { DatePipe } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ChatInputBoxComponent } from '../chat-input-box/chat-input-box.component'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
import { ConfigurationService } from '../../Services/configuration.service'
import { type StoredConversation } from '../chat.model'

@Component({
  standalone: true,
  selector: 'app-chat-welcome-screen',
  templateUrl: './chat-welcome-screen.component.html',
  styleUrls: ['./chat-welcome-screen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    ChatInputBoxComponent,
    DatePipe,
    TranslateModule
  ]
})
export class ChatWelcomeScreenComponent implements OnInit {
  private readonly conversationStorage = inject(ConversationStorageService)
  private readonly translate = inject(TranslateService)
  private readonly configurationService = inject(ConfigurationService)

  message = model('')
  messageSent = output<string>()
  conversationSelected = output<string>()
  private readonly inputBox = viewChild(ChatInputBoxComponent)

  conversations = signal<StoredConversation[]>(this.conversationStorage.getAll())
  chatBotName = signal('Juicy')
  chatBotAvatar = signal('assets/public/images/JuicyBot.png')
  sampleQuestions = signal<string[]>([])

  ngOnInit () {
    this.configurationService.getApplicationConfiguration().subscribe({
      next: (config) => {
        if (config?.application?.chatBot?.name) {
          this.chatBotName.set(config.application?.chatBot.name)
        }
        if (config?.application?.chatBot?.avatar) {
          this.chatBotAvatar.set('assets/public/images/' + config.application?.chatBot?.avatar)
        }
        if (config?.application?.chatBot?.sampleQuestions) {
          this.sampleQuestions.set(config.application.chatBot.sampleQuestions)
        }
      },
      error: (err) => { console.log(err) }
    })
  }

  applyRandomSuggestion () {
    const questions = this.sampleQuestions()
    if (questions.length === 0) return

    this.translate.get(questions).subscribe(translations => {
      const allSuggestions = questions.map(q => translations[q] !== q ? translations[q] : q)

      const currentMessage = this.message()
      const availableSuggestions = allSuggestions.filter(s => s !== currentMessage)

      if (availableSuggestions.length > 0) {
        const chosen = availableSuggestions[Math.floor(Math.random() * availableSuggestions.length)]
        this.message.set(chosen)
      } else if (allSuggestions.length > 0) {
        this.message.set(allSuggestions[0])
      }
      this.inputBox()?.focus()
    })
  }

  applySuggestion (key: string) {
    this.translate.get(key).subscribe(text => {
      this.message.set(text)
      this.inputBox()?.focus()
    })
  }

  deleteConversation (event: Event, id: string) {
    event.stopPropagation()
    this.conversationStorage.delete(id)
    this.conversations.set(this.conversationStorage.getAll())
  }

  deleteAllConversations () {
    this.conversationStorage.deleteAll()
    this.conversations.set([])
  }
}
