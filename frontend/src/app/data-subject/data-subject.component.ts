import { SecurityQuestionService } from '../Services/security-question.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { Component, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle, faStar } from '@fortawesome/free-solid-svg-icons'

library.add(faStar, faExclamationTriangle)
dom.watch()

@Component({
  selector: 'app-data-subject',
  templateUrl: './data-subject.component.html',
  styleUrls: ['./data-subject.component.scss']
})
export class DataSubjectComponent implements OnInit {
  public securityQuestionControl: FormControl = new FormControl('', [Validators.required])
  public securityQuestion = undefined
  public emailControl: FormControl = new FormControl('', [Validators.required, Validators.email])
  public error
  public confirmation

  constructor (private securityQuestionService: SecurityQuestionService, private dataSubjectService: DataSubjectService) { }
  ngOnInit () {
    this.findSecurityQuestion()
  }

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

  save () {
    this.dataSubjectService.deactivate().subscribe((response: any) => {
      this.error = undefined
      this.confirmation = 'The account details have been successfully erased. Changes will take effect from new login.'
      this.resetForm()
    }, (error) => {
      this.confirmation = undefined
      this.error = error.error
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
  }

}
