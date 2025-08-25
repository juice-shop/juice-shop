/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { ChallengeService } from '../Services/challenge.service'
import { type ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing'

import { ChallengeStatusBadgeComponent } from './challenge-status-badge.component'
import { of, throwError } from 'rxjs'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { WindowRefService } from '../Services/window-ref.service'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatIconModule } from '@angular/material/icon'
import { EventEmitter } from '@angular/core'
import { type Challenge } from '../Models/challenge.model'
import { MatButtonModule } from '@angular/material/button'
import { MatTooltipModule } from '@angular/material/tooltip'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('ChallengeStatusBadgeComponent', () => {
  let challengeService: any
  let translateService: any
  let windowRefService: any
  let component: ChallengeStatusBadgeComponent
  let fixture: ComponentFixture<ChallengeStatusBadgeComponent>

  beforeEach(waitForAsync(() => {
    challengeService = jasmine.createSpyObj('ChallengeService', ['repeatNotification'])
    challengeService.repeatNotification.and.returnValue(of({}))
    translateService = jasmine.createSpyObj('TranslateService', ['get'])
    translateService.get.and.returnValue(of({}))
    translateService.onLangChange = new EventEmitter()
    translateService.onTranslationChange = new EventEmitter()
    translateService.onDefaultLangChange = new EventEmitter()

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(),
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        ChallengeStatusBadgeComponent],
      providers: [
        { provide: TranslateService, useValue: translateService },
        { provide: ChallengeService, useValue: challengeService },
        WindowRefService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()

    windowRefService = TestBed.inject(WindowRefService)
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeStatusBadgeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should show notification for selected challenge when enabled', () => {
    component.allowRepeatNotifications = true
    component.challenge = { name: 'Challenge #1', solved: true } as Challenge
    component.repeatNotification()
    expect(challengeService.repeatNotification).toHaveBeenCalledWith(encodeURIComponent('Challenge #1'))
  })

  it('should scroll to top of screen when notification is repeated', () => {
    component.allowRepeatNotifications = true
    component.challenge = { name: 'Challenge #1', solved: true } as Challenge
    spyOn(windowRefService.nativeWindow, 'scrollTo')
    component.repeatNotification()
    expect(windowRefService.nativeWindow.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('should log the error from backend on failing to repeat notification', fakeAsync(() => {
    component.allowRepeatNotifications = true
    component.challenge = { name: 'Challenge #1', solved: true } as Challenge
    challengeService.repeatNotification.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.repeatNotification()
    expect(console.log).toHaveBeenCalledWith('Error')
  }))
})
