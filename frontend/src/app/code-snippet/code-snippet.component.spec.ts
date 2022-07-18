/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { TranslateModule } from '@ngx-translate/core'
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { MatDividerModule } from '@angular/material/divider'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CodeSnippetComponent } from './code-snippet.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { CookieModule, CookieService } from 'ngx-cookie'
import { ConfigurationService } from '../Services/configuration.service'
import { of, throwError } from 'rxjs'
import { CodeFixesService } from '../Services/code-fixes.service'
import { VulnLinesService } from '../Services/vuln-lines.service'
import { ChallengeService } from '../Services/challenge.service'

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
    cookieService = jasmine.createSpyObj('CookieService', ['put'])
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', ['get', 'check'])
    codeSnippetService.get.and.returnValue(of({}))
    codeFixesService = jasmine.createSpyObj('CodeFixesService', ['get', 'check'])
    codeFixesService.get.and.returnValue(of({}))
    vulnLinesService = jasmine.createSpyObj('VulnLinesService', ['check'])
    challengeService = jasmine.createSpyObj('ChallengeService', ['continueCodeFindIt', 'continueCodeFixIt'])

    TestBed.configureTestingModule({
      imports: [
        CookieModule.forRoot(),
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MatDividerModule,
        MatDialogModule
      ],
      declarations: [CodeSnippetComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { dialogData: {} } },
        { provide: ConfigurationService, useValue: configurationService },
        { provide: CookieService, useValue: cookieService },
        { provide: CodeSnippetService, useValue: codeSnippetService },
        { provide: CodeFixesService, useValue: codeFixesService },
        { provide: VulnLinesService, useValue: vulnLinesService },
        { provide: ChallengeService, useValue: challengeService }
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
})
