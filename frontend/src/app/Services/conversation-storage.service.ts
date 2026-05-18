/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core'
import { type StoredConversation } from '../chatbot/chat.model'

const STORAGE_KEY = 'juiceshop_chat_conversations'

@Injectable({
  providedIn: 'root'
})
export class ConversationStorageService {
  generateId (): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    const random8 = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `${Date.now()}_${random8}`
  }

  generateTitle (firstMessage: string): string {
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '…' : firstMessage
  }

  getAll (): StoredConversation[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const conversations: StoredConversation[] = JSON.parse(raw)
    return conversations.sort((a, b) => b.updatedAt - a.updatedAt)
  }

  getById (id: string): StoredConversation | undefined {
    return this.getAll().find(c => c.id === id)
  }

  save (conversation: StoredConversation): void {
    const all = this.getAll()
    const index = all.findIndex(c => c.id === conversation.id)
    if (index >= 0) {
      all[index] = conversation
    } else {
      all.push(conversation)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }

  delete (id: string): void {
    const all = this.getAll().filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  }

  deleteAll (): void {
    localStorage.removeItem(STORAGE_KEY)
  }
}
