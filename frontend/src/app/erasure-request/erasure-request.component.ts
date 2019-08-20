import { SecurityQuestionService } from '../Services/security-question.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie'
import { Router } from '@angular/router'
import { Component, OnInit, NgZone } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle, faStar } from '@fortawesome/free-solid-svg-icons'
import { TranslateService } from '@ngx-translate/core'
import { SnackBarHelperService } from '../Services/snack-bar-helper.service'

library.add(faStar, faExclamationTriangle)
dom.watch()

@Component({
  selector: 'app-erasure-request',
  templateUrl: './erasure-request.component.html',
  styleUrls: ['./erasure-request.component.scss']
})
export class ErasureRequestComponent implements OnInit {
  public dataSubjectGroup: FormGroup = new FormGroup({
    emailControl: new FormControl('', [Validators.required, Validators.email]),
    securityQuestionControl: new FormControl('', [Validators.required])
  })
  public securityQuestion?: string
  public error?: string
  public applicationName = 'OWASP Juice Shop'

  constructor (private securityQuestionService: SecurityQuestionService, private dataSubjectService: DataSubjectService, private ngZone: NgZone, private router: Router, private cookieService: CookieService, private userService: UserService, private translateService: TranslateService, private snackBar: MatSnackBar, private snackBarHelperService: SnackBarHelperService) { }
  ngOnInit () {
    this.findSecurityQuestion()
  }

  get emailForm (): any {
    return this.dataSubjectGroup.get('emailControl')
  }

  get securityQuestionForm (): any {
    return this.dataSubjectGroup.get('securityQuestionControl')
  }

  findSecurityQuestion () {
    this.securityQuestion = undefined
    if (this.emailForm.value) {
      this.securityQuestionService.findBy(this.emailForm.value).subscribe((securityQuestion: any) => {
        if (securityQuestion) {
          this.securityQuestion = securityQuestion.question
        }
      },
      (error) => error
      )
    }
  }

  save () {
    this.dataSubjectService.erase({ email: this.emailForm.value, securityAnswer: this.securityQuestionForm.value }).subscribe((response: any) => {
      this.error = undefined
      this.logout()
    }, (error) => {
      this.error = error.message
      this.resetForm()
    })
  }

  logout () {
    this.userService.saveLastLoginIp().subscribe((user: any) => { this.noop() }, (err) => console.log(err))
    localStorage.removeItem('token')
    this.cookieService.remove('token')
    sessionStorage.removeItem('bid')
    this.userService.isLoggedIn.next(false)
    this.router.navigate(['/'])
    this.snackBarHelperService.openSnackBar('CONFIRM_ERASURE_REQUEST', 'Ok')
  }

  // tslint:disable-next-line:no-empty
  noop () { }

  resetForm () {
    this.emailForm.markAsUntouched()
    this.emailForm.markAsPristine()
    this.emailForm.setValue('')
    this.securityQuestionForm.markAsUntouched()
    this.securityQuestionForm.markAsPristine()
    this.securityQuestionForm.setValue('')
  }
}
