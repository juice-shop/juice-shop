/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { NgClass } from '@angular/common'
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { MatProgressBarModule } from '@angular/material/progress-bar'

@Component({
  selector: 'app-password-strength',
  imports: [MatProgressBarModule, NgClass],
  templateUrl: './password-strength.component.html',
  styleUrl: './password-strength.component.scss'
})

export class PasswordStrengthComponent implements OnChanges {
  @Input() password: string = ''
  passwordStrength: number = 0
  minLength: number = 8

  private readonly ranges = ['low', 'low-medium', 'medium', 'high-medium', 'high']

  ngOnChanges (changes: SimpleChanges): void {
    if (changes.password) {
      this.passwordStrength = this.calculatePasswordStrength(this.password)
    }
  }

  private calculatePasswordStrength (password: string): number {
    const checks = [
      this.containAtLeastMinChars,
      this.containAtLeastOneLowerCaseLetter,
      this.containAtLeastOneUpperCaseLetter,
      this.containAtLeastOneDigit,
      this.containAtLeastOneSpecialChar
    ]

    return checks.filter(x => x).length / checks.length * 100 // calculate percentage of checks passed
  }

  get progressColor (): string {
    return this.ranges[Math.max(Math.floor(this.passwordStrength / (100 / this.ranges.length)) - 1, 0)] // map passwordStrength to value within ranges.length
  }

  get containAtLeastMinChars (): boolean {
    return this.password.length >= 8
  }

  get containAtLeastOneLowerCaseLetter (): boolean {
    return /^(?=.*?[a-z])/.test(this.password)
  }

  get containAtLeastOneUpperCaseLetter (): boolean {
    return /^(?=.*?[A-Z])/.test(this.password)
  }

  get containAtLeastOneDigit (): boolean {
    return /^(?=.*?[0-9])/.test(this.password)
  }

  get containAtLeastOneSpecialChar (): boolean {
    return /^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/.test(this.password)
  }
}
