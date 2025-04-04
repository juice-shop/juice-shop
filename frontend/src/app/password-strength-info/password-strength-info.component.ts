/*
 * Copyright (c) 2014-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Component, Input, OnInit } from '@angular/core'
import { PasswordStrengthComponent } from '../password-strength/password-strength.component'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-password-strength-info',
  imports: [MatCardModule, MatIconModule],
  templateUrl: './password-strength-info.component.html',
  styleUrl: './password-strength-info.component.scss'
})
export class PasswordStrengthInfoComponent implements OnInit {
  @Input()
    passwordComponent: PasswordStrengthComponent

  @Input()
    enableScoreInfo = false

  @Input()
    lowerCaseCriteriaMsg = 'contains at least one lower character'

  @Input()
    upperCaseCriteriaMsg = 'contains at least one upper character'

  @Input()
    digitsCriteriaMsg = 'contains at least one digit character'

  @Input()
    specialCharsCriteriaMsg = 'contains at least one special character'

  @Input()
    minCharsCriteriaMsg: string

  ngOnInit (): void {
    if (!this.minCharsCriteriaMsg) {
      this.minCharsCriteriaMsg = `contains at least ${this.passwordComponent.minLength} characters`
    }
  }
}
