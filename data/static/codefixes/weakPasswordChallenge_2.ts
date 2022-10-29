export class LoginComponent implements OnInit {
  public emailControl = new UntypedFormControl('', [Validators.required])

  public passwordControl = new UntypedFormControl('', [
    Validators.required,
    Validators.minLength(8),
    validatePasswordHasAtLeastOneNumber(),
    validatePasswordHasAtLeastOneSpecialChar(),
    validatePasswordHasAtLeastOneUpperCaseChar(),
    validatePasswordHasAtLeastOneLowerCaseChar(),
  ])

  public hide = true
  public user: any
  public rememberMe: UntypedFormControl = new UntypedFormControl(false)
  public error: any
  public clientId = '1005568560502-6hm16lef8oh46hr2d98vf2ohlnj4nfhq.apps.googleusercontent.com'
  public oauthUnavailable: boolean = true
  public redirectUri: string = ''