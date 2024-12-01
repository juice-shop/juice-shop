// password-validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Define a variable to hold the common passwords
let commonPasswords: Set<string> | null = null;

// Function to load the common passwords from the .txt file
export function loadCommonPasswords(http: HttpClient): void {
  if (commonPasswords === null) {
    http.get('assets/10k_most_common_passwords.txt', { responseType: 'text' })
      .pipe(
        map(data => new Set(data.split('\n').map(password => password.trim()))),
        catchError(() => of(new Set<string>())) // in case of empty set
      )
      .subscribe(passwordSet => {
        commonPasswords = passwordSet;
      });
  }
}

// Custom password validator function
export function customPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.value;

    // Ensure the common passwords list is loaded before validation
    if (commonPasswords === null) {
      return null; // Skip validation until passwords are loaded
    }

    // Check if password length is between 8 and 30 characters
    const isLengthValid = password && password.length >= 8 && password.length <= 30;

    // Check if password is not a common password
    const isNotCommon = !commonPasswords.has(password);

    // Return an error object if validation fails
    if (!isLengthValid || !isNotCommon) {
      return {
        passwordRequirements: {
          length: isLengthValid,
          notCommon: isNotCommon
        }
      };
    }

    // Return null if the password meets all criteria (valid password)
    return null;
  };
}
