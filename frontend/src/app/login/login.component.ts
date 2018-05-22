import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import fontawesome from '@fortawesome/fontawesome';
import { UserService } from 'src/app/Services/user.service';
import { faKey } from '@fortawesome/fontawesome-free-solid';
import { faGoogle } from '@fortawesome/fontawesome-free-brands';
fontawesome.library.add(faKey, faGoogle);

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public emailControl = new FormControl('', [ Validators.required]);
  public passwordControl = new FormControl('', [ Validators.required]);
  public user: any;
  public rememberMe: boolean;
  public error: any;
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    const email = localStorage.getItem('email');
    if (email) {
      this.user = {};
      this.user.email = email;
      this.rememberMe = true;
    } else {
      this.rememberMe = false;
    }
  }

  login () {

    this.userService.login(this.user).subscribe((authentication: any) => {
      localStorage.setItem('token', authentication.token);
      sessionStorage.bid = authentication.bid;
      /*Use userService to notifiy if user has logged in*/
      /*this.userService.isLoggedIn = true;*/
      this.router.navigate(['/']);
    }, (error) => {
      console.log(error);
      localStorage.removeItem('token');
      delete sessionStorage.bid;
      this.error = error;
      /* Use userService to notify user failed to log in */
      /*this.userServe.isLoggedIn = false;*/
      this.emailControl.markAsPristine();
      this.passwordControl.markAsPristine();
    });

    if (this.rememberMe) {
      localStorage.setItem('email', this.user.email);
    } else {
      localStorage.removeItem('email');
    }

  }

}
