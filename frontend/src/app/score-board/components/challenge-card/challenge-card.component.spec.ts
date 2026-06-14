import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideZoneChangeDetection } from '@angular/core'
import { provideRouter } from '@angular/router'

import { ChallengeCardComponent } from './challenge-card.component'
import { type Config } from '../../../../app/Services/configuration.service'
import { TranslateModule } from '@ngx-translate/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'

describe('ChallengeCard', () => {
    let component: ChallengeCardComponent
    let fixture: ComponentFixture<ChallengeCardComponent>

    const defaultChallenge = {
        category: 'foobar',
        name: 'my name',
        mitigationUrl: 'https://owasp.example.com',
        hasCodingChallenge: true,
        description: 'lorem ipsum',
        tagList: [] as string[]
    } as any

    const defaultAppConfig = {
        ctf: { showFlagsInNotifications: true },
        challenges: { codingChallengesEnabled: 'solved' },
        hackingInstructor: { isEnabled: true }
    } as Config

    async function setup() {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), MatIconModule, MatTooltipModule, ChallengeCardComponent],
            providers: [provideZoneChangeDetection(), provideRouter([])]
        })
            .compileComponents()

        fixture = TestBed.createComponent(ChallengeCardComponent)
        component = fixture.componentInstance

        fixture.componentRef.setInput('challenge', { ...defaultChallenge })
        fixture.componentRef.setInput('applicationConfiguration', defaultAppConfig)

        fixture.detectChanges()
    }

    function appendCodeToFixture(text: string) {
        const codeTag = document.createElement('code')
        codeTag.innerText = text
        fixture.nativeElement.appendChild(codeTag)
        return codeTag
    }

    beforeEach(async () => {
        await setup()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should not show a mitigation link when challenge has it but is not solved', () => {
        fixture.componentRef.setInput('challenge', { ...defaultChallenge, solved: false })
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelector('[aria-label="Vulnerability mitigation link"]'))
            .toBeFalsy()
    })

    it('should show a mitigation link when challenge has it and is solved', () => {
        fixture.componentRef.setInput('challenge', { ...defaultChallenge, solved: true })
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelector('[aria-label="Vulnerability mitigation link"]'))
            .toBeTruthy()
    })

    it('should copy payload to clipboard and show confirmation', async () => {
        const codeTag = appendCodeToFixture('javascript:alert(`xss`)')

        const mockClipboard = {
            writeText: vi.fn().mockReturnValue(Promise.resolve())
        }
        Object.defineProperty(navigator, 'clipboard', {
            value: mockClipboard,
            writable: true
        })
        vi.spyOn((component as any).snackBarHelperService, 'open')

        component.copyPayload({ target: codeTag } as unknown as MouseEvent)
        fixture.detectChanges()
        await fixture.whenStable()

        expect(mockClipboard.writeText).toHaveBeenCalledWith('javascript:alert(`xss`)')
        expect((component as any).snackBarHelperService.open).toHaveBeenCalledWith('COPY_SUCCESS', 'confirmBar')
    })

    it('should do nothing when no code element is present', async () => {
        const existingCodeTag = fixture.nativeElement.querySelector('code')
        if (existingCodeTag)
            existingCodeTag.remove()

        const mockClipboard = {
            writeText: vi.fn().mockReturnValue(Promise.resolve())
        }
        Object.defineProperty(navigator, 'clipboard', {
            value: mockClipboard,
            writable: true
        })
        vi.spyOn((component as any).snackBarHelperService, 'open')

        component.copyPayload({ target: fixture.nativeElement } as unknown as MouseEvent)
        fixture.detectChanges()
        await fixture.whenStable()

        expect(mockClipboard.writeText).not.toHaveBeenCalled()
        expect((component as any).snackBarHelperService.open).not.toHaveBeenCalled()
    })

    it('should handle unavailable clipboard gracefully', async () => {
        const codeTag = appendCodeToFixture('javascript:alert(`xss`)')

        Object.defineProperty(navigator, 'clipboard', { value: undefined, writable: true })
        vi.spyOn((component as any).snackBarHelperService, 'open')

        component.copyPayload({ target: codeTag } as unknown as MouseEvent)
        fixture.detectChanges()
        await fixture.whenStable()

        expect((component as any).snackBarHelperService.open).not.toHaveBeenCalled()
    })

    describe('dependency helpers', () => {
        it('isDependencyMissing should return false when ChallengeDependencies is missing', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge })
            fixture.detectChanges()
            expect(component.isDependencyMissing('Requires Foo')).toBe(false)
        })

        it('isDependencyMissing should return true when dependency is marked missing', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                ChallengeDependencies: [{ name: 'Foo', missing: true, documentation: null }]
            })
            fixture.detectChanges()
            expect(component.isDependencyMissing('Requires Foo')).toBe(true)
        })

        it('isDependencyMissing should return false when dependency exists but is not missing', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                ChallengeDependencies: [{ name: 'Foo', missing: false, documentation: null }]
            })
            fixture.detectChanges()
            expect(component.isDependencyMissing('Requires Foo')).toBe(false)
        })

        it('getDependencyDocumentation should return null when ChallengeDependencies is missing', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge })
            fixture.detectChanges()
            expect(component.getDependencyDocumentation('Requires Foo')).toBeNull()
        })

        it('getDependencyDocumentation should return the documentation URL when present', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                ChallengeDependencies: [{ name: 'Foo', missing: true, documentation: 'http://docs.example.com' }]
            })
            fixture.detectChanges()
            expect(component.getDependencyDocumentation('Requires Foo')).toBe('http://docs.example.com')
        })

        it('getDependencyDocumentation should return null when dependency is not found', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                ChallengeDependencies: [{ name: 'Bar', missing: true, documentation: 'http://docs.example.com' }]
            })
            fixture.detectChanges()
            expect(component.getDependencyDocumentation('Requires Foo')).toBeNull()
        })

        it('getDependency should return null when ChallengeDependencies is missing', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge })
            fixture.detectChanges()
            expect(component.getDependency('Requires Foo')).toBeNull()
        })

        it('getDependency should return the matching dependency entry', () => {
            const dep = { name: 'Foo', missing: true, documentation: 'doc' }
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                ChallengeDependencies: [dep]
            })
            fixture.detectChanges()
            expect(component.getDependency('Requires Foo')).toEqual(dep)
        })

        it('getDependency should return undefined when no dependency name matches', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                ChallengeDependencies: [{ name: 'Bar', missing: false, documentation: null }]
            })
            fixture.detectChanges()
            expect(component.getDependency('Requires Foo')).toBeUndefined()
        })
    })

    describe('hint tooltip effect', () => {
        it('should trigger hintTooltip.show when hintsUnlocked changes for last unlocked challenge', async () => {
            vi.useFakeTimers()
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, key: 'k1', hintsUnlocked: 0 })
            fixture.componentRef.setInput('lastUnlockedChallengeKey', 'k1')
            fixture.detectChanges()

            const tooltip = component.hintTooltip()
            const showSpy = tooltip ? vi.spyOn(tooltip, 'show') : null

            fixture.componentRef.setInput('challenge', { ...defaultChallenge, key: 'k1', hintsUnlocked: 1 })
            fixture.detectChanges()

            await Promise.resolve()
            vi.advanceTimersByTime(100)

            if (showSpy) {
                expect(showSpy).toHaveBeenCalled()
            }
            vi.useRealTimers()
        })
    })

    describe('default async hooks', () => {
        it('should expose noop defaults for hasInstructions and startHackingInstructorFor', async () => {
            expect(component.hasInstructions('anything')).toBe(false)
            await expect(component.startHackingInstructorFor('anything')).resolves.toBeUndefined()
        })
    })

    describe('template rendering', () => {
        it('should render category, name and description', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, category: 'XSS', name: 'Reflected XSS', description: '<b>boom</b>' })
            fixture.detectChanges()
            const compiled: HTMLElement = fixture.nativeElement
            expect(compiled.querySelector('.category-row')?.textContent).toContain('XSS')
            expect(compiled.querySelector('.name')?.textContent).toContain('Reflected XSS')
            expect(compiled.querySelector('.description-row')?.innerHTML).toContain('<b>boom</b>')
        })

        it('should render a plain tag for non-dependency tags', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, tagList: ['Easy'] })
            fixture.detectChanges()
            const tag = (fixture.nativeElement as HTMLElement).querySelector('.tags .tag')
            expect(tag).toBeTruthy()
            expect(tag?.classList.contains('tag-missing-dependency')).toBe(false)
            expect(tag?.classList.contains('tag-available-dependency')).toBe(false)
        })

        it('should render a missing-dependency tag when dependency is missing', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                tagList: ['Requires Foo'],
                ChallengeDependencies: [{ name: 'Foo', missing: true, documentation: 'http://docs.example.com' }]
            })
            fixture.detectChanges()
            const tag = (fixture.nativeElement as HTMLElement).querySelector('.tag-missing-dependency') as HTMLAnchorElement
            expect(tag).toBeTruthy()
            expect(tag.getAttribute('href')).toBe('http://docs.example.com')
            expect(tag.querySelector('mat-icon')?.textContent).toContain('extension_off')
        })

        it('should render an available-dependency tag when dependency is present', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                tagList: ['Requires Foo'],
                ChallengeDependencies: [{ name: 'Foo', missing: false, documentation: null }]
            })
            fixture.detectChanges()
            const tag = (fixture.nativeElement as HTMLElement).querySelector('.tag-available-dependency')
            expect(tag).toBeTruthy()
            expect(tag?.querySelector('mat-icon')?.textContent).toContain('extension')
        })

        it('should render a warning badge when challenge is disabled by environment', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, disabledEnv: 'docker' })
            fixture.detectChanges()
            const badges = (fixture.nativeElement as HTMLElement).querySelectorAll('.badge-group .badge')
            const infoBadge = Array.from(badges).find((b) => b.querySelector('mat-icon')?.textContent?.includes('info_outline'))
            expect(infoBadge).toBeTruthy()
        })

        it('should render a safety-mode badge when challenge is disabled by safetyMode', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, disabledEnv: 'safetyMode' })
            fixture.detectChanges()
            const badges = (fixture.nativeElement as HTMLElement).querySelectorAll('.badge-group .badge')
            expect(badges.length).toBeGreaterThan(0)
        })

        it('should render the coding-challenge badge with status when applicable', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                key: 'k1',
                hasCodingChallenge: true,
                solved: true,
                codingChallengeStatus: 1
            })
            fixture.detectChanges()
            const codingBadge = (fixture.nativeElement as HTMLElement).querySelector('.badge.not-completable .badge-status')
            expect(codingBadge?.textContent).toContain('1/2')
            const completed = (fixture.nativeElement as HTMLElement).querySelector('.badge.partially-completed')
            expect(completed).toBeTruthy()
        })

        it('should not render the coding-challenge badge when codingChallengesEnabled is "never"', () => {
            fixture.componentRef.setInput('applicationConfiguration', {
                ...defaultAppConfig,
                challenges: { codingChallengesEnabled: 'never' }
            })
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, hasCodingChallenge: true, solved: true })
            fixture.detectChanges()
            const badge = (fixture.nativeElement as HTMLElement).querySelector('.badge.not-completable [routerLink]')
            expect(badge).toBeFalsy()
        })

        it('should render the repeat-flag badge for solved challenges in CTF mode', () => {
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, key: 'k1', solved: true })
            fixture.detectChanges()
            const flag = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('mat-icon'))
                .find((el) => el.textContent?.includes('flag_outline'))
            expect(flag).toBeTruthy()
        })

        it('should not render the repeat-flag badge when CTF flags-in-notifications is disabled', () => {
            fixture.componentRef.setInput('applicationConfiguration', {
                ...defaultAppConfig,
                ctf: { showFlagsInNotifications: false }
            })
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, key: 'k1', solved: true })
            fixture.detectChanges()
            const flag = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('mat-icon'))
                .find((el) => el.textContent?.includes('flag_outline'))
            expect(flag).toBeFalsy()
        })

        it('should render the hacking-instructor badge when hasInstructions returns true', () => {
            component.hasInstructions = () => true
            fixture.componentRef.setInput('challenge', { ...defaultChallenge, name: 'X' })
            fixture.detectChanges()
            const school = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('mat-icon'))
                .find((el) => el.textContent?.includes('school_outline'))
            expect(school).toBeTruthy()
        })

        it('should render the hint badge with counts and lightbulb icon when hints are available', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                key: 'k1',
                hintsAvailable: 3,
                hintsUnlocked: 1,
                hintText: 'hint',
                nextHint: 7
            })
            fixture.detectChanges()
            const hintBadge = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.badge'))
                .find((b) => b.textContent?.includes('1/3'))
            expect(hintBadge).toBeTruthy()
            expect(hintBadge?.querySelector('mat-icon')?.textContent).toContain('lightbulb_outlined')
        })

        it('should disable the hint badge and show solid lightbulb when no next hint is available', () => {
            fixture.componentRef.setInput('challenge', {
                ...defaultChallenge,
                key: 'k1',
                hintsAvailable: 3,
                hintsUnlocked: 3,
                hintText: 'hint',
                nextHint: null
            })
            fixture.detectChanges()
            const hintBadge = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.badge'))
                .find((b) => b.textContent?.includes('3/3')) as HTMLButtonElement | undefined
            expect(hintBadge).toBeTruthy()
            expect(hintBadge?.disabled).toBe(true)
            expect(hintBadge?.querySelector('mat-icon')?.textContent?.trim()).toBe('lightbulb')
        })
    })
})
