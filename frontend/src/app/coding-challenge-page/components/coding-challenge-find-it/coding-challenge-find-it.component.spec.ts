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

import { CodingChallengeFindItComponent } from './coding-challenge-find-it.component'
import { VulnLinesService } from '../../../Services/vuln-lines.service'
import { ChallengeService } from '../../../Services/challenge.service'

describe('CodingChallengeFindItComponent', () => {
    let component: CodingChallengeFindItComponent
    let fixture: ComponentFixture<CodingChallengeFindItComponent>
    let vulnLinesService: any
    let challengeService: any
    let cookieService: any

    function editorDom(): HTMLElement {
        return fixture.nativeElement.querySelector('.cm-editor')
    }

    function pressKey(key: string): void {
        editorDom().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    }

    function hasClass(className: string): boolean {
        return editorDom().querySelector(`.${className}`) !== null
    }

    beforeEach(async () => {
        vulnLinesService = {
            check: vi.fn().mockName("VulnLinesService.check")
        }
        challengeService = {
            continueCodeFindIt: vi.fn().mockName("ChallengeService.continueCodeFindIt")
        }
        challengeService.continueCodeFindIt.mockReturnValue(of('continueCodeFindIt'))
        cookieService = {
            put: vi.fn().mockName("CookieService.put")
        }

        await TestBed.configureTestingModule({
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
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(CodingChallengeFindItComponent)
        component = fixture.componentInstance
        fixture.componentRef.setInput('challengeKey', 'testChallenge')
        fixture.componentRef.setInput('snippet', { snippet: 'line1\nline2\nline3\nline4\nline5', vulnLines: [2] })
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
        vulnLinesService.check.mockReturnValue(of({ verdict: false, hint: 'Try again' }))
        component.checkLines()
        expect(component.result).toBe(2)
        expect(component.hint).toBe('Try again')
    })

    it('should check lines and set right verdict on correct answer', () => {
        vulnLinesService.check.mockReturnValue(of({ verdict: true, hint: null }))
        component.checkLines()
        expect(component.result).toBe(1)
    })

    describe('keyboard navigation', () => {
        it('should set the editor root element as focusable with tabindex', () => {
            expect(editorDom().getAttribute('tabindex')).toBe('0')
        })

        it('should set ARIA role and label on the editor', () => {
            expect(editorDom().getAttribute('role')).toBe('listbox')
            expect(editorDom().getAttribute('aria-label')).toContain('arrow keys')
        })

        it('should focus line 1 on first ArrowDown press', () => {
            expect(component.focusedLine).toBe(0)
            pressKey('ArrowDown')
            expect(component.focusedLine).toBe(1)
        })

        it('should move focus down with ArrowDown', () => {
            pressKey('ArrowDown')
            pressKey('ArrowDown')
            expect(component.focusedLine).toBe(2)
            pressKey('ArrowDown')
            expect(component.focusedLine).toBe(3)
        })

        it('should not go past the last line with ArrowDown', () => {
            for (let i = 0; i < 10; i++) {
                pressKey('ArrowDown')
            }
            expect(component.focusedLine).toBe(5)
        })

        it('should move focus up with ArrowUp', () => {
            pressKey('ArrowDown')
            pressKey('ArrowDown')
            pressKey('ArrowDown')
            expect(component.focusedLine).toBe(3)
            pressKey('ArrowUp')
            expect(component.focusedLine).toBe(2)
        })

        it('should not go above line 1 with ArrowUp', () => {
            pressKey('ArrowDown')
            expect(component.focusedLine).toBe(1)
            pressKey('ArrowUp')
            expect(component.focusedLine).toBe(1)
            pressKey('ArrowUp')
            expect(component.focusedLine).toBe(1)
        })

        it('should focus line 1 on first ArrowUp press when no line is focused', () => {
            pressKey('ArrowUp')
            expect(component.focusedLine).toBe(1)
        })

        it('should toggle selection on Space for the focused line', () => {
            pressKey('ArrowDown')
            pressKey('ArrowDown')
            expect(component.focusedLine).toBe(2)
            expect(component.selectedLines).toEqual([])
            pressKey(' ')
            expect(component.selectedLines).toEqual([2])
        })

        it('should deselect a line with Space when it is already selected', () => {
            pressKey('ArrowDown')
            pressKey('ArrowDown')
            pressKey(' ')
            expect(component.selectedLines).toEqual([2])
            pressKey(' ')
            expect(component.selectedLines).toEqual([])
        })

        it('should not toggle selection on Space when no line is focused', () => {
            expect(component.focusedLine).toBe(0)
            pressKey(' ')
            expect(component.selectedLines).toEqual([])
        })

        it('should allow selecting multiple lines via keyboard', () => {
            pressKey('ArrowDown')
            pressKey(' ')
            pressKey('ArrowDown')
            pressKey('ArrowDown')
            pressKey(' ')
            expect(component.selectedLines).toEqual([1, 3])
        })

        it('should show the keyboard focus decoration on the focused line', () => {
            expect(hasClass('cm-keyboard-focused-line')).toBe(false)
            pressKey('ArrowDown')
            expect(hasClass('cm-keyboard-focused-line')).toBe(true)
        })

        it('should show selected-line decoration when a line is toggled via Space', () => {
            pressKey('ArrowDown')
            pressKey(' ')
            expect(hasClass('cm-selected-line')).toBe(true)
        })

        it('mouse click selection should still work alongside keyboard navigation', () => {
            component.selectLines(3)
            expect(component.selectedLines).toEqual([3])
            pressKey('ArrowDown')
            pressKey(' ')
            expect(component.selectedLines).toEqual([1, 3])
        })
    })

    describe('keyboard hint', () => {
        function hintElement(): HTMLElement | null {
            return fixture.nativeElement.querySelector('.keyboard-hint')
        }

        function focusEditor(): void {
            editorDom().dispatchEvent(new FocusEvent('focus'))
            fixture.detectChanges()
        }

        function blurEditor(): void {
            editorDom().dispatchEvent(new FocusEvent('blur'))
            fixture.detectChanges()
        }

        it('should not show keyboard hint initially', () => {
            expect(hintElement()).toBeNull()
        })

        it('should show keyboard hint when editor receives focus', () => {
            focusEditor()
            expect(hintElement()).not.toBeNull()
        })

        it('should hide keyboard hint when editor loses focus', () => {
            focusEditor()
            expect(hintElement()).not.toBeNull()
            blurEditor()
            expect(hintElement()).toBeNull()
        })

        it('should hide keyboard hint on first ArrowDown press', () => {
            focusEditor()
            expect(hintElement()).not.toBeNull()
            pressKey('ArrowDown')
            fixture.detectChanges()
            expect(hintElement()).toBeNull()
        })

        it('should hide keyboard hint on first ArrowUp press', () => {
            focusEditor()
            expect(hintElement()).not.toBeNull()
            pressKey('ArrowUp')
            fixture.detectChanges()
            expect(hintElement()).toBeNull()
        })
    })

    describe('hint card rendering', () => {
        it('should not render hint card when hint is null', () => {
            component.hint = null
            fixture.detectChanges()
            expect(fixture.nativeElement.querySelector('mat-card')).toBeNull()
        })

        it('should render hint card when hint is set', () => {
            vulnLinesService.check.mockReturnValue(of({ verdict: false, hint: 'Look closer' }))
            component.checkLines()
            fixture.detectChanges()
            const card = fixture.nativeElement.querySelector('mat-card')
            expect(card).not.toBeNull()
            expect(card.textContent).toContain('Look closer')
        })
    })

    describe('verdict idempotency', () => {
        it('should not change result from Right on subsequent verdicts', () => {
            vulnLinesService.check.mockReturnValue(of({ verdict: true, hint: null }))
            component.checkLines()
            expect(component.result).toBe(1)
            vulnLinesService.check.mockReturnValue(of({ verdict: false, hint: 'wrong' }))
            component.checkLines()
            expect(component.result).toBe(1)
        })
    })

    describe('shaking state', () => {
        it('should set shaking to true on wrong verdict', () => {
            vulnLinesService.check.mockReturnValue(of({ verdict: false, hint: null }))
            component.checkLines()
            expect(component.shaking).toBe(true)
        })
    })

    describe('cleanup', () => {
        it('should destroy editor view on ngOnDestroy', () => {
            const spy = vi.spyOn(component['editorView'], 'destroy')
            component.ngOnDestroy()
            expect(spy).toHaveBeenCalled()
        })
    })
})
