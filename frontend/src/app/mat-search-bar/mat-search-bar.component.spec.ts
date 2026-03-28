import type { Mock } from "vitest"
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

        component.inputElement = { nativeElement: { focus: vi.fn() } } as any
        component.alwaysOpen = false
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    it('should have disabled state when search is not visible', () => {
        component.searchVisible = false
        expect(component.isDisabled).toBe('disabled')
    })

    it('should be enabled when search is visible', () => {
        component.searchVisible = true
        expect(component.isDisabled).toBeNull()
    })

    it('should focus input on opening the search', () => {
        vi.spyOn(component.onOpen, 'emit')
        component.open()
        expect(component.searchVisible).toBe(true)
        expect((component.inputElement.nativeElement.focus as Mock)).toHaveBeenCalled()
        expect(component.onOpen.emit).toHaveBeenCalled()
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
        component.alwaysOpen = true
        component.searchVisible = true
        component.close()
        expect(component.searchVisible).toBe(true)
        expect(component.onClose.emit).toHaveBeenCalled()
    })

    it('should open search by default when set to be always open', () => {
        component.alwaysOpen = true
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
        component.alwaysOpen = true
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
