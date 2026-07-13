/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { AiWidgetComponent } from './ai-widget.component'
import { environment } from '../../environments/environment'

describe('AiWidgetComponent', () => {
  let component: AiWidgetComponent
  let fixture: ComponentFixture<AiWidgetComponent>
  let httpMock: HttpTestingController

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiWidgetComponent],
      providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    }).compileComponents()

    fixture = TestBed.createComponent(AiWidgetComponent)
    component = fixture.componentInstance
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created closed', () => {
    expect(component).toBeTruthy()
    expect(component.isOpen).toBe(false)
  })

  it('should toggle open state', () => {
    component.toggle()
    expect(component.isOpen).toBe(true)
    component.toggle()
    expect(component.isOpen).toBe(false)
  })

  it('should send a message and append the assistant reply', () => {
    component.draft = 'How much is the apple juice?'
    component.send()

    expect(component.messages).toEqual([{ role: 'user', text: 'How much is the apple juice?' }])
    expect(component.draft).toBe('')

    const req = httpMock.expectOne(`${environment.aiAssistantUrl}/chat`)
    expect(req.request.method).toBe('POST')
    req.flush({ reply: 'It is $1.99.' })

    expect(component.messages).toEqual([
      { role: 'user', text: 'How much is the apple juice?' },
      { role: 'assistant', text: 'It is $1.99.' }
    ])
    expect(component.isLoading).toBe(false)
  })

  it('should show a fallback message when the request fails', () => {
    component.draft = 'ping'
    component.send()

    const req = httpMock.expectOne(`${environment.aiAssistantUrl}/chat`)
    req.flush(null, { status: 500, statusText: 'Server Error' })

    expect(component.messages[1].text).toContain('Sorry, the assistant is unavailable right now.')
    expect(component.messages[1].text).toContain('HTTP 500')
    expect(component.isLoading).toBe(false)
  })

  it('should not send empty messages', () => {
    component.draft = '   '
    component.send()

    httpMock.expectNone(`${environment.aiAssistantUrl}/chat`)
    expect(component.messages.length).toBe(0)
  })
})
