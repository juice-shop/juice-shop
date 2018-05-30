import { FormControl, Validators } from '@angular/forms'
import { UserService } from './../Services/user.service'
import { Component } from '@angular/core'
import fontawesome from '@fortawesome/fontawesome'
import { faSave } from '@fortawesome/fontawesome-free-solid'
fontawesome.library.add(faSave)

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {

  public passwordControl: FormControl = new FormControl('', [Validators.required])
  public newPasswordControl: FormControl = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)])
  public repeatNewPasswordControl: FormControl = new FormControl('', [Validators.required])
  public error: any
  public confirmation: any

  constructor (private userService: UserService) { }

  changePassword () {
    this.userService.changePassword({
      current: this.passwordControl.value,
      new: this.newPasswordControl.value,
      repeat: this.repeatNewPasswordControl.value
    }).subscribe((response: any) => {
      this.error = undefined
      this.confirmation = 'Your password was successfully changed.'
      this.resetForm()
    }, (error) => {
      console.log(error)
      this.error = error
      this.confirmation = undefined
      this.resetForm()
    })
  }

  resetForm () {
    this.passwordControl.setValue('')
    this.passwordControl.markAsPristine()
    this.passwordControl.markAsUntouched()
    this.newPasswordControl.setValue('')
    this.newPasswordControl.markAsPristine()
    this.newPasswordControl.markAsUntouched()
    this.repeatNewPasswordControl.setValue('')
    this.repeatNewPasswordControl.markAsPristine()
    this.repeatNewPasswordControl.markAsUntouched()
  }

}
