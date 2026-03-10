/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngy-cookie'
import { of } from 'rxjs'

import { CodingChallengeFindItComponent } from './coding-challenge-find-it.component'
import { VulnLinesService } from '../Services/vuln-lines.service'
import { ChallengeService } from '../Services/challenge.service'

describe('CodingChallengeFindItComponent', () => {
  let component: CodingChallengeFindItComponent
  let fixture: ComponentFixture<CodingChallengeFindItComponent>
  let vulnLinesService: any
  let challengeService: any
  let cookieService: any

  beforeEach(waitForAsync(() => {
    vulnLinesService = jasmine.createSpyObj('VulnLinesService', ['check'])
    challengeService = jasmine.createSpyObj('ChallengeService', ['continueCodeFindIt'])
    challengeService.continueCodeFindIt.and.returnValue(of('continueCodeFindIt'))
    cookieService = jasmine.createSpyObj('CookieService', ['put'])

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        CodingChallengeFindItComponent
      ],
      providers: [
        { provide: VulnLinesService, useValue: vulnLinesService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: CookieService, useValue: cookieService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CodingChallengeFindItComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('challengeKey', 'testChallenge')
    fixture.componentRef.setInput('snippet', { snippet: 'line1\nline2\nline3', vulnLines: [2] })
    fixture.componentRef.setInput('alreadySolved', false)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize line markers from snippet', () => {
    expect(component.markedLines.size).toBe(0)
    expect(component.selectedLines).toEqual([])
  })

  it('should set result to Right if already solved', () => {
    fixture.componentRef.setInput('alreadySolved', true)
    component.ngOnInit()
    expect(component.result).toBe(1)
  })

  it('should toggle line markers on selectLines', () => {
    fixture.detectChanges()
    component.selectLines(2)
    expect(component.selectedLines).toEqual([2])
    component.selectLines(2)
    expect(component.selectedLines).toEqual([])
  })

  it('should check lines and set hint on wrong verdict', () => {
    vulnLinesService.check.and.returnValue(of({ verdict: false, hint: 'Try again' }))
    component.checkLines()
    expect(component.result).toBe(2)
    expect(component.hint).toBe('Try again')
  })

  it('should check lines and set right verdict on correct answer', () => {
    vulnLinesService.check.and.returnValue(of({ verdict: true, hint: null }))
    component.checkLines()
    expect(component.result).toBe(1)
  })

  it('result icon is "send" when undecided', () => {
    component.result = 0
    expect(component.resultIcon()).toBe('send')
  })

  it('result icon is "clear" when wrong', () => {
    component.result = 2
    expect(component.resultIcon()).toBe('clear')
    expect(component.resultColor()).toBe('warn')
  })

  it('result icon is "check" when right', () => {
    component.result = 1
    expect(component.resultIcon()).toBe('check')
    expect(component.resultColor()).toBe('accent')
  })
})
