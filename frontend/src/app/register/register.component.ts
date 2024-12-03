import { Component, NgZone, OnInit, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { SecurityQuestionService } from '../Services/security-question.service';
import { UserService } from '../Services/user.service';
import { SecurityAnswerService } from '../Services/security-answer.service';
import { Router } from '@angular/router';
import { FormSubmitService } from '../Services/form-submit.service';
import { SnackBarHelperService } from '../Services/snack-bar-helper.service';
import { TranslateService } from '@ngx-translate/core';
import { commonPasswordValidator } from './custom-password-validator';
import { SecurityQuestion } from '../Models/securityQuestion.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  public passwordVisible: boolean = false; // Password visibility toggle
  public emailControl: UntypedFormControl = new UntypedFormControl('', [Validators.required, Validators.email]);
  public passwordControl: UntypedFormControl = new UntypedFormControl('', [
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
    ]), // Custom common password validator
  ]);
  public repeatPasswordControl: UntypedFormControl = new UntypedFormControl('', [
    Validators.required,
    matchValidator(this.passwordControl),
  ]);
  public securityQuestionControl: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  public securityAnswerControl: UntypedFormControl = new UntypedFormControl('', [Validators.required]);
  public securityQuestions!: SecurityQuestion[];
  public selected?: number;
  public error: string | null = null;
  public checkingCommonness: boolean = false;

  constructor(
    private cdr: ChangeDetectorRef,
    private readonly securityQuestionService: SecurityQuestionService,
    private readonly userService: UserService,
    private readonly securityAnswerService: SecurityAnswerService,
    private readonly router: Router,
    private readonly formSubmitService: FormSubmitService,
    private readonly translateService: TranslateService,
    private readonly snackBarHelperService: SnackBarHelperService,
    private readonly ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Ensure the password controls are revalidated dynamically
    this.passwordControl.valueChanges.subscribe(() => {
      this.passwordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    this.repeatPasswordControl.valueChanges.subscribe(() => {
      this.repeatPasswordControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    });

    // Force update for proper initialization
    setTimeout(() => {
      this.cdr.detectChanges();
    });

    this.securityQuestionService.find(null).subscribe(
      (securityQuestions: SecurityQuestion[]) => {
        this.securityQuestions = securityQuestions;
      },
      (err) => {
        console.error(err);
      }
    );

    this.formSubmitService.attachEnterKeyHandler('registration-form', 'registerButton', () => {
      this.save();
    });
  }

  save(): void {
    const user = {
      email: this.emailControl.value,
      password: this.passwordControl.value,
      passwordRepeat: this.repeatPasswordControl.value,
      securityQuestion: this.securityQuestions.find(
        (question) => question.id === this.securityQuestionControl.value
      ),
      securityAnswer: this.securityAnswerControl.value,
    };

    this.userService.save(user).subscribe(
      (response: any) => {
        this.securityAnswerService
          .save({
            UserId: response.id,
            answer: this.securityAnswerControl.value,
            SecurityQuestionId: this.securityQuestionControl.value,
          })
          .subscribe(() => {
            this.ngZone.run(async () => await this.router.navigate(['/login']));
            this.snackBarHelperService.open('CONFIRM_REGISTER');
          });
      },
      (err) => {
        console.error(err);
        if (err.error?.errors) {
          const error = err.error.errors[0];
          if (error.message) {
            this.error = error.message[0].toUpperCase() + error.message.slice(1);
          } else {
            this.error = error;
          }
        }
      }
    );
  }
}

// Custom validator to match passwords
function matchValidator(passwordControl: UntypedFormControl) {
  return (repeatPasswordControl: UntypedFormControl) => {
    const password = passwordControl.value;
    const repeatPassword = repeatPasswordControl.value;
    if (password !== repeatPassword) {
      return { notSame: true };
    }
    return null;
  };
}
