import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {

  /*var host = '/rest/captcha'

  function getCaptcha () {
    var captchaString = $q.defer()
    $http.get(host + '/').then(function (response) {
      captchaString.resolve(response.data)
    }).catch(function (response) {
      captchaString.reject(response.data)
    })
    return captchaString.promise
  }*/

  private hostServer = environment.hostServer;
  private host = this.hostServer + '/rest/captcha';

  constructor(private http: HttpClient) { }

  getCaptcha () {
    return this.http.get(this.host + '/').pipe(catchError((err) => err));
  }
}
