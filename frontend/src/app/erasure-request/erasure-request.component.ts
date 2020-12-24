/*
 * Copyright (c) 2014-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

import { SecurityQuestionService } from '../Services/security-question.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { UserService } from '../Services/user.service'
import { CookieService } from 'ngx-cookie-service'
import { Router } from '@angular/router'
import { Component, NgZone, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { dom, library } from '@fortawesome/fontawesome-svg-core'
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

  constructor (private readonly securityQuestionService: SecurityQuestionService, private readonly dataSubjectService: DataSubjectService, private readonly ngZone: NgZone, private readonly router: Router, private readonly cookieService: CookieService, private readonly userService: UserService, private readonly translateService: TranslateService, private readonly snackBar: MatSnackBar, private readonly snackBarHelperService: SnackBarHelperService) { }
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
    this.cookieService.delete('token', '/')
    sessionStorage.removeItem('bid')
    this.userService.isLoggedIn.next(false)
    this.ngZone.run(async () => await this.router.navigate(['/']))
    this.snackBarHelperService.open('CONFIRM_ERASURE_REQUEST')
  }

  // eslint-disable-next-line no-empty, @typescript-eslint/no-empty-function
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
