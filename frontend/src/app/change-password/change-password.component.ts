import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { UserService } from '../Services/user.service';
import { FormSubmitService } from '../Services/form-submit.service';
import { TranslateService } from '@ngx-translate/core';
import { commonPasswordValidator } from '../register/custom-password-validator';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  public passwordControl = new UntypedFormControl('', [Validators.required]); // Current password
  public newPasswordControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.maxLength(30),
    commonPasswordValidator([
      '12345678',
      'password',
      '123456789',
      'qwertyuiop',
      'letmein123',
      'admin123',
      'iloveyou',
      'welcome1',
      'sunshine',
      'football',
    ]), // Custom validator for common passwords
  ]);
  public repeatNewPasswordControl = new UntypedFormControl('', [
    Validators.required,
    matchValidator(this.newPasswordControl), // Match new password validator
  ]);

  public error: any;
  public confirmation: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly userService: UserService,
    private readonly formSubmitService: FormSubmitService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Revalidate dynamically as the user types
    this.newPasswordControl.valueChanges.subscribe(() => {
      this.newPasswordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.repeatNewPasswordControl.valueChanges.subscribe(() => {
      this.repeatNewPasswordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    // Ensure proper initialization
    setTimeout(() => {
      this.cdr.detectChanges();
    });

    this.formSubmitService.attachEnterKeyHandler('password-form', 'changeButton', () => {
      this.changePassword();
    });
  }

  changePassword(): void {
    if (this.passwordControl.invalid || this.newPasswordControl.invalid || this.repeatNewPasswordControl.invalid) {
      console.error('Form is invalid. Correct the errors before submitting.');
      return;
    }

    const passwordData = {
      current: this.passwordControl.value,
      new: this.newPasswordControl.value,
      repeat: this.repeatNewPasswordControl.value,
    };

    this.userService.changePassword(passwordData).subscribe(
      (response: any) => {
        this.error = undefined;
        this.translate.get('PASSWORD_SUCCESSFULLY_CHANGED').subscribe(
          (successMessage) => {
            this.confirmation = successMessage;
          },
          (translationId) => {
            this.confirmation = { error: translationId };
          }
        );
        this.resetForm();
      },
      (error) => {
        console.error(error);
        this.error = error;
        this.confirmation = undefined;
        this.resetPasswords();
      }
    );
  }

  resetForm(): void {
    this.passwordControl.setValue('');
    this.resetPasswords();
  }

  resetPasswords(): void {
    [this.passwordControl, this.newPasswordControl, this.repeatNewPasswordControl].forEach((control) => {
      control.setValue('');
      control.markAsPristine();
      control.markAsUntouched();
    });
  }
}

// Custom validator to match passwords
function matchValidator(newPasswordControl: UntypedFormControl) {
  return (repeatNewPasswordControl: UntypedFormControl) => {
    const password = newPasswordControl.value;
    const repeatPassword = repeatNewPasswordControl.value;
    if (password !== repeatPassword) {
      return { notSame: true };
    }
    return null;
  };
}
