/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'

import { PasswordStrengthComponent } from './password-strength.component'

describe('PasswordStrengthComponent', () => {
  let component: PasswordStrengthComponent
  let fixture: ComponentFixture<PasswordStrengthComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordStrengthComponent]
    }).compileComponents()

    fixture = TestBed.createComponent(PasswordStrengthComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should render mat-progress-bar', () => {
    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar')
    expect(progressBar).toBeTruthy()
  })

  it('should bind progress input to mat-progress-bar value', () => {
    component.passwordStrength = 50
    fixture.detectChanges()

    const progressBarDebug =
      fixture.debugElement.nativeElement.querySelector('mat-progress-bar')
    expect(progressBarDebug).toBeTruthy()

    const matProgressBarInstance = fixture.debugElement.children.find(
      (el) => el.nativeElement.tagName.toLowerCase() === 'mat-progress-bar'
    )?.componentInstance

    expect(matProgressBarInstance.value).toBe(50)
  })

  it('should apply correct class based on progress value', () => {
    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar')

    component.passwordStrength = 0
    fixture.detectChanges()
    expect(progressBar.classList).toContain('low')

    component.passwordStrength = 20
    fixture.detectChanges()
    expect(progressBar.classList).toContain('low')

    component.passwordStrength = 40
    fixture.detectChanges()
    expect(progressBar.classList).toContain('low-medium')

    component.passwordStrength = 60
    fixture.detectChanges()
    expect(progressBar.classList).toContain('medium')

    component.passwordStrength = 80
    fixture.detectChanges()
    expect(progressBar.classList).toContain('high-medium')

    component.passwordStrength = 100
    fixture.detectChanges()
    expect(progressBar.classList).toContain('high')
  })

  it('should have correct ARIA attributes for accessibility', () => {
    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar')
    expect(progressBar.getAttribute('role')).toBe('progressbar')
    expect(progressBar.getAttribute('aria-valuemin')).toBe('0')
    expect(progressBar.getAttribute('aria-valuemax')).toBe('100')
  })

  it('should update aria-valuenow based on progress value', () => {
    component.passwordStrength = 45
    fixture.detectChanges()
    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar')
    expect(progressBar.getAttribute('aria-valuenow')).toBe('45')
  })
})
