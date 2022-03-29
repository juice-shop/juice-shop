/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { FeedbackService } from '../Services/feedback.service'
import { CaptchaService } from '../Services/captcha.service'
import { UserService } from '../Services/user.service'
import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'
import { TranslateService } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faStar, faPaperPlane)
dom.watch()

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  public authorControl: FormControl = new FormControl({ value: '', disabled: true }, [])
  public feedbackControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(160)])
  public captchaControl: FormControl = new FormControl('', [Validators.required, Validators.pattern('-?[\\d]*')])
  public userIdControl: FormControl = new FormControl('', [])
  public rating: number = 0
  public feedback: any = undefined
  public captcha: any
  public captchaId: any
  public confirmation: any
  public error: any

  constructor (private readonly userService: UserService, private readonly captchaService: CaptchaService, private readonly feedbackService: FeedbackService,
    private readonly formSubmitService: FormSubmitService, private readonly translate: TranslateService, private readonly snackBarHelperService: SnackBarHelperService) { }

  ngOnInit () {
    this.userService.whoAmI().subscribe((data: any) => {
      this.feedback = {}
      this.userIdControl.setValue(data.id)
      this.feedback.UserId = data.id
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      this.authorControl.setValue(data.email ? `***${data.email.slice(3)}` : 'anonymous')
    }, (err) => {
      this.feedback = undefined
      console.log(err)
    })
    this.getNewCaptcha()

    this.formSubmitService.attachEnterKeyHandler('feedback-form', 'submitButton', () => this.save())
  }

  getNewCaptcha () {
    this.captchaService.getCaptcha().subscribe((data: any) => {
      this.captcha = data.captcha
      this.captchaId = data.captchaId
    }, (err) => err)
  }

  save () {
    this.feedback.captchaId = this.captchaId
    this.feedback.captcha = this.captchaControl.value
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    this.feedback.comment = `${this.feedbackControl.value} (${this.authorControl.value})`
    this.feedback.rating = this.rating
    this.feedback.UserId = this.userIdControl.value
    this.feedbackService.save(this.feedback).subscribe((savedFeedback) => {
      if (savedFeedback.rating === 5) {
        this.translate.get('FEEDBACK_FIVE_STAR_THANK_YOU').subscribe((feedbackThankYou) => {
          this.snackBarHelperService.open(feedbackThankYou)
        }, (translationId) => {
          this.snackBarHelperService.open(translationId)
        })
      } else {
        this.translate.get('FEEDBACK_THANK_YOU').subscribe((feedbackThankYou) => {
          this.snackBarHelperService.open(feedbackThankYou)
        }, (translationId) => {
          this.snackBarHelperService.open(translationId)
        })
      }
      this.feedback = {}
      this.ngOnInit()
      this.resetForm()
    }, (err) => {
      console.log(err)
      this.snackBarHelperService.open(err.error, 'errorBar')
      this.feedback = {}
      this.resetCaptcha()
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
