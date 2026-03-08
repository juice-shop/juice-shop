/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { ChatWelcomeScreenComponent } from './chat-welcome-screen.component'

describe('ChatWelcomeScreenComponent', () => {
  let component: ChatWelcomeScreenComponent
  let fixture: ComponentFixture<ChatWelcomeScreenComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ChatWelcomeScreenComponent
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
    expect(title.textContent).toContain('JuiceShop Assistant')
  })

  it('should render the welcome subtitle', () => {
    const subtitle = fixture.nativeElement.querySelector('.welcome-subtitle')
    expect(subtitle.textContent).toContain('Delivering juice one token at a time')
  })

  it('should render the JuicyBot avatar', () => {
    const avatar = fixture.nativeElement.querySelector('.welcome-avatar')
    expect(avatar).toBeTruthy()
    expect(avatar.getAttribute('alt')).toBe('JuicyBot')
  })

  it('should render suggestion chips', () => {
    const chips = fixture.nativeElement.querySelectorAll('.suggestion-chip')
    expect(chips.length).toBe(2)
  })

  it('should set message when suggestion is clicked', () => {
    component.applySuggestion('Test suggestion')
    expect(component.message()).toBe('Test suggestion')
  })

  it('should render the input box sub-component', () => {
    const inputBox = fixture.nativeElement.querySelector('app-chat-input-box')
    expect(inputBox).toBeTruthy()
  })

  it('should emit messageSent when input box emits', () => {
    spyOn(component.messageSent, 'emit')
    component.messageSent.emit('Hello')
    expect(component.messageSent.emit).toHaveBeenCalledWith('Hello')
  })
})
