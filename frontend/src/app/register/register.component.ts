import { SecurityAnswerService } from '../Services/security-answer.service'
import { UserService } from '../Services/user.service'
import { FormControl, Validators, AbstractControl } from '@angular/forms'
import { Component, OnInit } from '@angular/core'
import { SecurityQuestionService } from '../Services/security-question.service'
import { Router } from '@angular/router'
import { library, dom } from '@fortawesome/fontawesome-svg-core'

import { faUserPlus, faExclamationCircle } from '@fortawesome/free-solid-svg-icons'
import { FormSubmitService } from '../Services/form-submit.service'

library.add(faUserPlus, faExclamationCircle)
dom.watch()

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public emailControl: FormControl = new FormControl('', [Validators.required, Validators.email])
  public passwordControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)])
  public repeatPasswordControl: FormControl = new FormControl('', [Validators.required, matchValidator(this.passwordControl)])
  public securityQuestionControl: FormControl = new FormControl('', [Validators.required])
  public securityAnswerControl: FormControl = new FormControl('', [Validators.required])
  public securityQuestions: any[]
  public selected
  public error: string

  constructor (private securityQuestionService: SecurityQuestionService,
    private userService: UserService,
    private securityAnswerService: SecurityAnswerService,
    private router: Router,
    private formSubmitService: FormSubmitService) { }

  ngOnInit () {
    this.securityQuestionService.find(null).subscribe((securityQuestions: any) => {
      this.securityQuestions = securityQuestions
    }, (err) => console.log(err))

    this.formSubmitService.attachEnterKeyHandler('registration-form', 'registerButton', () => this.save())
  }

  save () {
    const user = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
      passwordRepeat: this.repeatPasswordControl.value,
      securityQuestion: this.securityQuestions.find((question) => question.id === this.securityQuestionControl.value),
      securityAnswer: this.securityAnswerControl.value
    }

    this.userService.save(user).subscribe((response: any) => {
      this.securityAnswerService.save({UserId: response.id, answer: this.securityAnswerControl.value,
        SecurityQuestionId: this.securityQuestionControl.value}).subscribe(() => {
          this.router.navigate(['/login'])
        })
    }, (err) => {
      console.log(err)
      if (err.error && err.error.errors && err.error.errors[0].message) {
        const errorMessage = err.error.errors[0].message
        this.error = errorMessage[0].toUpperCase() + errorMessage.slice(1)
      }
    }
    )
  }

}

function matchValidator (passwordControl: AbstractControl) {
  return function matchOtherValidate (repeatPasswordControl: FormControl) {
    let password = passwordControl.value
    let passwordRepeat = repeatPasswordControl.value
    if (password !== passwordRepeat) {
      return { notSame: true }
    }
    return null
  }
}
