/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ConversationStorageService } from './conversation-storage.service'
import { type StoredConversation } from '../chatbot/chat.model'

const STORAGE_KEY = 'juiceshop_chat_conversations'

describe('ConversationStorageService', () => {
    let service: ConversationStorageService

    beforeEach(() => {
        service = new ConversationStorageService()
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe('generateId', () => {
        it('should return a string in the format timestamp_random8chars', () => {
            const id = service.generateId()
            expect(id).toMatch(/^\d+_[a-z0-9]{8}$/)
        })

        it('should generate unique IDs on successive calls', () => {
            const ids = new Set(Array.from({ length: 20 }, () => service.generateId()))
            expect(ids.size).toBe(20)
        })

        it('should include a numeric timestamp prefix', () => {
            const before = Date.now()
            const id = service.generateId()
            const after = Date.now()
            const timestamp = parseInt(id.split('_')[0], 10)
            expect(timestamp).toBeGreaterThanOrEqual(before)
            expect(timestamp).toBeLessThanOrEqual(after)
        })
    })

    describe('generateTitle', () => {
        it('should return the full message when it is 50 characters or fewer', () => {
            const message = 'Short message'
            expect(service.generateTitle(message)).toBe('Short message')
        })

        it('should return exactly the message when it is exactly 50 characters', () => {
            const message = 'A'.repeat(50)
            expect(service.generateTitle(message)).toBe(message)
        })

        it('should truncate a message longer than 50 characters and append an ellipsis', () => {
            const message = 'A'.repeat(51)
            const title = service.generateTitle(message)
            expect(title).toBe('A'.repeat(50) + '…')
        })

        it('should truncate at 50 characters regardless of message length', () => {
            const message = 'Hello there, this is a very long message that should definitely be truncated by the service'
            const title = service.generateTitle(message)
            expect(title.length).toBe(51) // 50 chars + 1 ellipsis char
            expect(title.endsWith('…')).toBe(true)
            expect(title.startsWith('Hello there')).toBe(true)
        })
    })

    describe('getAll', () => {
        it('should return an empty array when localStorage has no data', () => {
            expect(service.getAll()).toEqual([])
        })

        it('should return an empty array when localStorage key is missing', () => {
            localStorage.removeItem(STORAGE_KEY)
            expect(service.getAll()).toEqual([])
        })

        it('should return all stored conversations', () => {
            const conversations: StoredConversation[] = [
                { id: 'conv_1', title: 'First', messages: [], createdAt: 1000, updatedAt: 2000 },
                { id: 'conv_2', title: 'Second', messages: [], createdAt: 2000, updatedAt: 3000 }
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))

            const result = service.getAll()
            expect(result.length).toBe(2)
        })

        it('should sort conversations by updatedAt in descending order (newest first)', () => {
            const conversations: StoredConversation[] = [
                { id: 'conv_old', title: 'Old', messages: [], createdAt: 1000, updatedAt: 1000 },
                { id: 'conv_new', title: 'New', messages: [], createdAt: 1000, updatedAt: 9000 },
                { id: 'conv_mid', title: 'Mid', messages: [], createdAt: 1000, updatedAt: 5000 }
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))

            const result = service.getAll()
            expect(result[0].id).toBe('conv_new')
            expect(result[1].id).toBe('conv_mid')
            expect(result[2].id).toBe('conv_old')
        })
    })

    describe('getById', () => {
        it('should return the correct conversation by id', () => {
            const conversations: StoredConversation[] = [
                { id: 'conv_1', title: 'First', messages: [], createdAt: 1000, updatedAt: 1000 },
                { id: 'conv_2', title: 'Second', messages: [], createdAt: 2000, updatedAt: 2000 }
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))

            const result = service.getById('conv_2')
            expect(result).toBeDefined()
            expect(result?.title).toBe('Second')
        })

        it('should return undefined when the id does not exist', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([
                { id: 'conv_1', title: 'First', messages: [], createdAt: 1000, updatedAt: 1000 }
            ]))
            expect(service.getById('nonexistent_id')).toBeUndefined()
        })

        it('should return undefined when storage is empty', () => {
            expect(service.getById('any_id')).toBeUndefined()
        })
    })

    describe('save', () => {
        it('should add a new conversation to empty storage', () => {
            const conversation: StoredConversation = {
                id: 'conv_1', title: 'Hello', messages: [], createdAt: 1000, updatedAt: 2000
            }
            service.save(conversation)

            const stored = service.getAll()
            expect(stored.length).toBe(1)
            expect(stored[0].id).toBe('conv_1')
        })

        it('should add a new conversation without affecting existing ones', () => {
            const first: StoredConversation = { id: 'conv_1', title: 'First', messages: [], createdAt: 1000, updatedAt: 1000 }
            const second: StoredConversation = { id: 'conv_2', title: 'Second', messages: [], createdAt: 2000, updatedAt: 2000 }
            service.save(first)
            service.save(second)

            expect(service.getAll().length).toBe(2)
        })

        it('should update an existing conversation when the id already exists', () => {
            const original: StoredConversation = { id: 'conv_1', title: 'Original', messages: [], createdAt: 1000, updatedAt: 1000 }
            service.save(original)

            const updated: StoredConversation = { id: 'conv_1', title: 'Updated', messages: [{ role: 'user', content: 'Hi' }], createdAt: 1000, updatedAt: 5000 }
            service.save(updated)

            const all = service.getAll()
            expect(all.length).toBe(1)
            expect(all[0].title).toBe('Updated')
            expect(all[0].messages.length).toBe(1)
        })

        it('should persist data to localStorage', () => {
            const conversation: StoredConversation = { id: 'conv_1', title: 'Test', messages: [], createdAt: 1000, updatedAt: 1000 }
            service.save(conversation)

            const raw = localStorage.getItem(STORAGE_KEY)
            expect(raw).not.toBeNull()
            const parsed = JSON.parse(raw!)
            expect(parsed.length).toBe(1)
            expect(parsed[0].id).toBe('conv_1')
        })
    })

    describe('delete', () => {
        it('should remove the conversation with the given id', () => {
            const conversations: StoredConversation[] = [
                { id: 'conv_1', title: 'Keep', messages: [], createdAt: 1000, updatedAt: 1000 },
                { id: 'conv_2', title: 'Delete me', messages: [], createdAt: 2000, updatedAt: 2000 }
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))

            service.delete('conv_2')

            const remaining = service.getAll()
            expect(remaining.length).toBe(1)
            expect(remaining[0].id).toBe('conv_1')
        })

        it('should not affect other conversations when deleting one', () => {
            const conversations: StoredConversation[] = [
                { id: 'conv_1', title: 'A', messages: [], createdAt: 1000, updatedAt: 1000 },
                { id: 'conv_2', title: 'B', messages: [], createdAt: 2000, updatedAt: 2000 },
                { id: 'conv_3', title: 'C', messages: [], createdAt: 3000, updatedAt: 3000 }
            ]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))

            service.delete('conv_2')

            const remaining = service.getAll()
            expect(remaining.length).toBe(2)
            expect(remaining.find(c => c.id === 'conv_1')).toBeDefined()
            expect(remaining.find(c => c.id === 'conv_3')).toBeDefined()
        })

        it('should result in empty storage when the only conversation is deleted', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([
                { id: 'conv_1', title: 'Only one', messages: [], createdAt: 1000, updatedAt: 1000 }
            ]))

            service.delete('conv_1')

            expect(service.getAll().length).toBe(0)
        })

        it('should not throw when deleting a non-existent id', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([
                { id: 'conv_1', title: 'Exists', messages: [], createdAt: 1000, updatedAt: 1000 }
            ]))

            expect(() => service.delete('nonexistent_id')).not.toThrow()
            expect(service.getAll().length).toBe(1)
        })
    })
})
