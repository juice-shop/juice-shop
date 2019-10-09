import { FeedbackService } from '../Services/feedback.service'
import { CaptchaService } from '../Services/captcha.service'
import { UserService } from '../Services/user.service'
import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faPaperPlane, faStar } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'

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

  constructor (private userService: UserService, private captchaService: CaptchaService, private feedbackService: FeedbackService, private formSubmitService: FormSubmitService) { }

  ngOnInit () {
    this.userService.whoAmI().subscribe((data: any) => {
      this.feedback = {}
      this.userIdControl.setValue(data.id)
      this.feedback.UserId = data.id
      this.authorControl.setValue(data.email || 'anonymous')
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
    this.feedback.comment = this.feedbackControl.value
    this.feedback.rating = this.rating
    this.feedback.UserId = this.userIdControl.value
    this.feedbackService.save(this.feedback).subscribe((savedFeedback) => {
      this.error = null
      this.confirmation = 'Thank you for your feedback' + (savedFeedback.rating === 5 ? ' and your 5-star rating!' : '.')
      this.feedback = {}
      this.ngOnInit()
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
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
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }

  resetCaptcha () {
    this.captchaControl.markAsUntouched()
    this.captchaControl.markAsPristine()
    this.captchaControl.setValue('')
  }

}
