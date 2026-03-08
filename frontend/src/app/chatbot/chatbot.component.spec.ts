/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { ChatbotComponent } from './chatbot.component'
import { ChatService } from '../Services/chat.service'

describe('ChatbotComponent', () => {
  let component: ChatbotComponent
  let fixture: ComponentFixture<ChatbotComponent>
  let chatService: jasmine.SpyObj<ChatService>

  beforeEach(() => {
    chatService = jasmine.createSpyObj('ChatService', ['streamMessages'])

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ChatbotComponent
      ],
      providers: [
        { provide: ChatService, useValue: chatService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ChatbotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should show welcome screen when no messages', () => {
    expect(component.hasStarted()).toBeFalse()
    const welcomeScreen = fixture.nativeElement.querySelector('app-chat-welcome-screen')
    expect(welcomeScreen).toBeTruthy()
  })

  it('should not show chat window when no messages', () => {
    const chatWindow = fixture.nativeElement.querySelector('.chat-window')
    expect(chatWindow).toBeNull()
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

  it('should add user message and switch to chat view on send', async () => {
    async function * emptyStream () {}
    chatService.streamMessages.and.returnValue(emptyStream())

    await component.sendMessage('Hello')

    expect(component.hasStarted()).toBeTrue()
    expect(component.messages()[0].role).toBe('user')
    expect(component.messages()[0].content).toBe('Hello')
  })

  it('should add assistant message placeholder on send', async () => {
    async function * emptyStream () {}
    chatService.streamMessages.and.returnValue(emptyStream())

    await component.sendMessage('Hello')

    expect(component.messages()[1].role).toBe('assistant')
    expect(component.messages()[1].content).toBe('')
  })

  it('should clear message input after sending', async () => {
    async function * emptyStream () {}
    chatService.streamMessages.and.returnValue(emptyStream())

    component.messageInput.set('Hello')
    await component.sendMessage('Hello')

    expect(component.messageInput()).toBe('')
  })

  it('should set isLoading during stream and clear after', async () => {
    async function * emptyStream () {}
    chatService.streamMessages.and.returnValue(emptyStream())

    const promise = component.sendMessage('Hello')
    expect(component.isLoading()).toBeTrue()

    await promise
    expect(component.isLoading()).toBeFalse()
  })

  it('should accumulate streamed content in assistant message', async () => {
    async function * contentStream () {
      yield { deltaContent: 'Hello ' }
      yield { deltaContent: 'world' }
    }
    chatService.streamMessages.and.returnValue(contentStream())

    await component.sendMessage('Hi')

    expect(component.messages()[1].content).toBe('Hello world')
  })

  it('should accumulate tool calls in assistant message', async () => {
    const toolCall = { id: '1', type: 'function', function: { name: 'test', arguments: '{}' } }
    async function * toolStream () {
      yield { deltaToolCalls: [toolCall] }
    }
    chatService.streamMessages.and.returnValue(toolStream())

    await component.sendMessage('Hi')

    expect(component.messages()[1].tool_calls).toEqual([toolCall])
  })

  it('should show chat header after conversation starts', async () => {
    async function * emptyStream () {}
    chatService.streamMessages.and.returnValue(emptyStream())

    await component.sendMessage('Hello')
    fixture.detectChanges()

    const header = fixture.nativeElement.querySelector('.chat-header')
    expect(header).toBeTruthy()
  })

  it('should show chat input box in chat mode', async () => {
    async function * emptyStream () {}
    chatService.streamMessages.and.returnValue(emptyStream())

    await component.sendMessage('Hello')
    fixture.detectChanges()

    const inputBox = fixture.nativeElement.querySelector('.input-area app-chat-input-box')
    expect(inputBox).toBeTruthy()
  })
})
