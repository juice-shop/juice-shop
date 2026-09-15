/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, CUSTOM_ELEMENTS_SCHEMA, input, output } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { ActivatedRoute, provideRouter } from '@angular/router'
import { of, Subject, throwError } from 'rxjs'

import { CookieService } from 'ngy-cookie'
import { CodingChallengePageComponent } from './coding-challenge-page.component'
import { CodeSnippetService } from '../Services/code-snippet.service'
import { CodeFixesService } from '../Services/code-fixes.service'
import { ChallengeService } from '../Services/challenge.service'
import { CodingChallengeFindItComponent } from './components/coding-challenge-find-it/coding-challenge-find-it.component'
import { CodingChallengeFixItComponent } from './components/coding-challenge-fix-it/coding-challenge-fix-it.component'

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

Element.prototype.scrollIntoView = vi.fn()

describe('CodingChallengePageComponent', () => {
    let codeSnippetService: any
    let codeFixesService: any
    let challengeService: any

    function createComponent(): {
        component: CodingChallengePageComponent;
        fixture: ComponentFixture<CodingChallengePageComponent>;
    } {
        const fixture = TestBed.createComponent(CodingChallengePageComponent)
        const component = fixture.componentInstance
        fixture.detectChanges()
        return { component, fixture }
    }

    beforeEach(async () => {
        codeSnippetService = {
            get: vi.fn().mockName("CodeSnippetService.get")
        }
        codeSnippetService.get.mockReturnValue(of({ snippet: 'code', vulnLines: [1] }))
        codeFixesService = {
            get: vi.fn().mockName("CodeFixesService.get")
        }
        codeFixesService.get.mockReturnValue(of({ fixes: ['fix1', 'fix2'] }))
        challengeService = {
            find: vi.fn().mockName("ChallengeService.find"),
            continueCodeFindIt: vi.fn().mockName("ChallengeService.continueCodeFindIt"),
            continueCodeFixIt: vi.fn().mockName("ChallengeService.continueCodeFixIt")
        }
        challengeService.find.mockReturnValue(of([
            { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 0 }
        ]))
        challengeService.continueCodeFindIt.mockReturnValue(of('code'))
        challengeService.continueCodeFixIt.mockReturnValue(of('code'))

        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                CodingChallengePageComponent
            ],
            providers: [
                provideRouter([]),
                { provide: CodeSnippetService, useValue: codeSnippetService },
                { provide: CodeFixesService, useValue: codeFixesService },
                { provide: ChallengeService, useValue: challengeService },
                {
                    provide: ActivatedRoute,
                    useValue: { params: of({ challengeKey: 'testChallenge' }) }
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
    })

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
        expect(component.findItSolved).toBe(true)
    })

    it('should set fixItSolved on onFixItSolved', () => {
        const { component } = createComponent()
        component.onFixItSolved()
        expect(component.fixItSolved).toBe(true)
    })

    it('should handle snippet load error', () => {
        codeSnippetService.get.mockReturnValue(throwError({ error: 'Error' }))
        const { component } = createComponent()
        expect(component.snippet).toEqual({ snippet: 'Error' })
    })

    it('should handle fixes load error', () => {
        codeFixesService.get.mockReturnValue(throwError('Error'))
        const { component } = createComponent()
        expect(component.fixes).toBeNull()
    })

    it('should set findItSolved and fixItSolved based on codingChallengeStatus', () => {
        challengeService.find.mockReturnValue(of([
            { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 2 }
        ]))
        const { component } = createComponent()
        expect(component.findItSolved).toBe(true)
        expect(component.fixItSolved).toBe(true)
    })

    it('should leave challengeName undefined when challenge key is not found', () => {
        challengeService.find.mockReturnValue(of([
            { key: 'otherChallenge', name: 'Other', codingChallengeStatus: 0 }
        ]))
        const { component } = createComponent()
        expect(component.challengeName).toBeUndefined()
        expect(component.findItSolved).toBe(false)
        expect(component.fixItSolved).toBe(false)
    })

    describe('template rendering', () => {
        it('should show spinner while loading', () => {
            codeSnippetService.get.mockReturnValue(new Subject())
            codeFixesService.get.mockReturnValue(new Subject())
            challengeService.find.mockReturnValue(new Subject())
            const { fixture } = createComponent()
            expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull()
        })

        it('should render find-it component when loaded with snippet', () => {
            const { fixture } = createComponent()
            expect(fixture.nativeElement.querySelector('coding-challenge-find-it')).not.toBeNull()
        })

        it('should render locked fix-it section when findIt is not solved', () => {
            const { fixture } = createComponent()
            const locked = fixture.nativeElement.querySelector('.locked-section')
            expect(locked).not.toBeNull()
            expect(locked.querySelector('.locked-icon')).not.toBeNull()
        })

        it('should render fix-it component when findIt is solved and fixes exist', () => {
            challengeService.find.mockReturnValue(of([
                { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 1 }
            ]))
            const { fixture } = createComponent()
            expect(fixture.nativeElement.querySelector('coding-challenge-fix-it')).not.toBeNull()
        })

        it('should not render fix-it component when findIt is solved but fixes are null', () => {
            challengeService.find.mockReturnValue(of([
                { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 1 }
            ]))
            codeFixesService.get.mockReturnValue(throwError('Error'))
            const { fixture } = createComponent()
            expect(fixture.nativeElement.querySelector('coding-challenge-fix-it')).toBeNull()
        })

        it('should display challenge name in header', () => {
            const { fixture } = createComponent()
            const h2 = fixture.nativeElement.querySelector('h2')
            expect(h2).not.toBeNull()
            expect(h2.textContent).toContain('Test Challenge')
        })

        it('should render back button linking to score-board', () => {
            const { fixture } = createComponent()
            const backButton = fixture.nativeElement.querySelector('.back-button')
            expect(backButton).not.toBeNull()
            expect(backButton.getAttribute('href')).toBe('/score-board')
        })
    })

    describe('onFindItSolved scroll behavior', () => {
        it('should scroll fixItSection into view when fixes are available', () => {
            vi.useFakeTimers()
            challengeService.find.mockReturnValue(of([
                { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 1 }
            ]))
            const { component } = createComponent()
            const section = component.fixItSection()
            expect(section).not.toBeNull()
            vi.spyOn(section.nativeElement, 'scrollIntoView')
            component.onFindItSolved()
            vi.advanceTimersByTime(300)
            expect(section.nativeElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
            vi.useRealTimers()
        })

        it('should not attempt scroll when fixes are null', () => {
            vi.useFakeTimers()
            const { component } = createComponent()
            component.fixes = null
            component.onFindItSolved()
            vi.advanceTimersByTime(300)
            expect(component.findItSolved).toBe(true)
            vi.useRealTimers()
        })
    })

    describe('fixes nullish handling and missing fixItSection', () => {
        it('should default fixes to null when service returns an object without fixes', () => {
            codeFixesService.get.mockReturnValue(of({}))
            const { component } = createComponent()
            expect(component.fixes).toBeNull()
        })

        it('should not throw on onFindItSolved when fixItSection is unavailable', () => {
            vi.useFakeTimers()
            challengeService.find.mockReturnValue(of([
                { key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 1 }
            ]))
            const { component } = createComponent()
            ;(component as any).fixItSection = () => undefined
            expect(() => {
                component.onFindItSolved()
                vi.advanceTimersByTime(300)
            }).not.toThrow()
            vi.useRealTimers()
        })
    })

    describe('template rendering', () => {
        let realCodeSnippetService: any
        let realCodeFixesService: any
        let realChallengeService: any

        beforeEach(async () => {
            TestBed.resetTestingModule()
            realCodeSnippetService = { get: vi.fn().mockReturnValue(of({ snippet: 'code', vulnLines: [1] })) }
            realCodeFixesService = { get: vi.fn().mockReturnValue(of({ fixes: ['fix1', 'fix2'] })) }
            realChallengeService = {
                find: vi.fn().mockReturnValue(of([{ key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 0 }])),
                continueCodeFindIt: vi.fn().mockReturnValue(of('code')),
                continueCodeFixIt: vi.fn().mockReturnValue(of('code'))
            }
            await TestBed.configureTestingModule({
                imports: [TranslateModule.forRoot(), CodingChallengePageComponent],
                providers: [
                    provideRouter([]),
                    { provide: CodeSnippetService, useValue: realCodeSnippetService },
                    { provide: CodeFixesService, useValue: realCodeFixesService },
                    { provide: ChallengeService, useValue: realChallengeService },
                    { provide: ActivatedRoute, useValue: { params: of({ challengeKey: 'testChallenge' }) } },
                    { provide: CookieService, useValue: { put: vi.fn(), get: vi.fn(), hasKey: vi.fn().mockReturnValue(false) } },
                    provideHttpClient(withInterceptorsFromDi()),
                    provideHttpClientTesting()
                ],
                schemas: [CUSTOM_ELEMENTS_SCHEMA]
            }).compileComponents()
        })

        it('should render back-to-score-board link, challenge title and find-it section', () => {
            const fixture = TestBed.createComponent(CodingChallengePageComponent)
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            const back = compiled.querySelector('a.back-button')
            expect(back).not.toBeNull()
            expect(back!.getAttribute('href')).toBe('/score-board')
            expect(compiled.querySelector('h2')!.textContent).toContain('Test Challenge')
            expect(compiled.querySelector('coding-challenge-find-it')).not.toBeNull()
            expect(compiled.querySelector('.locked-section')).not.toBeNull()
            expect(compiled.querySelector('coding-challenge-fix-it')).toBeNull()
        })

        it('should hide challenge title when no challenge is found', () => {
            realChallengeService.find.mockReturnValue(of([{ key: 'other', name: 'Other', codingChallengeStatus: 0 }]))
            const fixture = TestBed.createComponent(CodingChallengePageComponent)
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('h2')).toBeNull()
        })

        it('should render the loading spinner before data is loaded', () => {
            realCodeSnippetService.get.mockReturnValue(new Subject())
            realCodeFixesService.get.mockReturnValue(new Subject())
            realChallengeService.find.mockReturnValue(new Subject())
            const fixture = TestBed.createComponent(CodingChallengePageComponent)
            fixture.detectChanges()
            const spinner = (fixture.nativeElement as HTMLElement).querySelector('mat-spinner')
            expect(spinner).not.toBeNull()
            expect(spinner!.getAttribute('aria-label')).toBe('Loading challenge')
            expect((fixture.nativeElement as HTMLElement).querySelector('coding-challenge-find-it')).toBeNull()
        })

        it('should render the fix-it section once findIt is solved and fixes are available', () => {
            realChallengeService.find.mockReturnValue(of([{ key: 'testChallenge', name: 'Test Challenge', codingChallengeStatus: 1 }]))
            const fixture = TestBed.createComponent(CodingChallengePageComponent)
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('coding-challenge-fix-it')).not.toBeNull()
            expect(compiled.querySelector('.locked-section')).toBeNull()
        })

        it('should not render the find-it section when snippet load fails to produce a snippet', () => {
            realCodeSnippetService.get.mockReturnValue(of(null))
            const fixture = TestBed.createComponent(CodingChallengePageComponent)
            fixture.detectChanges()
            expect((fixture.nativeElement as HTMLElement).querySelector('coding-challenge-find-it')).toBeNull()
            expect((fixture.nativeElement as HTMLElement).querySelector('.locked-section')).toBeNull()
        })
    })

    describe('route param changes', () => {
        it('should re-fetch data when route params change', () => {
            const paramsSubject = new Subject<any>()
            TestBed.overrideProvider(ActivatedRoute, { useValue: { params: paramsSubject } })
            const fixture = TestBed.createComponent(CodingChallengePageComponent)
            const component = fixture.componentInstance
            fixture.detectChanges()

            paramsSubject.next({ challengeKey: 'testChallenge' })
            expect(codeSnippetService.get).toHaveBeenCalledWith('testChallenge')

            codeSnippetService.get.mockClear()
            challengeService.find.mockReturnValue(of([
                { key: 'anotherChallenge', name: 'Another', codingChallengeStatus: 0 }
            ]))
            paramsSubject.next({ challengeKey: 'anotherChallenge' })
            expect(codeSnippetService.get).toHaveBeenCalledWith('anotherChallenge')
            expect(component.challengeKey).toBe('anotherChallenge')
        })
    })
})
