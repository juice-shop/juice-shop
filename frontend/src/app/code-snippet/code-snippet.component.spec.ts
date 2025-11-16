/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { MatDividerModule } from '@angular/material/divider'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CodeSnippetComponent } from './code-snippet.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { CookieModule, CookieService } from 'ngy-cookie'
import { ConfigurationService } from '../Services/configuration.service'
import { of, throwError } from 'rxjs'
import { CodeFixesService } from '../Services/code-fixes.service'
import { VulnLinesService } from '../Services/vuln-lines.service'
import { ChallengeService } from '../Services/challenge.service'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'

describe('CodeSnippetComponent', () => {
  let component: CodeSnippetComponent
  let fixture: ComponentFixture<CodeSnippetComponent>
  let configurationService: any
  let cookieService: any
  let codeSnippetService: any
  let codeFixesService: any
  let vulnLinesService: any
  let challengeService: any

  beforeEach(waitForAsync(() => {
    configurationService = jasmine.createSpyObj('ConfigurationService', ['getApplicationConfiguration'])
    configurationService.getApplicationConfiguration.and.returnValue(of({ application: {}, challenges: {} }))
    cookieService = jasmine.createSpyObj('CookieService', ['put', 'hasKey'])
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', ['get', 'check'])
    codeSnippetService.get.and.returnValue(of({}))
    codeFixesService = jasmine.createSpyObj('CodeFixesService', ['get', 'check'])
    codeFixesService.get.and.returnValue(of({}))
    vulnLinesService = jasmine.createSpyObj('VulnLinesService', ['check'])
    challengeService = jasmine.createSpyObj('ChallengeService', ['continueCodeFindIt', 'continueCodeFixIt'])
    challengeService.continueCodeFindIt.and.returnValue(of('continueCodeFindIt'))
    challengeService.continueCodeFixIt.and.returnValue(of('continueCodeFixIt'))

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule,
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        MatDividerModule,
        MatDialogModule,
        CodeSnippetComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { dialogData: {} } },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: CookieService, useValue: cookieService },
        { provide: CodeSnippetService, useValue: codeSnippetService },
        { provide: CodeFixesService, useValue: codeFixesService },
        { provide: VulnLinesService, useValue: vulnLinesService },
        { provide: ChallengeService, useValue: challengeService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeSnippetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should log the error on retrieving configuration', () => {
    configurationService.getApplicationConfiguration.and.returnValue(throwError('Error'))
    console.log = jasmine.createSpy('log')
    component.ngOnInit()
    expect(console.log).toHaveBeenCalledWith('Error')
  })

  it('should set the retrieved snippet', () => {
    codeSnippetService.get.and.returnValue(of({ snippet: 'Snippet' }))
    component.ngOnInit()
    expect(component.snippet).toEqual({ snippet: 'Snippet' })
  })

  it('Default status and icons should reflect both challenge phases yet unsolved', () => {
    component.ngOnInit()
    expect(component.result).toBe(0)
    expect(component.lock).toBe(0)
    expect(component.solved.findIt).toBeFalse()
  })

  it('should set status and icons for solved "Find It" phase', () => {
    component.dialogData.codingChallengeStatus = 1
    component.ngOnInit()
    expect(component.result).toBe(1)
    expect(component.lock).toBe(1)
    expect(component.solved.findIt).toBeTrue()
  })

  it('should set an error on snippet retrieval as the snippet', () => {
    codeSnippetService.get.and.returnValue(throwError({ error: 'Error' }))
    component.ngOnInit()
    expect(component.snippet).toEqual({ snippet: 'Error' })
  })

  it('should set empty fixes on error during fixes retrieval', () => {
    codeFixesService.get.and.returnValue(throwError('Error'))
    component.ngOnInit()
    expect(component.fixes).toBeNull()
  })

  it('selected code lines are set in component', () => {
    component.selectedLines = [42]
    component.addLine([1, 3, 5])
    expect(component.selectedLines).toEqual([1, 3, 5])
  })

  it('selected code fix is set in component', () => {
    component.selectedFix = 42
    component.setFix(1)
    expect(component.selectedFix).toBe(1)
  })

  it('selecting a code fix clears previous explanation', () => {
    component.explanation = 'Wrong answer!'
    component.setFix(1)
    expect(component.explanation).toBeNull()
  })

  it('lock icon is red and "locked" when no fixes are available', () => {
    component.fixes = null
    expect(component.lockIcon()).toBe('lock')
    expect(component.lockColor()).toBe('warn')
  })

  it('lock icon is red and "locked" by default', () => {
    component.fixes = ['Fix1', 'Fix2', 'Fix3']
    component.lock = 0
    expect(component.lockIcon()).toBe('lock')
    expect(component.lockColor()).toBe('warn')
  })

  it('lock icon is red and "locked" when "Find It" phase is unsolved', () => {
    component.fixes = ['Fix1', 'Fix2', 'Fix3']
    component.lock = 2
    expect(component.lockIcon()).toBe('lock')
    expect(component.lockColor()).toBe('warn')
  })

  it('lock icon is green and "lock_open" when "Find It" phase is in solved', () => {
    component.fixes = ['Fix1', 'Fix2', 'Fix3']
    component.lock = 1
    expect(component.lockIcon()).toBe('lock_open')
    expect(component.lockColor()).toBe('accent')
  })

  it('result icon is "send" when choice is not yet submitted', () => {
    component.result = 0
    expect(component.resultIcon()).toBe('send')
  })

  it('result icon is red "clear" when wrong answer has been submitted', () => {
    component.result = 2
    expect(component.resultIcon()).toBe('clear')
    expect(component.resultColor()).toBe('warn')
  })

  it('result icon is green "check" when right answer has been submitted', () => {
    component.result = 1
    expect(component.resultIcon()).toBe('check')
    expect(component.resultColor()).toBe('accent')
  })

  it('correctly submitted vulnerable lines toggle positive verdict for "Find It" phase', () => {
    component.tab.setValue(0)
    vulnLinesService.check.and.returnValue(of({ verdict: true }))
    component.checkLines()
    expect(component.solved.findIt).toBeTrue()
  })

  xit('correctly submitted vulnerable lines toggle tab to "Fix It" if code fixes exist', waitForAsync(() => {
    component.tab.setValue(0)
    component.fixes = ['Fix1', 'Fix2', 'Fix3']
    vulnLinesService.check.and.returnValue(of({ verdict: true }))
    component.checkLines()
    expect(component.tab.value).toBe(1)
  }))

  it('correctly submitted fix toggles positive verdict for "Fix It" phase', () => {
    component.tab.setValue(1)
    component.randomFixes = [{ fix: 'Fix 1', index: 0 }]
    codeFixesService.check.and.returnValue(of({ verdict: true }))
    component.checkFix()
    expect(component.solved.fixIt).toBeTrue()
  })

  it('should remember the original order of available code fix options when shuffling', () => {
    component.fixes = ['Fix 1', 'Fix 2', 'Fix 3']
    component.shuffle()
    expect(component.randomFixes).toContain({ fix: 'Fix 1', index: 0 })
    expect(component.randomFixes).toContain({ fix: 'Fix 2', index: 1 })
    expect(component.randomFixes).toContain({ fix: 'Fix 3', index: 2 })
  })
})
