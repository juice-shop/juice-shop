import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function commonPasswordValidator(commonPasswords: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;
    if (commonPasswords.includes(password)) {
      return { commonPassword: true }; // Validation error if password is common
    }
    return null; // No error if password is valid
  };
}
