/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { RouterModule } from '@angular/router'
import { ChatbotComponent } from './chatbot.component'

describe('ChatbotComponent', () => {
    let component: ChatbotComponent
    let fixture: ComponentFixture<ChatbotComponent>

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                RouterModule.forRoot([], { useHash: true }),
                ChatbotComponent
            ]
        }).compileComponents()

        fixture = TestBed.createComponent(ChatbotComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should render the chatbot container', () => {
        const container = fixture.nativeElement.querySelector('.chatbot-container')
        expect(container).toBeTruthy()
    })

    it('should contain a router-outlet', () => {
        const outlet = fixture.nativeElement.querySelector('router-outlet')
        expect(outlet).toBeTruthy()
    })
})
