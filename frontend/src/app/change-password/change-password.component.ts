/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { UserService } from '../Services/user.service'
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core'
import { form, FormField, FormRoot, maxLength, minLength, required, validate } from '@angular/forms/signals'
import { firstValueFrom } from 'rxjs'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { faEdit } from '@fortawesome/free-regular-svg-icons'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { MatButtonModule } from '@angular/material/button'

import { MatInputModule } from '@angular/material/input'
import {
  MatFormFieldModule,
  MatLabel,
  MatError,
  MatHint
} from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

library.add(faSave, faEdit)

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [
    MatCardModule,
    TranslateModule,
    MatFormFieldModule,
    MatLabel,
    MatInputModule,
    FormRoot,
    FormField,
    MatError,
    MatHint,
    MatButtonModule
  ]
})
export class ChangePasswordComponent {
  private readonly userService = inject(UserService)
  private readonly translate = inject(TranslateService)

  private readonly initialModel = {
    currentPassword: '',
    newPassword: '',
    repeatNewPassword: ''
  }

  public readonly changePasswordModel = signal({ ...this.initialModel })

  public readonly error = signal<string | undefined>(undefined)
  public readonly confirmation = signal<string | undefined>(undefined)

  public readonly changePasswordForm = form(this.changePasswordModel, (s) => {
    required(s.currentPassword)
    required(s.newPassword)
    minLength(s.newPassword, 5)
    maxLength(s.newPassword, 40)
    required(s.repeatNewPassword)
    minLength(s.repeatNewPassword, 5)
    maxLength(s.repeatNewPassword, 40)
    validate(s.repeatNewPassword, ({ value, valueOf }) => {
      if (value() !== valueOf(s.newPassword)) {
        return { kind: 'notSame' }
      }
      return undefined
    })
  }, {
    submission: {
      action: () => this.changePassword()
    }
  })

  public readonly isPristine = computed(() =>
    !this.changePasswordForm.currentPassword().dirty() &&
    !this.changePasswordForm.newPassword().dirty() &&
    !this.changePasswordForm.repeatNewPassword().dirty()
  )

  private async changePassword (): Promise<void> {
    const { currentPassword, newPassword, repeatNewPassword } = this.changePasswordModel()
    if (
      localStorage.getItem('email')?.match(/support@.*/) &&
      !newPassword.match(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,30}/
      )
    ) {
      console.error(
        'Parola echipei de asistență nu respectă politica corporativă pentru conturile privilegiate! Vă rugăm să schimbați parola în consecință!'
      )
    }
    try {
      await firstValueFrom(
        this.userService.changePassword({
          current: currentPassword,
          new: newPassword,
          repeat: repeatNewPassword
        })
      )
      this.error.set(undefined)
      this.confirmation.set(await this.passwordChangedConfirmation())
      this.resetForm()
    } catch (err: any) {
      console.log(err)
      this.error.set(err)
      this.confirmation.set(undefined)
      this.resetErrorForm()
    }
  }

  resetForm () {
    this.changePasswordForm().reset({ ...this.initialModel })
  }

  resetErrorForm () {
    this.changePasswordForm.currentPassword().reset()
    this.changePasswordForm.newPassword().reset('')
    this.changePasswordForm.repeatNewPassword().reset('')
  }

  private async passwordChangedConfirmation (): Promise<string | undefined> {
    try {
      return await firstValueFrom(this.translate.get('PASSWORD_SUCCESSFULLY_CHANGED'))
    } catch (translationId) {
      return translationId as string
    }
  }
}
