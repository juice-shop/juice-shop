/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, input, output } from '@angular/core'
import { type ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { RouterTestingModule } from '@angular/router/testing'
import { ActivatedRoute } from '@angular/router'
import { of, throwError } from 'rxjs'

import { CodingChallengePageComponent } from './coding-challenge-page.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { CodeFixesService } from '../Services/code-fixes.service'
import { ChallengeService } from '../Services/challenge.service'
import { CodingChallengeFindItComponent } from '../coding-challenge-find-it/coding-challenge-find-it.component'
import { CodingChallengeFixItComponent } from '../coding-challenge-fix-it/coding-challenge-fix-it.component'

@Component({ selector: 'coding-challenge-find-it', template: '', standalone: true })
class MockFindItComponent {
  readonly challengeKey = input.required<string>()
  readonly snippet = input.required<any>()
  readonly alreadySolved = input(false)
  readonly solved = output<void>()
}

@Component({ selector: 'coding-challenge-fix-it', template: '', standalone: true })
class MockFixItComponent {
  readonly challengeKey = input.required<string>()
  readonly snippet = input.required<any>()
  readonly fixes = input.required<string[]>()
  readonly alreadySolved = input(false)
  readonly solved = output<void>()
}

describe('CodingChallengePageComponent', () => {
  let codeSnippetService: any
  let codeFixesService: any
  let challengeService: any

  function createComponent (): { component: CodingChallengePageComponent, fixture: ComponentFixture<CodingChallengePageComponent> } {
    const fixture = TestBed.createComponent(CodingChallengePageComponent)
    const component = fixture.componentInstance
    fixture.detectChanges()
    return { component, fixture }
  }

  beforeEach(waitForAsync(() => {
    codeSnippetService = jasmine.createSpyObj('CodeSnippetService', ['get'])
    codeSnippetService.get.and.returnValue(of({ snippet: 'code', vulnLines: [1] }))
    codeFixesService = jasmine.createSpyObj('CodeFixesService', ['get'])
    codeFixesService.get.and.returnValue(of({ fixes: ['fix1', 'fix2'] }))
    challengeService = jasmine.createSpyObj('ChallengeService', ['find', 'continueCodeFindIt', 'continueCodeFixIt'])
    challengeService.find.and.returnValue(of([
      { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 0 }
    ]))
    challengeService.continueCodeFindIt.and.returnValue(of('code'))
    challengeService.continueCodeFixIt.and.returnValue(of('code'))

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        RouterTestingModule,
        CodingChallengePageComponent
      ],
      providers: [
        { provide: CodeSnippetService, useValue: codeSnippetService },
        { provide: CodeFixesService, useValue: codeFixesService },
        { provide: ChallengeService, useValue: challengeService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { challengeKey: 'testChallenge' } } }
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    })
      .overrideComponent(CodingChallengePageComponent, {
        remove: { imports: [CodingChallengeFindItComponent, CodingChallengeFixItComponent] },
        add: { imports: [MockFindItComponent, MockFixItComponent] }
      })
      .compileComponents()
  }))

  it('should create', () => {
    const { component } = createComponent()
    expect(component).toBeTruthy()
  })

  it('should load challenge name from service', () => {
    const { component } = createComponent()
    expect(component.challengeName).toBe('Test Challenge')
  })

  it('should load snippet from service', () => {
    const { component } = createComponent()
    expect(component.snippet).toEqual({ snippet: 'code', vulnLines: [1] })
  })

  it('should load fixes from service', () => {
    const { component } = createComponent()
    expect(component.fixes).toEqual(['fix1', 'fix2'])
  })

  it('should set findItSolved on onFindItSolved', () => {
    const { component } = createComponent()
    component.onFindItSolved()
    expect(component.findItSolved).toBeTrue()
  })

  it('should set fixItSolved on onFixItSolved', () => {
    const { component } = createComponent()
    component.onFixItSolved()
    expect(component.fixItSolved).toBeTrue()
  })

  it('should handle snippet load error', () => {
    codeSnippetService.get.and.returnValue(throwError({ error: 'Error' }))
    const { component } = createComponent()
    expect(component.snippet).toEqual({ snippet: 'Error' })
  })

  it('should handle fixes load error', () => {
    codeFixesService.get.and.returnValue(throwError('Error'))
    const { component } = createComponent()
    expect(component.fixes).toBeNull()
  })

  it('should set findItSolved and fixItSolved based on codingChallengeStatus', () => {
    challengeService.find.and.returnValue(of([
      { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 2 }
    ]))
    const { component } = createComponent()
    expect(component.findItSolved).toBeTrue()
    expect(component.fixItSolved).toBeTrue()
  })
})
