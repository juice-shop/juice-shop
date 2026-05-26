import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { TutorialModeWarningComponent } from './tutorial-mode-warning.component'
import { TranslateModule } from '@ngx-translate/core'

describe('TutorialModeWarningComponent', () => {
    let component: TutorialModeWarningComponent
    let fixture: ComponentFixture<TutorialModeWarningComponent>

    const defaultChallenges = [
        {
            category: 'foobar',
            name: 'my name',
            tutorialOrder: 1,
            solved: false
        },
        {
            category: 'foobar',
            name: 'my name two',
            description: 'lorem ipsum',
            tutorialOrder: null,
            solved: false
        }
    ] as any

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), TutorialModeWarningComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(TutorialModeWarningComponent)
        component = fixture.componentInstance

        fixture.componentRef.setInput('allChallenges', defaultChallenges)
        fixture.componentRef.setInput('applicationConfig', {
            challenges: { restrictToTutorialsFirst: true }
        } as any)

        fixture.detectChanges()
    })

    it('should show warning when there are configured and unsolved tutorial challenges exist', () => {
        expect(component.tutorialModeActive()).toBe(true)
    })

    it('not show if tutorial is not configured', () => {
        fixture.componentRef.setInput('applicationConfig', {
            challenges: { restrictToTutorialsFirst: false }
        } as any)
        expect(component.tutorialModeActive()).toBe(false)
    })

    it('should not show warning when all tutorial mode challenges are solved', () => {
        fixture.componentRef.setInput('allChallenges', [
            {
                category: 'foobar',
                name: 'my name',
                tutorialOrder: 1,
                solved: true
            },
            {
                category: 'foobar',
                name: 'my name two',
                description: 'lorem ipsum',
                tutorialOrder: null,
                solved: false
            }
        ] as any)
        expect(component.tutorialModeActive()).toBe(false)
    })
})
