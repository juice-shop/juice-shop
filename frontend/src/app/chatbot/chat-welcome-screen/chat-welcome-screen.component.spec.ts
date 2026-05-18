/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { ChatWelcomeScreenComponent } from './chat-welcome-screen.component'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
import { ConfigurationService } from '../../Services/configuration.service'
import { of } from 'rxjs'

describe('ChatWelcomeScreenComponent', () => {
    let component: ChatWelcomeScreenComponent
    let fixture: ComponentFixture<ChatWelcomeScreenComponent>
    let conversationStorage: any
    let configurationService: any

    beforeEach(() => {
        conversationStorage = {
            getAll: vi.fn().mockName("ConversationStorageService.getAll"),
            delete: vi.fn().mockName("ConversationStorageService.delete"),
            deleteAll: vi.fn().mockName("ConversationStorageService.deleteAll")
        }
        conversationStorage.getAll.mockReturnValue([])
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({
            application: {
                chatBot: {
                    sampleQuestions: ['CHATBOT_PROMPT_RECOMMENDATION_SUMMER_PARTY']
                }
            }
        }))

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                ChatWelcomeScreenComponent
            ],
            providers: [
                { provide: ConversationStorageService, useValue: conversationStorage },
                { provide: ConfigurationService, useValue: configurationService }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(ChatWelcomeScreenComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should render the welcome title', () => {
        const title = fixture.nativeElement.querySelector('.welcome-title')
        expect(title.textContent).toContain('Juicy')
    })

    it('should render the welcome subtitle', () => {
        const subtitle = fixture.nativeElement.querySelector('.welcome-subtitle')
        expect(subtitle.textContent).toContain('CHATBOT_SUBTITLE')
    })

    it('should render the JuicyBot avatar', () => {
        const avatar = fixture.nativeElement.querySelector('.welcome-avatar')
        expect(avatar).toBeTruthy()
        expect(avatar.getAttribute('alt')).toBe('CHATBOT_AVATAR_ALT')
    })

    it('should render suggestion chips', () => {
        const chips = fixture.nativeElement.querySelectorAll('.suggestion-chip')
        expect(chips.length).toBe(2)
    })

    it('should set message when suggestion is clicked', () => {
        component.applySuggestion('Test suggestion')
        expect(component.message()).toBe('Test suggestion')
    })

    it('should set a different message when random suggestion is clicked multiple times', () => {
        const questions = ['Query1', 'Query2']
        component.sampleQuestions.set(questions)

        // 1st click
        component.applyRandomSuggestion()
        const firstMessage = component.message()
        expect(questions).toContain(firstMessage)

        // 2nd click
        component.applyRandomSuggestion()
        const secondMessage = component.message()
        expect(questions).toContain(secondMessage)
        expect(secondMessage).not.toBe(firstMessage)
    })

    it('should render the input box sub-component', () => {
        const inputBox = fixture.nativeElement.querySelector('app-chat-input-box')
        expect(inputBox).toBeTruthy()
    })

    it('should emit messageSent when input box emits', () => {
        vi.spyOn(component.messageSent, 'emit')
        component.messageSent.emit('Hello')
        expect(component.messageSent.emit).toHaveBeenCalledWith('Hello')
    })

    it('should not show history section when no conversations', () => {
        const section = fixture.nativeElement.querySelector('.history-section')
        expect(section).toBeNull()
    })

    it('should show history section when conversations exist', () => {
        component.conversations.set([
            { id: 'conv_1', title: 'Test', messages: [], createdAt: 1000, updatedAt: 2000 }
        ])
        fixture.detectChanges()

        const section = fixture.nativeElement.querySelector('.history-section')
        expect(section).toBeTruthy()
    })

    it('should render history items', () => {
        component.conversations.set([
            { id: 'conv_1', title: 'First conv', messages: [], createdAt: 1000, updatedAt: 2000 },
            { id: 'conv_2', title: 'Second conv', messages: [], createdAt: 1000, updatedAt: 3000 }
        ])
        fixture.detectChanges()

        const items = fixture.nativeElement.querySelectorAll('.history-item')
        expect(items.length).toBe(2)
    })

    it('should emit conversationSelected when history item is clicked', () => {
        vi.spyOn(component.conversationSelected, 'emit')
        component.conversations.set([
            { id: 'conv_1', title: 'Test', messages: [], createdAt: 1000, updatedAt: 2000 }
        ])
        fixture.detectChanges()

        const item = fixture.nativeElement.querySelector('.history-item')
        item.click()
        expect(component.conversationSelected.emit).toHaveBeenCalledWith('conv_1')
    })

    it('should delete conversation and refresh list', () => {
        conversationStorage.getAll.mockReturnValue([])
        component.conversations.set([
            { id: 'conv_1', title: 'Test', messages: [], createdAt: 1000, updatedAt: 2000 }
        ])
        fixture.detectChanges()

        const event = new Event('click')
        component.deleteConversation(event, 'conv_1')

        expect(conversationStorage.delete).toHaveBeenCalledWith('conv_1')
        expect(component.conversations().length).toBe(0)
    })

    it('should delete all conversations and clear list', () => {
        component.conversations.set([
            { id: 'conv_1', title: 'Test 1', messages: [], createdAt: 1000, updatedAt: 2000 },
            { id: 'conv_2', title: 'Test 2', messages: [], createdAt: 1000, updatedAt: 3000 }
        ])
        fixture.detectChanges()

        component.deleteAllConversations()

        expect(conversationStorage.deleteAll).toHaveBeenCalled()
        expect(component.conversations().length).toBe(0)
    })
})
