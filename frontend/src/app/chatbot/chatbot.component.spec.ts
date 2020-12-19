/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { ChatbotService } from '../Services/chatbot.service'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button'

import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { ChatbotComponent } from './chatbot.component'
import { of, throwError } from 'rxjs'

import { HttpClientTestingModule } from '@angular/common/http/testing'
import { EventEmitter } from '@angular/core'

enum MessageSources {
    user = 'user',
    bot = 'bot'
}

describe('ComplaintComponent', () => {
  let component: ChatbotComponent
  let fixture: ComponentFixture<ChatbotComponent>
  let chatbotService: any
  let translateService

  beforeEach(async(() => {

    chatbotService = jasmine.createSpyObj('ChatbotService', ['getChatbotStatus', 'getResponse'])
    chatbotService.getChatbotStatus.and.returnValue(of({
      status: true,
      body: 'hello there'
    }))
    chatbotService.getResponse.and.returnValue(of({
      action: 'response',
      body: 'hello there'
    }))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      declarations: [ ChatbotComponent ],
      providers: [
        { provide: ChatbotService, useValue: chatbotService },
        { provide: TranslateService, useValue: translateService }
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatbotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initially have 1 message intially', () => {
    expect(component.messages.length).toEqual(1)
    expect(component.messages[0]).toEqual({
      author: MessageSources.bot,
      body: 'hello there'
    })
  })

  it('should record and display user messages', () => {
    component.messageControl.setValue('Message')
    component.sendMessage()
    expect(component.messages[1]).toEqual({
      author: MessageSources.user,
      body: 'Message'
    })
  })

  it('Responds to user messages', () => {
    component.messageControl.setValue('Message')
    component.sendMessage()
    expect(component.messages.length).toEqual(3)
    expect(component.messages[2]).toEqual({
      author: MessageSources.bot,
      body: 'hello there'
    })
  })
})
