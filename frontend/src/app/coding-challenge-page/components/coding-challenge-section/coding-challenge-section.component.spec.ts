/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { TranslateModule } from '@ngx-translate/core'

import { CodingChallengeSectionComponent } from './coding-challenge-section.component'
import { ResultState } from '../../coding-challenge.types'

describe('CodingChallengeSectionComponent', () => {
    let component: CodingChallengeSectionComponent
    let fixture: ComponentFixture<CodingChallengeSectionComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                TranslateModule.forRoot(),
                CodingChallengeSectionComponent
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(CodingChallengeSectionComponent)
        component = fixture.componentInstance
        fixture.componentRef.setInput('title', 'TAB_FIND_IT')
        fixture.componentRef.setInput('description', 'DESCRIPTION_FIND_IT')
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('result icon is "send" when undecided', () => {
        fixture.componentRef.setInput('result', ResultState.Undecided)
        expect(component.resultIcon()).toBe('send')
    })

    it('result icon is "check" when right', () => {
        fixture.componentRef.setInput('result', ResultState.Right)
        expect(component.resultIcon()).toBe('check')
    })

    it('result icon is "clear" when wrong', () => {
        fixture.componentRef.setInput('result', ResultState.Wrong)
        expect(component.resultIcon()).toBe('clear')
    })

    it('should show solved indicator when solved', () => {
        fixture.componentRef.setInput('solved', true)
        fixture.detectChanges()
        const indicator = fixture.nativeElement.querySelector('.solved-indicator')
        expect(indicator).not.toBeNull()
    })

    it('should not show solved indicator when not solved', () => {
        fixture.componentRef.setInput('solved', false)
        fixture.detectChanges()
        const indicator = fixture.nativeElement.querySelector('.solved-indicator')
        expect(indicator).toBeNull()
    })

    it('should disable button when submitDisabled is true', () => {
        fixture.componentRef.setInput('submitDisabled', true)
        fixture.detectChanges()
        const button = fixture.nativeElement.querySelector('button')
        expect(button.disabled).toBe(true)
    })

    it('should emit submitClicked on button click', () => {
        fixture.componentRef.setInput('submitDisabled', false)
        fixture.detectChanges()
        vi.spyOn(component.submitClicked, 'emit')
        const button = fixture.nativeElement.querySelector('button')
        button.click()
        expect(component.submitClicked.emit).toHaveBeenCalled()
    })

    it('should enable button when submitDisabled is false', () => {
        fixture.componentRef.setInput('submitDisabled', false)
        fixture.detectChanges()
        const button = fixture.nativeElement.querySelector('button')
        expect(button.disabled).toBe(false)
    })

    it('should apply shake class when shaking is true', () => {
        fixture.componentRef.setInput('shaking', true)
        fixture.detectChanges()
        const button = fixture.nativeElement.querySelector('button')
        expect(button.classList.contains('shake')).toBe(true)
    })

    it('should not apply shake class when shaking is false', () => {
        fixture.componentRef.setInput('shaking', false)
        fixture.detectChanges()
        const button = fixture.nativeElement.querySelector('button')
        expect(button.classList.contains('shake')).toBe(false)
    })

    it('should emit shakingDone on animationend event', () => {
        fixture.componentRef.setInput('shaking', true)
        fixture.detectChanges()
        vi.spyOn(component.shakingDone, 'emit')
        const button = fixture.nativeElement.querySelector('button')
        button.dispatchEvent(new Event('animationend'))
        expect(component.shakingDone.emit).toHaveBeenCalled()
    })

    it('should apply result-icon-wrong class when result is Wrong', () => {
        fixture.componentRef.setInput('result', ResultState.Wrong)
        fixture.detectChanges()
        const icon = fixture.nativeElement.querySelector('mat-icon.result-icon-wrong')
        expect(icon).not.toBeNull()
    })

    it('should not apply result-icon-wrong class when result is Right', () => {
        fixture.componentRef.setInput('result', ResultState.Right)
        fixture.detectChanges()
        const icon = fixture.nativeElement.querySelector('mat-icon.result-icon-wrong')
        expect(icon).toBeNull()
    })
})
