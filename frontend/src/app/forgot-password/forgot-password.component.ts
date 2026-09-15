/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserService } from '../Services/user.service'
import { SecurityQuestionService } from '../Services/security-question.service'
import { disabled, email, form, FormField, FormRoot, minLength, required, validate } from '@angular/forms/signals'
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { type SecurityQuestion } from '../Models/securityQuestion.model'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'
import { PasswordStrengthComponent } from '../password-strength/password-strength.component'
import { PasswordStrengthInfoComponent } from '../password-strength-info/password-strength-info.component'
import { MatSlideToggle } from '@angular/material/slide-toggle'

import { MatTooltip } from '@angular/material/tooltip'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatSuffix, MatError, MatHint } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

library.add(faSave, faEdit)

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, FormRoot, FormField, MatIconModule, MatSuffix, MatTooltip, MatError, MatHint, MatSlideToggle, PasswordStrengthComponent, PasswordStrengthInfoComponent, MatButtonModule]
})
export class ForgotPasswordComponent {
  private readonly securityQuestionService = inject(SecurityQuestionService)
  private readonly userService = inject(UserService)
  private readonly translate = inject(TranslateService)

  private readonly initialModel = {
    email: '',
    securityQuestion: '',
    password: '',
    repeatPassword: ''
  }

  public readonly forgotPasswordModel = signal({ ...this.initialModel })

  public readonly securityQuestion = signal<string | undefined>(undefined)
  public readonly error = signal<string | undefined>(undefined)
  public readonly confirmation = signal<string | undefined>(undefined)
  public readonly timeoutDuration = 1000
  private timeout: ReturnType<typeof setTimeout> | undefined

  public readonly forgotPasswordForm = form(this.forgotPasswordModel, (s) => {
    required(s.email)
    email(s.email)
    disabled(s.securityQuestion, { when: () => !this.securityQuestion() })
    required(s.securityQuestion)
    disabled(s.password, { when: () => !this.securityQuestion() })
    required(s.password)
    minLength(s.password, 5)
    disabled(s.repeatPassword, { when: () => !this.securityQuestion() })
    required(s.repeatPassword)
    validate(s.repeatPassword, ({ value, valueOf }) => {
      if (value() && value() !== valueOf(s.password)) {
        return { kind: 'notSame' }
      }
      return undefined
    })
  }, {
    submission: {
      action: () => this.changePassword()
    }
  })

  findSecurityQuestion () {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.securityQuestion.set(undefined)
      const email = this.forgotPasswordModel().email
      if (!email) {
        return
      }
      this.securityQuestionService.findBy(email).subscribe({
        next: (securityQuestion: SecurityQuestion) => {
          if (securityQuestion) {
            this.securityQuestion.set(securityQuestion.question)
          }
        },
        error: () => undefined
      })
    }, this.timeoutDuration)
  }

  private async changePassword () {
    const { email, securityQuestion, password, repeatPassword } = this.forgotPasswordModel()
    try {
      await firstValueFrom(this.userService.resetPassword({
        email,
        answer: securityQuestion,
        new: password,
        repeat: repeatPassword
      }))
      this.error.set(undefined)
      this.confirmation.set(await this.passwordChangedConfirmation())
      this.resetForm()
    } catch (err: any) {
      this.error.set(err?.error)
      this.confirmation.set(undefined)
      this.resetErrorForm()
    }
  }

  resetForm () {
    this.forgotPasswordForm().reset({ ...this.initialModel })
    // drop the looked-up question so the form returns to its initial state
    this.securityQuestion.set(undefined)
  }

  resetErrorForm () {
    this.forgotPasswordForm.email().reset()
    this.forgotPasswordForm.securityQuestion().reset('')
    this.forgotPasswordForm.password().reset('')
    this.forgotPasswordForm.repeatPassword().reset('')
  }

  private async passwordChangedConfirmation (): Promise<string> {
    try {
      return await firstValueFrom(this.translate.get('PASSWORD_SUCCESSFULLY_CHANGED'))
    } catch (translationId) {
      return translationId as string
    }
  }
}
