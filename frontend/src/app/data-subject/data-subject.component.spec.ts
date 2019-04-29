import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { DataSubjectComponent } from './data-subject.component'
import { DataSubjectService } from '../Services/data-subject.service'
import { SecurityQuestionService } from '../Services/security-question.service'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule } from '@angular/material'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { of, throwError } from 'rxjs'

describe('DataExportComponent', () => {
  let component: DataSubjectComponent
  let fixture: ComponentFixture<DataSubjectComponent>
  let securityQuestionService
  let dataSubjectService

  beforeEach(async(() => {
    dataSubjectService = jasmine.createSpyObj('DataSubjectService', ['deactivate'])
    dataSubjectService.deactivate.and.returnValue(of({}))
    securityQuestionService = jasmine.createSpyObj('SecurityQuestionService', ['findBy'])
    securityQuestionService.findBy.and.returnValue(of({}))

    TestBed.configureTestingModule({
      declarations: [DataSubjectComponent],
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot(),
        MatFormFieldModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule
      ],
      providers: [
        { provide: SecurityQuestionService, useValue: securityQuestionService },
        { provide: DataSubjectService, useValue: dataSubjectService },
        TranslateService
      ]
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataSubjectComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should compile', () => {
    expect(component).toBeTruthy()
  })

  it('should reinitizalise form by calling resetForm', () => {
    component.dataSubjectGroup.get('emailControl').setValue('email')
    component.dataSubjectGroup.get('securityQuestionControl').setValue('security question')
    component.resetForm()
    expect(component.dataSubjectGroup.get('emailControl').value).toBe('')
    expect(component.dataSubjectGroup.get('emailControl').pristine).toBe(true)
    expect(component.dataSubjectGroup.get('emailControl').untouched).toBe(true)
    expect(component.dataSubjectGroup.get('securityQuestionControl').value).toBe('')
    expect(component.dataSubjectGroup.get('securityQuestionControl').pristine).toBe(true)
    expect(component.dataSubjectGroup.get('securityQuestionControl').untouched).toBe(true)
  })

  it('should be compulsory to fill the email field', () => {
    component.dataSubjectGroup.get('emailControl').setValue('')
    expect(component.emailForm.valid).toBeFalsy()
  })

  it('should hold a valid email in the email field', () => {
    component.dataSubjectGroup.get('emailControl').setValue('aa')
    expect(component.emailForm.valid).toBeFalsy()
    component.dataSubjectGroup.get('emailControl').setValue('a@a')
    expect(component.emailForm.valid).toBe(true)
  })

  it('should be compulsory to answer to the security question', () => {
    component.dataSubjectGroup.get('securityQuestionControl').setValue('')
    expect(component.securityQuestionForm.valid).toBeFalsy()
    component.dataSubjectGroup.get('securityQuestionControl').setValue('Answer')
    expect(component.securityQuestionForm.valid).toBe(true)
  })

  it('should find the security question of a user with a known email address', () => {
    securityQuestionService.findBy.and.returnValue(of({ question: 'What is your favorite test tool?' }))
    component.dataSubjectGroup.get('emailControl').setValue('known@user.test')
    component.findSecurityQuestion()
    expect(component.securityQuestion).toBe('What is your favorite test tool?')
  })

  it('should not find the security question for an email address not bound to a user', () => {
    securityQuestionService.findBy.and.returnValue(of({}))
    component.dataSubjectGroup.get('emailControl').setValue('unknown@user.test')
    component.findSecurityQuestion()
    expect(component.securityQuestion).toBeUndefined()
  })

  it('should not have a security question when lookup by email address failed', fakeAsync(() => {
    securityQuestionService.findBy.and.returnValue(throwError('Error'))
    component.dataSubjectGroup.get('emailControl').setValue('some@user.test')
    component.findSecurityQuestion()
    expect(component.securityQuestion).toBeUndefined()
  }))

  it('should find not attempt to find security question for empty email address', () => {
    component.dataSubjectGroup.get('emailControl').setValue('')
    component.findSecurityQuestion()
    expect(securityQuestionService.findBy).not.toHaveBeenCalled()
  })
})
