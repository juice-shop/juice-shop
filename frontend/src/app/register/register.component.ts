/*
 * Copyright (c) 2014-2026 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { SecurityAnswerService } from '../Services/security-answer.service'
import { UserService } from '../Services/user.service'
import { type AbstractControl, UntypedFormControl, Validators, FormsModule, ReactiveFormsModule, ValidatorFn } from '@angular/forms'
import { Component, NgZone, type OnInit, inject } from '@angular/core'
import { SecurityQuestionService } from '../Services/security-question.service'
import { Router, RouterLink } from '@angular/router'
import { library } from '@fortawesome/fontawesome-svg-core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { faExclamationCircle, faUserPlus } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { type SecurityQuestion } from '../Models/securityQuestion.model'
import { MatButtonModule } from '@angular/material/button'
import { MatOption } from '@angular/material/core'
import { MatSelectModule } from '@angular/material/select'
import { PasswordStrengthComponent } from '../password-strength/password-strength.component'
import { PasswordStrengthInfoComponent } from '../password-strength-info/password-strength-info.component'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatError, MatHint } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'

library.add(faUserPlus, faExclamationCircle)

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    MatCardModule, TranslateModule, MatFormFieldModule, MatLabel, MatInputModule, 
    FormsModule, ReactiveFormsModule, MatError, MatHint, MatSlideToggleModule, 
    PasswordStrengthComponent, PasswordStrengthInfoComponent, MatSelectModule, 
    MatOption, MatButtonModule, RouterLink, MatIconModule
  ]
})
export class RegisterComponent implements OnInit {
  private readonly securityQuestionService = inject(SecurityQuestionService);
  private readonly userService = inject(UserService);
  private readonly securityAnswerService = inject(SecurityAnswerService);
  private readonly router = inject(Router);
  private readonly formSubmitService = inject(FormSubmitService);
  private readonly snackBarHelperService = inject(SnackBarHelperService);
  private readonly ngZone = inject(NgZone);

  public emailControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.email])
  public passwordControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(40)])
  public repeatPasswordControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityQuestionControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityAnswerControl: UntypedFormControl = new UntypedFormControl('', [Validators.required])
  public securityQuestions!: SecurityQuestion[]
  public selected?: number
  public error: string | null = null

  ngOnInit (): void {
    // Correctly apply the match validator after initialization
    this.repeatPasswordControl.setValidators([
      Validators.required, 
      matchValidator(this.passwordControl)
    ]);

    this.securityQuestionService.find(null).subscribe({
  next: (securityQuestions: any) => { this.securityQuestions = securityQuestions },
  error: (err) => { /* handle error if necessary */ }
})
    this.formSubmitService.attachEnterKeyHandler('registration-form', 'registerButton', () => { this.save() })
  }

  save () {
    const user = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
      passwordRepeat: this.repeatPasswordControl.value,
      securityQuestion: this.securityQuestions.find((q) => q.id === this.securityQuestionControl.value),
      securityAnswer: this.securityAnswerControl.value
    }

    this.userService.save(user).subscribe({
      next: (response: any) => {
        this.securityAnswerService.save({
          UserId: response.id,
          answer: this.securityAnswerControl.value,
          SecurityQuestionId: this.securityQuestionControl.value
        }).subscribe(() => {
          // Redirect to the main shop page instead of login
          this.ngZone.run(async () => await this.router.navigate(['/search']))
          this.snackBarHelperService.open('CONFIRM_REGISTER')
        })
      },
      error: (err) => {
        
        if (err.error?.errors) {
          const error = err.error.errors[0]
          this.error = error.message ? error.message[0].toUpperCase() + error.message.slice(1) : error
        }
      }
    })
  }
}

function matchValidator (passwordControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl) => {
    return control.value !== passwordControl.value ? { notSame: true } : null
  }
}