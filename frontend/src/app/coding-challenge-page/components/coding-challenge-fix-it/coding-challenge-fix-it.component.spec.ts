/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { CookieModule, CookieService } from 'ngy-cookie'
import { of } from 'rxjs'

import { CodingChallengeFixItComponent } from './coding-challenge-fix-it.component'
import { CodeFixesService } from '../../../Services/code-fixes.service'
import { ChallengeService } from '../../../Services/challenge.service'

describe('CodingChallengeFixItComponent', () => {
    let component: CodingChallengeFixItComponent
    let fixture: ComponentFixture<CodingChallengeFixItComponent>
    let codeFixesService: any
    let challengeService: any
    let cookieService: any

    beforeEach(async () => {
        codeFixesService = {
            check: vi.fn().mockName("CodeFixesService.check")
        }
        challengeService = {
            continueCodeFixIt: vi.fn().mockName("ChallengeService.continueCodeFixIt")
        }
        challengeService.continueCodeFixIt.mockReturnValue(of('continueCodeFixIt'))
        cookieService = {
            put: vi.fn().mockName("CookieService.put"),
            hasKey: vi.fn().mockName("CookieService.hasKey"),
            get: vi.fn().mockName("CookieService.get")
        }
        cookieService.hasKey.mockReturnValue(false)

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
    })

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
        expect(component.randomFixes).toHaveLength(3)
        expect(component.randomFixes).toContainEqual(expect.objectContaining({ fix: 'fix1', index: 0 }))
        expect(component.randomFixes).toContainEqual(expect.objectContaining({ fix: 'fix2', index: 1 }))
        expect(component.randomFixes).toContainEqual(expect.objectContaining({ fix: 'fix3', index: 2 }))
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
        codeFixesService.check.mockReturnValue(of({ verdict: false, explanation: 'Wrong!' }))
        component.randomFixes = [{ fix: 'fix1', index: 0 }]
        component.selectedFix = 0
        component.checkFix()
        expect(component.result).toBe(2)
        expect(component.explanation).toBe('Wrong!')
    })

    it('should check fix and set right verdict', () => {
        codeFixesService.check.mockReturnValue(of({ verdict: true, explanation: 'Correct!' }))
        component.randomFixes = [{ fix: 'fix1', index: 0 }]
        component.selectedFix = 0
        component.checkFix()
        expect(component.result).toBe(1)
        expect(component.explanation).toBe('Correct!')
    })

    describe('diff view', () => {
        it('should render a CodeMirror editor in the diff host', () => {
            const editor = fixture.nativeElement.querySelector('.diff-host .cm-editor')
            expect(editor).not.toBeNull()
        })

        it('should recreate diff view when setFix is called', () => {
            const destroySpy = vi.spyOn(component['diffView'] as any, 'destroy')
            component.setFix(1)
            expect(destroySpy).toHaveBeenCalled()
        })

        it('should recreate diff view when toggleOnlyChangedLines is called', () => {
            const destroySpy = vi.spyOn(component['diffView'] as any, 'destroy')
            component.toggleOnlyChangedLines()
            expect(destroySpy).toHaveBeenCalled()
        })
    })

    describe('template rendering', () => {
        it('should render one toggle button per fix', () => {
            fixture.detectChanges()
            const toggles = fixture.nativeElement.querySelectorAll('mat-button-toggle')
            expect(toggles.length).toBe(3)
        })

        it('should not render explanation card when explanation is null', () => {
            component.explanation = null
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('mat-card')).toBeNull()
        })

        it('should render explanation card with warn class on wrong verdict', () => {
            component.result = 2
            component.explanation = 'Nope'
            fixture.changeDetectorRef.detectChanges()
            const card = fixture.nativeElement.querySelector('mat-card')
            expect(card).not.toBeNull()
            expect(card.classList.contains('warn-notification')).toBe(true)
        })

        it('should render explanation card with accent class on correct verdict', () => {
            component.result = 1
            component.explanation = 'Well done'
            fixture.changeDetectorRef.detectChanges()
            const card = fixture.nativeElement.querySelector('mat-card')
            expect(card).not.toBeNull()
            expect(card.classList.contains('accent-notification')).toBe(true)
        })
    })

    it('should send the original fix index, not the display position', () => {
        codeFixesService.check.mockReturnValue(of({ verdict: false, explanation: '' }))
        component.randomFixes = [
            { fix: 'fix3', index: 2 },
            { fix: 'fix1', index: 0 },
            { fix: 'fix2', index: 1 }
        ]
        component.selectedFix = 0
        component.checkFix()
        expect(codeFixesService.check).toHaveBeenCalledWith('testChallenge', 2)
    })

    it('should preserve all fix indices after shuffle', () => {
        component.shuffle()
        const indices = component.randomFixes.map(f => f.index).sort()
        expect(indices).toEqual([0, 1, 2])
    })

    it('should return correct resultColor for each state', () => {
        component.result = 0
        expect(component.resultColor()).toBeUndefined()
        component.result = 1
        expect(component.resultColor()).toBe('accent')
        component.result = 2
        expect(component.resultColor()).toBe('warn')
    })

    it('should destroy diff view on ngOnDestroy', () => {
        const spy = vi.spyOn(component['diffView'] as any, 'destroy')
        component.ngOnDestroy()
        expect(spy).toHaveBeenCalled()
    })
})
