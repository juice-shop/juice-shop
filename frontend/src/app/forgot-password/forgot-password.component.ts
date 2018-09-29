import { UserService } from './../Services/user.service'
import { SecurityQuestionService } from './../Services/security-question.service'
import { FormControl, Validators } from '@angular/forms'
import { Component } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faSave } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faSave)

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  public emailControl: FormControl = new FormControl('', [Validators.required, Validators.email])
  public securityQuestionControl: FormControl = new FormControl('', [Validators.required])
  public passwordControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)])
  public repeatPasswordControl: FormControl = new FormControl('', [Validators.required])
  public securityQuestion = undefined
  public error
  public confirmation

  constructor (private securityQuestionService: SecurityQuestionService, private userService: UserService) { }

  findSecurityQuestion () {
    this.securityQuestion = undefined
    if (this.emailControl.value) {
      this.securityQuestionService.findBy(this.emailControl.value).subscribe((securityQuestion: any) => {
        if (securityQuestion) {
          this.securityQuestion = securityQuestion.question
        }
      },
      (error) => error
      )
    }
  }

  resetPassword () {
    this.userService.resetPassword({email: this.emailControl.value, answer: this.securityQuestionControl.value,
      new: this.passwordControl.value, repeat: this.repeatPasswordControl.value}).subscribe(() => {
        this.error = undefined
        this.confirmation = 'Your password was successfully changed.'
        this.resetForm()
      }, (error) => {
        this.error = error.error
        this.confirmation = undefined
        this.resetForm()
      })
  }

  resetForm () {
    this.emailControl.setValue('')
    this.emailControl.markAsPristine()
    this.emailControl.markAsUntouched()
    this.securityQuestionControl.setValue('')
    this.securityQuestionControl.markAsPristine()
    this.securityQuestionControl.markAsUntouched()
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.repeatPasswordControl.setValue('')
    this.repeatPasswordControl.markAsPristine()
    this.repeatPasswordControl.markAsUntouched()
  }

}
