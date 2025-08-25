/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { FeedbackService } from '../Services/feedback.service'
import { CaptchaService } from '../Services/captcha.service'
import { UserService } from '../Services/user.service'
import { UntypedFormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { Component, type OnInit } from '@angular/core'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'
import { MatButtonModule } from '@angular/material/button'
import { MatSliderModule } from '@angular/material/slider'

import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule, MatLabel, MatHint, MatError } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'

import { MatIconModule } from '@angular/material/icon'

library.add(faStar, faPaperPlane)

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  imports: [MatCardModule, TranslateModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatLabel, MatInputModule, MatHint, MatError, MatSliderModule, MatButtonModule, MatIconModule]
})
export class ContactComponent implements OnInit {
  public authorControl: UntypedFormControl = new UntypedFormControl({ value: '', disabled: true }, [])
  public feedbackControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.maxLength(160)])
  public captchaControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.pattern('-?[\\d]*')])
  public userIdControl: UntypedFormControl = new UntypedFormControl('', [])
  public rating: number = 0
  public feedback: any = undefined
  public captcha: any
  public captchaId: any
  public confirmation: any
  public error: any

  constructor (private readonly userService: UserService, private readonly captchaService: CaptchaService, private readonly feedbackService: FeedbackService,
    private readonly formSubmitService: FormSubmitService, private readonly translate: TranslateService, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit (): void {
    this.userService.whoAmI().subscribe({
      next: (data: any) => {
        this.feedback = {}
        this.userIdControl.setValue(data.id)
        this.feedback.UserId = data.id
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.authorControl.setValue(data.email ? `***${data.email.slice(3)}` : 'anonymous')
      },
      error: (err) => {
        this.feedback = undefined
        console.log(err)
      }
    })
    this.getNewCaptcha()

    this.formSubmitService.attachEnterKeyHandler('feedback-form', 'submitButton', () => { this.save() })
  }

  getNewCaptcha () {
    this.captchaService.getCaptcha().subscribe({
      next: (data: any) => {
        this.captcha = data.captcha
        this.captchaId = data.captchaId
      },
      error: (err) => err
    })
  }

  save () {
    this.feedback.captchaId = this.captchaId
    this.feedback.captcha = this.captchaControl.value
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.feedback.comment = `${this.feedbackControl.value} (${this.authorControl.value})`
    this.feedback.rating = this.rating
    this.feedback.UserId = this.userIdControl.value
    this.feedbackService.save(this.feedback).subscribe({
      next: (savedFeedback) => {
        if (savedFeedback.rating === 5) {
          this.translate.get('FEEDBACK_FIVE_STAR_THANK_YOU').subscribe({
            next: (feedbackThankYou) => {
              this.snackBarHelperService.open(feedbackThankYou)
            },
            error: (translationId) => {
              this.snackBarHelperService.open(translationId)
            }
          })
        } else {
          this.translate.get('FEEDBACK_THANK_YOU').subscribe({
            next: (feedbackThankYou) => {
              this.snackBarHelperService.open(feedbackThankYou)
            },
            error: (translationId) => {
              this.snackBarHelperService.open(translationId)
            }
          })
        }
        this.feedback = {}
        this.ngOnInit()
        this.resetForm()
      },
      error: (err) => {
        console.log(err)
        this.snackBarHelperService.open(err.error, 'errorBar')
        this.feedback = {}
        this.resetCaptcha()
      }
    })
  }

  resetForm () {
    this.authorControl.markAsUntouched()
    this.authorControl.markAsPristine()
    this.authorControl.setValue('')
    this.feedbackControl.markAsUntouched()
    this.feedbackControl.markAsPristine()
    this.feedbackControl.setValue('')
    this.rating = 0
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }

  resetCaptcha () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }

  formatRating (value: number) {
    return `${value}★`
  }
}
