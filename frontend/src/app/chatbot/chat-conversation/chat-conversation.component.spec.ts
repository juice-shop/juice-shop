/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { ActivatedRoute } from '@angular/router'
import { ChatConversationComponent } from './chat-conversation.component'
import { ChatService } from '../../Services/chat.service'
import { ConversationStorageService } from '../../Services/conversation-storage.service'
import { ConfigurationService } from '../../Services/configuration.service'
import { UserService } from '../../Services/user.service'
import { LoginGuard } from '../../app.guard'
import { CookieService } from 'ngy-cookie'
import { of } from 'rxjs'
import { ChatInputBoxComponent } from '../chat-input-box/chat-input-box.component'

describe('ChatConversationComponent', () => {
    let component: ChatConversationComponent
    let fixture: ComponentFixture<ChatConversationComponent>
    let chatService: any
    let conversationStorage: any
    let configurationService: any
    let userService: any
    let loginGuard: any
    let cookieService: any

    beforeEach(() => {
        chatService = {
            streamMessages: vi.fn().mockName("ChatService.streamMessages")
        }
        conversationStorage = {
            getById: vi.fn().mockName("ConversationStorageService.getById"),
            save: vi.fn().mockName("ConversationStorageService.save"),
            generateTitle: vi.fn().mockName("ConversationStorageService.generateTitle")
        }
        conversationStorage.getById.mockReturnValue(undefined)
        conversationStorage.generateTitle.mockImplementation((msg: string) => msg.substring(0, 50))
        configurationService = {
            getApplicationConfiguration: vi.fn().mockName("ConfigurationService.getApplicationConfiguration")
        }
        configurationService.getApplicationConfiguration.mockReturnValue(of({ application: { chatBot: { name: 'Juicy', avatar: 'JuicyBot.png' } } } as any))
        userService = {
            whoAmI: vi.fn().mockName("UserService.whoAmI")
        }
        loginGuard = {
            tokenDecode: vi.fn().mockName("LoginGuard.tokenDecode")
        }
        cookieService = {
            get: vi.fn().mockName("CookieService.get"),
            put: vi.fn().mockName("CookieService.put")
        }

        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                ChatConversationComponent
            ],
            providers: [
                { provide: ChatService, useValue: chatService },
                { provide: ConversationStorageService, useValue: conversationStorage },
                { provide: ConfigurationService, useValue: configurationService },
                { provide: UserService, useValue: userService },
                { provide: LoginGuard, useValue: loginGuard },
                { provide: CookieService, useValue: cookieService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: { id: '1234567890_abcdefgh' },
                            queryParams: {}
                        }
                    }
                }
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(ChatConversationComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should show chat header', () => {
        const header = fixture.nativeElement.querySelector('.chat-header')
        expect(header).toBeTruthy()
    })

    it('should not send when content is empty', async () => {
        await component.sendMessage('')
        expect(component.messages().length).toBe(0)
    })

    it('should not send when already loading', async () => {
        component.isLoading.set(true)
        await component.sendMessage('Hello')
        expect(component.messages().length).toBe(0)
    })

    it('should add user message on send', async () => {
        async function* emptyStream() { }
        chatService.streamMessages.mockReturnValue(emptyStream())

        await component.sendMessage('Hello')

        expect(component.messages()[0].role).toBe('user')
        expect(component.messages()[0].content).toBe('Hello')
    })

    it('should add assistant message placeholder on send', async () => {
        async function* emptyStream() { }
        chatService.streamMessages.mockReturnValue(emptyStream())

        await component.sendMessage('Hello')

        expect(component.messages()[1].role).toBe('assistant')
    })

    it('should clear message input after sending', async () => {
        async function* emptyStream() { }
        chatService.streamMessages.mockReturnValue(emptyStream())

        component.messageInput.set('Hello')
        await component.sendMessage('Hello')

        expect(component.messageInput()).toBe('')
    })

    it('should set isLoading during stream and clear after', async () => {
        async function* emptyStream() { }
        chatService.streamMessages.mockReturnValue(emptyStream())

        const promise = component.sendMessage('Hello')
        expect(component.isLoading()).toBe(true)

        await promise
        expect(component.isLoading()).toBe(false)
    })

    it('should accumulate streamed content in assistant message', async () => {
        async function* contentStream() {
            yield { deltaContent: 'Hello ' }
            yield { deltaContent: 'world' }
        }
        chatService.streamMessages.mockReturnValue(contentStream())

        await component.sendMessage('Hi')

        expect(component.messages()[1].content).toBe('Hello world')
    })

    it('should accumulate tool calls in assistant message', async () => {
        const toolCall = { id: '1', type: 'function', function: { name: 'test', arguments: '{}' } }
        async function* toolStream() {
            yield { deltaToolCalls: [toolCall] }
        }
        chatService.streamMessages.mockReturnValue(toolStream())

        await component.sendMessage('Hi')

        expect(component.messages()[1].tool_calls).toEqual([toolCall])
    })

    it('should persist conversation after stream completes', async () => {
        async function* emptyStream() { }
        chatService.streamMessages.mockReturnValue(emptyStream())

        await component.sendMessage('Hello')

        expect(conversationStorage.save).toHaveBeenCalled()
    })

    it('should load existing conversation on init', () => {
        conversationStorage.getById.mockReturnValue({
            id: '1234567890_abcdefgh',
            title: 'Test',
            messages: [{ role: 'user', content: 'Hi' }, { role: 'assistant', content: 'Hello!' }],
            createdAt: 1000,
            updatedAt: 2000
        })

        component.ngOnInit()

        expect(component.messages().length).toBe(2)
        expect(component.messages()[0].content).toBe('Hi')
    })

    it('should focus chat input after sending a message', async () => {
        async function* emptyStream() { }
        chatService.streamMessages.mockReturnValue(emptyStream())

        const chatInputDebug = fixture.debugElement.query((de) => de.componentInstance instanceof ChatInputBoxComponent)
        const chatInputComponent = chatInputDebug.componentInstance as ChatInputBoxComponent
        vi.spyOn(chatInputComponent, 'focus')

        await component.sendMessage('Hello')

        expect(chatInputComponent.focus).toHaveBeenCalled()
    })

    it('should refocus chat input after stream completes', async () => {
        async function* contentStream() {
            yield { deltaContent: 'Hi there' }
        }
        chatService.streamMessages.mockReturnValue(contentStream())

        const chatInputDebug = fixture.debugElement.query((de) => de.componentInstance instanceof ChatInputBoxComponent)
        const chatInputComponent = chatInputDebug.componentInstance as ChatInputBoxComponent
        vi.spyOn(chatInputComponent, 'focus')

        await component.sendMessage('Hello')

        expect(chatInputComponent.focus).toHaveBeenCalledTimes(2)
    })
    it('should initialize showToolCalls based on cookie only', () => {
        cookieService.get.mockReturnValue('true')
        component.ngOnInit()
        expect(component.showToolCalls()).toBe(true)

        cookieService.get.mockReturnValue('false')
        component.ngOnInit()
        expect(component.showToolCalls()).toBe(false)
    })

    describe('template rendering', () => {
        it('should render the chat header with back link, avatar and bot title', () => {
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.chat-header')).toBeTruthy()
            const back = compiled.querySelector('a.back-link') as HTMLAnchorElement
            expect(back).toBeTruthy()
            expect(back.getAttribute('aria-label')).toBe('Back to chatbot')
            expect(compiled.querySelector('img.header-avatar')).toBeTruthy()
            expect(compiled.querySelector('.header-title')?.textContent).toContain('Juicy')
        })

        it('should render an empty chat window and the input area when there are no messages', () => {
            const compiled: HTMLElement = fixture.nativeElement
            const chatWindow = compiled.querySelector('.chat-window') as HTMLElement
            expect(chatWindow).toBeTruthy()
            expect(chatWindow.querySelectorAll('.chat-bubble').length).toBe(0)
            expect(compiled.querySelector('.input-area app-chat-input-box')).toBeTruthy()
        })

        it('should render a user bubble and an assistant bubble with their respective classes and content', () => {
            component.messages.set([
                { role: 'user', content: 'Hello bot' },
                { role: 'assistant', content: 'Hi user' }
            ] as any)
            fixture.detectChanges()

            const bubbles = fixture.nativeElement.querySelectorAll('.chat-bubble') as NodeListOf<HTMLElement>
            expect(bubbles.length).toBe(2)
            expect(bubbles[0].classList.contains('user')).toBe(true)
            expect(bubbles[1].classList.contains('assistant')).toBe(true)
            expect(bubbles[0].textContent).toContain('Hello bot')
            expect(bubbles[1].textContent).toContain('Hi user')
        })

        it('should mark an error message with the error class', () => {
            component.messages.set([
                { role: 'assistant', content: 'ERROR_KEY', error: true }
            ] as any)
            fixture.detectChanges()

            const bubble = fixture.nativeElement.querySelector('.chat-bubble') as HTMLElement
            expect(bubble.classList.contains('error')).toBe(true)
        })

        it('should render a typing indicator on the last assistant message while loading', () => {
            component.isLoading.set(true)
            component.messages.set([
                { role: 'user', content: 'Hi' },
                { role: 'assistant', content: '' }
            ] as any)
            fixture.detectChanges()

            const indicator = fixture.nativeElement.querySelector('.typing-indicator')
            expect(indicator).toBeTruthy()
            expect(indicator.querySelectorAll('.dot').length).toBe(3)
        })

        it('should not render any tool-calls container when showToolCalls is false', () => {
            component.showToolCalls.set(false)
            component.messages.set([
                { role: 'assistant', content: 'with tools', tool_calls: [{ id: 't1', type: 'function', function: { name: 'doIt', arguments: '{}' } }] }
            ] as any)
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('.tool-calls-container')).toBeNull()
        })

        it('should render a single tool-call card without the previous-tool-calls header when only one tool call is present', () => {
            component.showToolCalls.set(true)
            component.messages.set([
                { role: 'assistant', content: 'x', tool_calls: [{ id: 't1', type: 'function', function: { name: 'doIt', arguments: '{"a":1}' } }] }
            ] as any)
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.tool-calls-container')).toBeTruthy()
            expect(compiled.querySelector('.tool-calls-header')).toBeNull()
            const cards = compiled.querySelectorAll('.tool-call-card')
            expect(cards.length).toBe(1)
            expect(cards[0].textContent).toContain('doIt')
            expect(cards[0].textContent).toContain('{"a":1}')
        })

        it('should toggle previous tool calls visibility when the header is clicked', () => {
            component.showToolCalls.set(true)
            component.messages.set([
                {
                    role: 'assistant',
                    content: 'x',
                    tool_calls: [
                        { id: 't1', type: 'function', function: { name: 'first', arguments: '{}' } },
                        { id: 't2', type: 'function', function: { name: 'second', arguments: '{}' } }
                    ]
                }
            ] as any)
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.tool-calls-header')).toBeTruthy()
            expect(compiled.querySelector('.previous-tool-calls')).toBeNull()

            ;(compiled.querySelector('.tool-calls-header') as HTMLElement).click()
            fixture.detectChanges()
            expect(compiled.querySelector('.previous-tool-calls')).toBeTruthy()
            expect(compiled.querySelectorAll('.tool-call-card.mini').length).toBe(1)
        })
    })

    describe('init configuration handling', () => {
        it('should log when configuration loading fails', () => {
            const err = new Error('boom')
            configurationService.getApplicationConfiguration.mockReturnValue({
                subscribe: ({ error }: any) => { error(err) }
            } as any)
            console.log = vi.fn()
            component.ngOnInit()
            expect(console.log).toHaveBeenCalledWith(err)
        })

        it('should keep default bot name and avatar when config has no chatBot section', () => {
            configurationService.getApplicationConfiguration.mockReturnValue(of({ application: {} } as any))
            component.chatBotName.set('Juicy')
            component.chatBotAvatar.set('assets/public/images/JuicyBot.png')
            component.ngOnInit()
            expect(component.chatBotName()).toBe('Juicy')
            expect(component.chatBotAvatar()).toBe('assets/public/images/JuicyBot.png')
        })

        it('should mark an assistant error message via the stream and break out of the loop', async () => {
            async function* errStream() {
                yield { error: true }
                yield { deltaContent: 'should not be appended' }
            }
            chatService.streamMessages.mockReturnValue(errStream())
            await component.sendMessage('Hi')
            const assistant = component.messages()[1] as any
            expect(assistant.error).toBe(true)
            expect(assistant.content).toBe('CHATBOT_ERROR_LLM_UNREACHABLE')
        })
    })
})
