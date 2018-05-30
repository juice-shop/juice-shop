import { environment } from './../../environments/environment'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { map, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private hostServer = environment.hostServer
  private host = this.hostServer + '/api/Users'

  constructor (private http: HttpClient) { }

  find (params) {
    return this.http.get(this.hostServer + '/rest/user/authentication-details/', { params: params }).pipe(map((response: any) =>
    response.data))
  }

  get (id) {
    return this.http.get(this.host + '/' + id).pipe(map((response: any) => response.data))
  }

  save (params) {
    return this.http.post(this.host + '/', params).pipe(
      map((response: any) => response.data),
      catchError((err) => err)
    )
  }

  login (params) {
    return this.http.post(this.hostServer + '/rest/user/login', params).pipe(map((response: any) => response.authentication))
  }

  changePassword (passwords) {
    return this.http.get(this.hostServer + '/rest/user/change-password?current=' + passwords.current + '&new=' +
    passwords.new + '&repeat=' + passwords.repeat).pipe(map((response: any) => response.user), catchError((err) => { throw err.error }))
  }

  resetPassword (params) {
    return this.http.post(this.hostServer + '/rest/user/reset-password', params).pipe(map((response: any) => response.user))
  }

  whoAmI () {
    return this.http.get(this.hostServer + '/rest/user/whoami').pipe(map((response: any) => response.user))
  }

  oauthLogin (accessToken) {
    return this.http.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken)
  }

}
