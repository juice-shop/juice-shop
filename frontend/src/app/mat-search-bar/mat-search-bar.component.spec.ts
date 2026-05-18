/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { MatSearchBarComponent } from './mat-search-bar.component'

describe('MatSearchBarComponent', () => {
    let component: MatSearchBarComponent
    let fixture: ComponentFixture<MatSearchBarComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatSearchBarComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(MatSearchBarComponent)
        component = fixture.componentInstance
        fixture.detectChanges()

        fixture.componentRef.setInput('alwaysOpen', false)
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should focus input on opening the search', () => {
        vi.spyOn(component.onOpen, 'emit')
        component.open()
        expect(component.searchVisible).toBe(true)
        expect(component.onOpen.emit).toHaveBeenCalled()
        fixture.detectChanges()
        expect(document.activeElement).toBe(component.inputElement().nativeElement)
    })

    it('should add search-expanded class to host when search is visible', () => {
        component.searchVisible = true
        fixture.detectChanges()
        expect(fixture.nativeElement.classList.contains('search-expanded')).toBe(true)
    })

    it('should not have search-expanded class when search is hidden', () => {
        component.searchVisible = false
        fixture.detectChanges()
        expect(fixture.nativeElement.classList.contains('search-expanded')).toBe(false)
    })

    it('should show the search toggle button when search is not visible', () => {
        component.searchVisible = false
        fixture.detectChanges()
        const toggle = fixture.nativeElement.querySelector('.search-toggle')
        expect(toggle).toBeTruthy()
    })

    it('should hide the search toggle button when search is visible', () => {
        component.searchVisible = true
        fixture.detectChanges()
        const toggle = fixture.nativeElement.querySelector('.search-toggle')
        expect(toggle).toBeNull()
    })

    it('should apply search-container--visible class when search is open', () => {
        component.searchVisible = true
        fixture.detectChanges()
        const container = fixture.nativeElement.querySelector('.search-container')
        expect(container.classList.contains('search-container--visible')).toBe(true)
    })

    it('should not apply search-container--visible class when search is closed', () => {
        component.searchVisible = false
        fixture.detectChanges()
        const container = fixture.nativeElement.querySelector('.search-container')
        expect(container.classList.contains('search-container--visible')).toBe(false)
    })

    it('should set tabindex to -1 on input and close button when search is hidden', () => {
        component.searchVisible = false
        fixture.detectChanges()
        const input = fixture.nativeElement.querySelector('input')
        const closeBtn = fixture.nativeElement.querySelector('.search-close')
        expect(input.getAttribute('tabindex')).toBe('-1')
        expect(closeBtn.getAttribute('tabindex')).toBe('-1')
    })

    it('should set tabindex to 0 on input and close button when search is visible', () => {
        component.searchVisible = true
        fixture.detectChanges()
        const input = fixture.nativeElement.querySelector('input')
        const closeBtn = fixture.nativeElement.querySelector('.search-close')
        expect(input.getAttribute('tabindex')).toBe('0')
        expect(closeBtn.getAttribute('tabindex')).toBe('0')
    })

    it('should open search when toggle button is clicked', () => {
        component.searchVisible = false
        fixture.detectChanges()
        const toggle = fixture.nativeElement.querySelector('.search-toggle')
        toggle.click()
        fixture.detectChanges()
        expect(component.searchVisible).toBe(true)
    })

    it('should clear value on closing the search', () => {
        vi.spyOn(component.onClose, 'emit')
        component.value = 'test'
        component.searchVisible = true
        component.close()
        expect(component.searchVisible).toBe(false)
        expect(component.value).toBe('')
        expect(component.onClose.emit).toHaveBeenCalled()
    })

    it('should not close the search when set to be always open', () => {
        vi.spyOn(component.onClose, 'emit')
        fixture.componentRef.setInput('alwaysOpen', true)
        component.searchVisible = true
        component.value = 'test'
        component.close()
        expect(component.searchVisible).toBe(true)
        expect(component.value).toBe('')
        expect(component.onClose.emit).toHaveBeenCalled()
    })

    it('should open search by default when set to be always open', () => {
        fixture.componentRef.setInput('alwaysOpen', true)
        component.searchVisible = false
        component.ngOnInit()
        expect(component.searchVisible).toBe(true)
    })

    it('should hide search on blur when value is empty', () => {
        vi.spyOn(component.onBlur, 'emit')
        component.searchVisible = true
        component.onBlurring('')
        expect(component.onBlur.emit).toHaveBeenCalledWith('')
        expect(component.searchVisible).toBe(false)
    })

    it('should keep search visible on blur if set to be always open', () => {
        vi.spyOn(component.onBlur, 'emit')
        fixture.componentRef.setInput('alwaysOpen', true)
        component.searchVisible = true
        component.onBlurring('')
        expect(component.onBlur.emit).toHaveBeenCalledWith('')
        expect(component.searchVisible).toBe(true)
    })

    it('should emit provided value when enterring', () => {
        vi.spyOn(component.onEnter, 'emit')
        component.onEnterring('query')
        expect(component.onEnter.emit).toHaveBeenCalledWith('query')
    })

    it('should emit provided value when focussing', () => {
        vi.spyOn(component.onFocus, 'emit')
        component.onFocussing('query')
        expect(component.onFocus.emit).toHaveBeenCalledWith('query')
    })
})
