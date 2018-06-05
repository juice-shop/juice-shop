import { FeedbackService } from './../Services/feedback.service'
import { CaptchaService } from './../Services/captcha.service'
import { UserService } from './../Services/user.service'
import { FormControl, Validators } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faStar, faPaperPlane } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faStar, faPaperPlane)

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  public authorControl: FormControl = new FormControl({ value: '', disabled: true }, [])
  public feedbackControl: FormControl = new FormControl('', [Validators.required, Validators.maxLength(160)])
  public captchaControl: FormControl = new FormControl('', [Validators.required])
  public rating: number = 0
  public feedback: any
  public captcha: any
  public captchaId: any
  public confirmation: any
  public error: any

  constructor (private userService: UserService, private captchaService: CaptchaService, private feedbackService: FeedbackService) { }

  ngOnInit () {
    this.userService.whoAmI().subscribe((data: any) => {
      this.feedback = {}
      this.feedback.UserId = data.id
      this.authorControl.setValue(data.email || 'anonymous')
    }, (err) => err)
    this.getNewCaptcha()
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
    this.feedbackService.save(this.feedback).subscribe((savedFeedback) => {
      this.error = null
      this.confirmation = 'Thank you for your feedback' + (savedFeedback.rating === 5 ? ' and your 5-star rating!' : '.')
      this.feedback = {}
      this.getNewCaptcha()
      this.resetForm()
    }, (error) => {
      this.error = error.error
      this.confirmation = null
      this.feedback = {}
      this.resetForm()
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

}
