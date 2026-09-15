/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy, inject } from '@angular/core'
import { Router } from '@angular/router'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
import { ChatWelcomeScreenComponent } from '../chat-welcome-screen/chat-welcome-screen.component'

@Component({
  standalone: true,
  selector: 'app-chat-welcome-page',
  template: '<app-chat-welcome-screen (messageSent)="onMessageSent($event)" (conversationSelected)="onConversationSelected($event)" />',
  styles: [':host { flex: 1; display: flex; min-height: 0; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChatWelcomeScreenComponent]
})
export class ChatWelcomePageComponent {
  private readonly router = inject(Router)
  private readonly conversationStorage = inject(ConversationStorageService)

  onMessageSent (message: string) {
    const id = this.conversationStorage.generateId()
    void this.router.navigate(['/chatbot/conversation', id], { queryParams: { initialMessage: message } })
  }

  onConversationSelected (id: string) {
    void this.router.navigate(['/chatbot/conversation', id])
  }
}
