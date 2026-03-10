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

import { CodingChallengeFixItComponent } from './coding-challenge-fix-it.component'
import { CodeFixesService } from '../Services/code-fixes.service'
import { ChallengeService } from '../Services/challenge.service'

describe('CodingChallengeFixItComponent', () => {
  let component: CodingChallengeFixItComponent
  let fixture: ComponentFixture<CodingChallengeFixItComponent>
  let codeFixesService: any
  let challengeService: any
  let cookieService: any

  beforeEach(waitForAsync(() => {
    codeFixesService = jasmine.createSpyObj('CodeFixesService', ['check'])
    challengeService = jasmine.createSpyObj('ChallengeService', ['continueCodeFixIt'])
    challengeService.continueCodeFixIt.and.returnValue(of('continueCodeFixIt'))
    cookieService = jasmine.createSpyObj('CookieService', ['put', 'hasKey', 'get'])
    cookieService.hasKey.and.returnValue(false)

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        CookieModule.forRoot(),
        CodingChallengeFixItComponent
      ],
      providers: [
        { provide: CodeFixesService, useValue: codeFixesService },
        { provide: ChallengeService, useValue: challengeService },
        { provide: CookieService, useValue: cookieService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CodingChallengeFixItComponent)
    component = fixture.componentInstance
    fixture.componentRef.setInput('challengeKey', 'testChallenge')
    fixture.componentRef.setInput('snippet', { snippet: 'original code', vulnLines: [1] })
    fixture.componentRef.setInput('fixes', ['fix1', 'fix2', 'fix3'])
    fixture.componentRef.setInput('alreadySolved', false)
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should shuffle fixes on init', () => {
    expect(component.randomFixes).toHaveSize(3)
    expect(component.randomFixes).toContain(jasmine.objectContaining({ fix: 'fix1', index: 0 }))
    expect(component.randomFixes).toContain(jasmine.objectContaining({ fix: 'fix2', index: 1 }))
    expect(component.randomFixes).toContain(jasmine.objectContaining({ fix: 'fix3', index: 2 }))
  })

  it('should set result to Right if already solved', () => {
    fixture.componentRef.setInput('alreadySolved', true)
    component.ngOnInit()
    expect(component.result).toBe(1)
  })

  it('should set selected fix and clear explanation', () => {
    component.explanation = 'some explanation'
    component.setFix(2)
    expect(component.selectedFix).toBe(2)
    expect(component.explanation).toBeNull()
  })

  it('should check fix and set wrong verdict', () => {
    codeFixesService.check.and.returnValue(of({ verdict: false, explanation: 'Wrong!' }))
    component.randomFixes = [{ fix: 'fix1', index: 0 }]
    component.selectedFix = 0
    component.checkFix()
    expect(component.result).toBe(2)
    expect(component.explanation).toBe('Wrong!')
  })

  it('should check fix and set right verdict', () => {
    codeFixesService.check.and.returnValue(of({ verdict: true, explanation: 'Correct!' }))
    component.randomFixes = [{ fix: 'fix1', index: 0 }]
    component.selectedFix = 0
    component.checkFix()
    expect(component.result).toBe(1)
    expect(component.explanation).toBe('Correct!')
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
