import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { PasswordStrengthInfoComponent } from './password-strength-info.component'

function createPasswordComponentStub (overrides: Partial<any> = {}): any {
    return {
        minLength: 8,
        containAtLeastOneLowerCaseLetter: false,
        containAtLeastOneUpperCaseLetter: false,
        containAtLeastOneDigit: false,
        containAtLeastOneSpecialChar: false,
        containAtLeastMinChars: false,
        ...overrides
    }
}

describe('PasswordStrengthInfoComponent', () => {
    let component: PasswordStrengthInfoComponent
    let fixture: ComponentFixture<PasswordStrengthInfoComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PasswordStrengthInfoComponent]
        })
            .compileComponents()

        fixture = TestBed.createComponent(PasswordStrengthInfoComponent)
        component = fixture.componentInstance
        component.passwordComponent = createPasswordComponentStub()
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('minCharsCriteriaMsg fallback', () => {
        it('should default to a message derived from the password component\'s minLength when no message is provided', () => {
            component.minCharsCriteriaMsg = undefined as any
            component.passwordComponent = createPasswordComponentStub({ minLength: 12 })
            component.ngOnInit()
            expect(component.minCharsCriteriaMsg).toBe('contains at least 12 characters')
        })

        it('should preserve a custom message when one is provided via @Input', () => {
            component.minCharsCriteriaMsg = 'custom min chars message'
            component.ngOnInit()
            expect(component.minCharsCriteriaMsg).toBe('custom min chars message')
        })
    })

    describe('template rendering', () => {
        function rerenderWith (stub: any): void {
            component.passwordComponent = stub
            fixture.detectChanges()
        }

        it('should render error icons for every criterion when none of them are met', () => {
            rerenderWith(createPasswordComponentStub())
            const icons = (fixture.nativeElement as HTMLElement).querySelectorAll('mat-icon')
            expect(icons.length).toBe(5)
            icons.forEach(icon => {
                expect(icon.getAttribute('color')).toBe('error')
            })
        })

        it('should render success icons for every criterion when all of them are met', () => {
            rerenderWith(createPasswordComponentStub({
                containAtLeastOneLowerCaseLetter: true,
                containAtLeastOneUpperCaseLetter: true,
                containAtLeastOneDigit: true,
                containAtLeastOneSpecialChar: true,
                containAtLeastMinChars: true
            }))
            const icons = (fixture.nativeElement as HTMLElement).querySelectorAll('mat-icon')
            expect(icons.length).toBe(5)
            icons.forEach(icon => {
                expect(icon.getAttribute('color')).toBe('primary')
            })
        })

        it('should mix success and error icons based on which criteria are currently met', () => {
            rerenderWith(createPasswordComponentStub({
                containAtLeastOneLowerCaseLetter: true,
                containAtLeastOneDigit: true,
                containAtLeastMinChars: true
            }))
            const icons = (fixture.nativeElement as HTMLElement).querySelectorAll('mat-icon')
            const colors = Array.from(icons).map(i => i.getAttribute('color'))
            expect(colors).toEqual(['primary', 'error', 'primary', 'error', 'primary'])
        })

        it('should display the criterion labels next to their icons', () => {
            component.lowerCaseCriteriaMsg = 'lower'
            component.upperCaseCriteriaMsg = 'upper'
            component.digitsCriteriaMsg = 'digit'
            component.specialCharsCriteriaMsg = 'special'
            component.minCharsCriteriaMsg = 'min'
            fixture.detectChanges()
            const text = (fixture.nativeElement as HTMLElement).textContent ?? ''
            expect(text).toContain('lower')
            expect(text).toContain('upper')
            expect(text).toContain('digit')
            expect(text).toContain('special')
            expect(text).toContain('min')
        })
    })
})
