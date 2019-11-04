import { TranslateModule } from '@ngx-translate/core'
import { UserService } from '../Services/user.service'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { async, ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing'
import { ChangePasswordComponent } from './change-password.component'
import { ReactiveFormsModule } from '@angular/forms'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatCardModule } from '@angular/material/card'
import { of, throwError } from 'rxjs'

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent
  let fixture: ComponentFixture<ChangePasswordComponent>
  let userService: any

  beforeEach(async(() => {

    userService = jasmine.createSpyObj('UserService',['changePassword'])
    userService.changePassword.and.returnValue(of({}))

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
      ],
      declarations: [ ChangePasswordComponent ],
      providers: [ { provide: UserService, useValue: userService } ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should be compulsory to give password', () => {
    component.passwordControl.setValue('')
    expect(component.passwordControl.valid).toBeFalsy()
    component.passwordControl.setValue('pass')
    expect(component.passwordControl.valid).toBe(true)
  })

  it('length of new password must be 5-20 characters', () => {
    component.newPasswordControl.setValue('old')
    expect(component.newPasswordControl.valid).toBeFalsy()
    component.newPasswordControl.setValue('new password')
    expect(component.newPasswordControl.valid).toBe(true)
    component.newPasswordControl.setValue('new password new password')
    expect(component.newPasswordControl.valid).toBeFalsy()
  })

  it('should be compulsory to repeat new password', () => {
    component.repeatNewPasswordControl.setValue('')
    expect(component.passwordControl.valid).toBeFalsy()
    component.newPasswordControl.setValue('passed')
    component.repeatNewPasswordControl.setValue('passed')
    expect(component.repeatNewPasswordControl.valid).toBe(true)
  })

  it('should reinitizalise forms by calling resetForm', () => {
    component.passwordControl.setValue('password')
    component.newPasswordControl.setValue('newPassword')
    component.repeatNewPasswordControl.setValue('newPassword')
    component.resetForm()
    expect(component.passwordControl.value).toBe('')
    expect(component.passwordControl.pristine).toBe(true)
    expect(component.passwordControl.untouched).toBe(true)
    expect(component.newPasswordControl.value).toBe('')
    expect(component.newPasswordControl.pristine).toBe(true)
    expect(component.newPasswordControl.untouched).toBe(true)
    expect(component.repeatNewPasswordControl.value).toBe('')
    expect(component.repeatNewPasswordControl.pristine).toBe(true)
    expect(component.repeatNewPasswordControl.untouched).toBe(true)
  })

  it('should clear form and show confirmation after changing password', () => {
    userService.changePassword.and.returnValue(of({}))
    spyOn(component,'resetForm')
    component.passwordControl.setValue('old')
    component.newPasswordControl.setValue('foobar')
    component.repeatNewPasswordControl.setValue('foobar')
    component.changePassword()
    expect(component.error).toBeUndefined()
    expect(component.confirmation).toBeDefined()
    expect(component.resetForm).toHaveBeenCalled()
  })

  it('should clear form and gracefully handle error on password change', fakeAsync(() => {
    userService.changePassword.and.returnValue(throwError('Error'))
    spyOn(component,'resetPasswords')
    console.log = jasmine.createSpy('log')
    component.passwordControl.setValue('old')
    component.newPasswordControl.setValue('foobar')
    component.repeatNewPasswordControl.setValue('fooabar')
    component.changePassword()
    expect(component.confirmation).toBeUndefined()
    expect(component.error).toBe('Error')
    expect(console.log).toHaveBeenCalledWith('Error')
    expect(component.resetPasswords).toHaveBeenCalled()
  }))
})
