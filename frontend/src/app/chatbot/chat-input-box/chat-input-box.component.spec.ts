/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { ChatInputBoxComponent } from './chat-input-box.component'

describe('ChatInputBoxComponent', () => {
    let component: ChatInputBoxComponent
    let fixture: ComponentFixture<ChatInputBoxComponent>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                ChatInputBoxComponent
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(ChatInputBoxComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should not emit messageSent when message is empty', () => {
        vi.spyOn(component.messageSent, 'emit')
        component.message.set('')
        component.send()
        expect(component.messageSent.emit).not.toHaveBeenCalled()
    })

    it('should not emit messageSent when message is whitespace only', () => {
        vi.spyOn(component.messageSent, 'emit')
        component.message.set('   ')
        component.send()
        expect(component.messageSent.emit).not.toHaveBeenCalled()
    })

    it('should emit messageSent with trimmed content on send', () => {
        vi.spyOn(component.messageSent, 'emit')
        component.message.set('  Hello world  ')
        component.send()
        expect(component.messageSent.emit).toHaveBeenCalledWith('Hello world')
    })

    it('should not emit messageSent when disabled', () => {
        vi.spyOn(component.messageSent, 'emit')
        fixture.componentRef.setInput('disabled', true)
        component.message.set('Hello')
        component.send()
        expect(component.messageSent.emit).not.toHaveBeenCalled()
    })

    it('should send on Enter without Shift', () => {
        vi.spyOn(component, 'send')
        const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false })
        vi.spyOn(event, 'preventDefault')
        component.message.set('Hello')
        component.onEnterKey(event)
        expect(event.preventDefault).toHaveBeenCalled()
        expect(component.send).toHaveBeenCalled()
    })

    it('should not send on Shift+Enter', () => {
        vi.spyOn(component, 'send')
        const event = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true })
        component.onEnterKey(event)
        expect(component.send).not.toHaveBeenCalled()
    })

    it('should render a textarea element', () => {
        const textarea = fixture.nativeElement.querySelector('textarea')
        expect(textarea).toBeTruthy()
    })

    it('should render a send button', () => {
        const button = fixture.nativeElement.querySelector('.send-button')
        expect(button).toBeTruthy()
    })

    it('should disable send button when message is empty', () => {
        component.message.set('')
        fixture.detectChanges()
        const button = fixture.nativeElement.querySelector('.send-button')
        expect(button.disabled).toBe(true)
    })
})
