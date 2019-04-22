import { SecurityQuestionService } from '../Services/security-question.service'
import { DataSubjectService } from '../Services/data-subject.service'
import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faExclamationTriangle, faStar } from '@fortawesome/free-solid-svg-icons'

library.add(faStar, faExclamationTriangle)
dom.watch()

interface EmailFormFields {
  emailControl: string
}

@Component({
  selector: 'app-data-subject',
  templateUrl: './data-subject.component.html',
  styleUrls: ['./data-subject.component.scss']
})
export class DataSubjectComponent implements OnInit {
  public securityQuestionGroup: FormGroup = new FormGroup({
    securityQuestionControl: new FormControl('', [Validators.required])
  })
  public emailGroup: FormGroup = new FormGroup({
    emailControl: new FormControl('', [Validators.required, Validators.email])
  })
  public securityQuestion = undefined
  public error
  public confirmation

  constructor (private securityQuestionService: SecurityQuestionService, private dataSubjectService: DataSubjectService) { }
  ngOnInit () {
    this.findSecurityQuestion()
  }

  findSecurityQuestion () {
    const emailFields: EmailFormFields = this.emailGroup.value
    this.securityQuestion = undefined
    if (emailFields.emailControl) {
      this.securityQuestionService.findBy(emailFields.emailControl).subscribe((securityQuestion: any) => {
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
    }, (error) => {
      this.confirmation = undefined
      this.error = error.error
    })
  }
}
