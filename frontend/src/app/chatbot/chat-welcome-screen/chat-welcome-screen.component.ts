/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, output, model, viewChild, signal, inject } from '@angular/core'
import { DatePipe } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { ChatInputBoxComponent } from '../chat-input-box/chat-input-box.component'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
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
export class ChatWelcomeScreenComponent {
  private readonly conversationStorage = inject(ConversationStorageService)
  private readonly translate = inject(TranslateService)

  message = model('')
  messageSent = output<string>()
  conversationSelected = output<string>()
  private readonly inputBox = viewChild(ChatInputBoxComponent)

  conversations = signal<StoredConversation[]>(this.conversationStorage.getAll())

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
}
